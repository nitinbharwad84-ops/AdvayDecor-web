import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/mail';
import { formatCurrency } from '@/lib/utils';
import { createShiprocketOrder } from '@/lib/shiprocket';

/**
 * Confirm a Razorpay payment — called by the client OR the webhook.
 * This is IDEMPOTENT: calling it twice on the same order is safe.
 * 
 * It transitions an order from "Awaiting Payment" → "Pending" (confirmed).
 * It also deducts stock and sends the confirmation email.
 */
export async function POST(request: Request) {
    try {
        const { order_id, razorpay_payment_id } = await request.json();

        if (!order_id) {
            return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Fetch the order
        const { data: order, error: orderError } = await admin
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            console.error('Confirm payment: order not found', order_id);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // IDEMPOTENT: If already confirmed, just return success
        if (order.status !== 'Awaiting Payment') {
            return NextResponse.json({
                success: true,
                order_id: order.id,
                already_confirmed: true,
            });
        }

        // Update order status to "Pending" (confirmed) and store payment ID
        const { error: updateError } = await admin
            .from('orders')
            .update({
                status: 'Pending',
                razorpay_payment_id: razorpay_payment_id || null,
            })
            .eq('id', order_id);

        if (updateError) {
            console.error('Confirm payment: update failed', updateError);
            return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 });
        }

        // Fetch order items for stock deduction and email
        const { data: orderItems } = await admin
            .from('order_items')
            .select('*')
            .eq('order_id', order_id);

        // ========================================================
        // DEDUCT STOCK (now that payment is confirmed)
        // ========================================================
        try {
            for (const item of (orderItems || [])) {
                if (item.variant_id) {
                    await admin.rpc('decrement_stock', {
                        p_variant_id: item.variant_id,
                        p_quantity: item.quantity,
                    });
                }
            }
        } catch (stockErr) {
            console.warn('Stock deduction warning (payment confirmed, admin can reconcile):', stockErr);
        }

        // ========================================================
        // SEND CONFIRMATION EMAIL
        // ========================================================
        try {
            const shipping = order.shipping_address;
            const guestInfo = order.guest_info;
            const customerEmail = guestInfo?.email;
            const customerName = guestInfo?.name || 'Customer';

            if (customerEmail) {
                const itemsHtml = (orderItems || []).map((item: any) => `
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0ece4;">
                            <div style="font-weight: 600; color: #0a0a23;">${item.product_title}</div>
                            ${item.variant_name ? `<div style="font-size: 12px; color: #9e9eb8;">${item.variant_name}</div>` : ''}
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0ece4; text-align: center; color: #0a0a23;">x${item.quantity}</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0ece4; text-align: right; font-weight: 600; color: #0a0a23;">${formatCurrency(item.total_price)}</td>
                    </tr>
                `).join('');

                const subtotal = (orderItems || []).reduce((sum: number, i: any) => sum + i.total_price, 0);

                await sendEmail({
                    to: customerEmail,
                    subject: `Order Confirmed - #${order.id.substring(0, 8).toUpperCase()}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #0a0a23; max-width: 600px; margin: auto; border: 1px solid #e8e4dc; border-radius: 12px;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <h2 style="color: #00b4d8; margin-bottom: 8px;">Thank you for your order!</h2>
                                <p style="color: #64648b; margin-top: 0;">Hi ${customerName}, we've received your payment and your order is confirmed.</p>
                            </div>

                            <div style="background: #fdfbf7; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                                <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #e8e4dc; padding-bottom: 10px;">Order Summary</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="font-size: 12px; color: #9e9eb8; text-transform: uppercase;">
                                            <th style="text-align: left; padding-bottom: 8px;">Item</th>
                                            <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                                            <th style="text-align: right; padding-bottom: 8px;">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="2" style="padding: 12px 0 4px; text-align: right; color: #64648b;">Subtotal:</td>
                                            <td style="padding: 12px 0 4px; text-align: right;">${formatCurrency(subtotal)}</td>
                                        </tr>
                                        ${order.discount_amount > 0 ? `
                                        <tr>
                                            <td colspan="2" style="padding: 4px 0; text-align: right; color: #16a34a;">Discount:</td>
                                            <td style="padding: 4px 0; text-align: right; color: #16a34a;">-${formatCurrency(order.discount_amount)}</td>
                                        </tr>
                                        ` : ''}
                                        <tr>
                                            <td colspan="2" style="padding: 4px 0; text-align: right; color: #64648b;">Shipping:</td>
                                            <td style="padding: 4px 0; text-align: right;">${formatCurrency(order.shipping_fee || 0)}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" style="padding: 12px 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #0a0a23;">Total:</td>
                                            <td style="padding: 12px 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #00b4d8;">${formatCurrency(order.total_amount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            ${shipping ? `
                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 16px; margin-bottom: 12px;">Delivery Address</h3>
                                <p style="font-size: 14px; color: #64648b; line-height: 1.6; margin: 0;">
                                    ${shipping.full_name}<br>
                                    ${shipping.address_line1}${shipping.address_line2 ? `, ${shipping.address_line2}` : ''}<br>
                                    ${shipping.city}, ${shipping.state} ${shipping.pincode}<br>
                                    Phone: ${shipping.phone}
                                </p>
                            </div>
                            ` : ''}

                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}" 
                                   style="background-color: #00b4d8; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(0,180,216,0.2);">
                                    View Full Order Details
                                </a>
                            </div>

                            <div style="text-align: center; background: #f8fafc; color: #0a0a23; padding: 15px; border-radius: 8px; border: 1px solid #f0ece4;">
                                <p style="margin: 0; font-weight: 600;">Payment Method: Online Payment ✓</p>
                            </div>

                            <hr style="border: none; border-top: 1px solid #f0ece4; margin: 24px 0;" />
                            <p style="font-size: 12px; color: #9e9eb8; text-align: center;">If you have any questions, please contact us at hello@advaydecor.com</p>
                            <p style="font-size: 12px; color: #9e9eb8; text-align: center;">© 2026 AdvayDecor. All rights reserved.</p>
                        </div>
                    `,
                });
            }
        } catch (mailErr) {
            console.error('Payment confirmation email error:', mailErr);
        }

        // ========================================================
        // AUTO-SYNC TO SHIPROCKET (Prepaid)
        // ========================================================
        try {
            const { data: settingsData } = await admin
                .from('settings')
                .select('settings')
                .eq('key', 'shiprocket_settings')
                .single();
            
            const srSettings = settingsData?.settings || {};
            
            if (srSettings.enabled && srSettings.autoShipment) {
                // Minimal payload for SR
                const srPayload: any = {
                    order_id: order.id,
                    order_date: new Date(order.created_at).toISOString().replace('T', ' ').substring(0, 16),
                    pickup_location: srSettings.pickupLocation || 'Primary',
                    billing_customer_name: order.shipping_address.full_name,
                    billing_address: order.shipping_address.address_line1,
                    billing_city: order.shipping_address.city,
                    billing_pincode: order.shipping_address.pincode,
                    billing_state: order.shipping_address.state,
                    billing_country: 'India',
                    billing_email: order.guest_info?.email || 'customer@example.com',
                    billing_phone: order.shipping_address.phone,
                    shipping_is_billing: true,
                    order_items: (orderItems || []).map((it: any) => ({
                        name: it.product_title,
                        sku: it.variant_id || it.product_id,
                        units: it.quantity,
                        selling_price: it.unit_price,
                    })),
                    payment_method: 'Prepaid',
                    sub_total: order.total_amount,
                    weight: 0.5,
                };
                
                const srRes = await createShiprocketOrder(srPayload);
                if (srRes.success) {
                    await admin.from('orders').update({
                        shiprocket_order_id: String(srRes.order_id),
                        shiprocket_shipment_id: String(srRes.shipment_id),
                    }).eq('id', order.id);
                }
            }
        } catch (srErr) {
            console.warn('Shiprocket auto-sync failed (silent):', srErr);
        }

        return NextResponse.json({
            success: true,
            order_id: order.id,
        });
    } catch (err) {
        console.error('Error confirming payment:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

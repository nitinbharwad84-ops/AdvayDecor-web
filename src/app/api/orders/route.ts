import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/mail';
import { formatCurrency } from '@/lib/utils';
import { createShiprocketOrder } from '@/lib/shiprocket';

// POST: Place a new order (guest or authenticated)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { guest_info, shipping_address, items, payment_method, shipping_fee, coupon_code, razorpay_order_id } = body;

        if (!shipping_address || !items || items.length === 0) {
            return NextResponse.json({ error: 'Shipping address and items are required' }, { status: 400 });
        }

        const itemsTotal = items.reduce(
            (sum: number, item: { unit_price: number; quantity: number }) =>
                sum + item.unit_price * item.quantity,
            0
        );

        // Get user session to link order if logged in
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Ignored
                        }
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Use admin client to bypass RLS (guest orders have no user_id)
        const admin = createAdminClient();

        let finalDiscount = 0;
        let finalCouponCode = null;

        if (coupon_code) {
            const { data: coupon } = await admin
                .from('coupons')
                .select('*')
                .ilike('code', coupon_code)
                .single();

            if (coupon && coupon.is_active && (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) && itemsTotal >= coupon.min_order_amount) {
                if (coupon.discount_type === 'flat') {
                    finalDiscount = Math.min(coupon.discount_value, itemsTotal);
                } else {
                    finalDiscount = (itemsTotal * coupon.discount_value) / 100;
                    if (coupon.max_discount_amount && finalDiscount > coupon.max_discount_amount) {
                        finalDiscount = coupon.max_discount_amount;
                    }
                }
                finalCouponCode = coupon.code;
            }
        }

        const totalAmount = Math.max(0, itemsTotal - finalDiscount) + (shipping_fee || 0);

        // ========================================================
        // STOCK VALIDATION (Safety-First Approach)
        // ========================================================
        // Rule 1: Check stock BEFORE creating the order.
        // Rule 2: If the check fails technically, ALLOW the order (don't lose a sale over a glitch).
        // Rule 3: Only block the order if stock is genuinely insufficient.
        // ========================================================
        const outOfStockItems: string[] = [];

        try {
            for (const item of items) {
                // Only validate stock for items that have a variant (stock is tracked on variants)
                if (item.variant_id) {
                    const { data: variant } = await admin
                        .from('product_variants')
                        .select('variant_name, stock_quantity')
                        .eq('id', item.variant_id)
                        .single();

                    if (variant && variant.stock_quantity !== null && variant.stock_quantity < item.quantity) {
                        const name = `${item.product_title} (${variant.variant_name})`;
                        if (variant.stock_quantity === 0) {
                            outOfStockItems.push(`${name} is out of stock`);
                        } else {
                            outOfStockItems.push(`${name} — only ${variant.stock_quantity} left in stock`);
                        }
                    }
                }
            }
        } catch (stockCheckError) {
            // Technical failure during stock check — log it but DO NOT block the order
            console.warn('Stock check encountered an error (order will proceed):', stockCheckError);
        }

        // If any items are genuinely out of stock, block the order with a clear message
        if (outOfStockItems.length > 0) {
            return NextResponse.json({
                error: 'Some items are no longer available',
                out_of_stock: outOfStockItems,
            }, { status: 409 }); // 409 Conflict
        }

        // Determine order status:
        // - COD orders → 'Pending' (confirmed immediately)
        // - Razorpay orders → 'Awaiting Payment' (confirmed by webhook or client)
        const isOnlinePayment = payment_method === 'Razorpay';
        const orderStatus = isOnlinePayment ? 'Awaiting Payment' : 'Pending';

        // Insert order
        const { data: order, error: orderError } = await admin
            .from('orders')
            .insert({
                user_id: user?.id || null,
                guest_info: guest_info || null,
                status: orderStatus,
                total_amount: totalAmount,
                shipping_fee: shipping_fee || 0,
                shipping_address,
                payment_method: payment_method || 'COD',
                coupon_code: finalCouponCode,
                discount_amount: finalDiscount,
                razorpay_order_id: razorpay_order_id || null,
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order insert error:', orderError);
            return NextResponse.json({ error: orderError.message }, { status: 500 });
        }

        // Insert order items
        const orderItems = items.map((item: {
            product_id: string;
            variant_id: string | null;
            product_title: string;
            variant_name: string | null;
            quantity: number;
            unit_price: number;
        }) => ({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            product_title: item.product_title,
            variant_name: item.variant_name || null,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.unit_price * item.quantity,
        }));

        const { error: itemsError } = await admin
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items insert error:', itemsError);
            // Order was created but items failed — still return order ID
            return NextResponse.json({
                success: true,
                order_id: order.id,
                warning: 'Order created but some items may not have been saved',
            });
        }

        // ========================================================
        // DEDUCT STOCK (Only for confirmed orders — not 'Awaiting Payment')
        // For Razorpay orders, stock is deducted when payment is confirmed.
        // ========================================================
        if (!isOnlinePayment) {
            try {
                for (const item of items) {
                    if (item.variant_id) {
                        await admin.rpc('decrement_stock', {
                            p_variant_id: item.variant_id,
                            p_quantity: item.quantity,
                        });
                    }
                }
            } catch (stockDeductError) {
                console.warn('Stock deduction warning (order was placed successfully):', stockDeductError);
            }
        }

        // --- Send Order Confirmation Email (only for confirmed orders) ---
        // For 'Awaiting Payment' orders, email is sent when payment is confirmed.
        if (!isOnlinePayment) {
            try {
                const customerEmail = user?.email || guest_info?.email;
                const customerName = user?.user_metadata?.full_name || guest_info?.name || 'Customer';

                if (customerEmail) {
                    const itemsHtml = items.map((item: any) => `
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0ece4;">
                            <div style="font-weight: 600; color: #0a0a23;">${item.product_title}</div>
                            ${item.variant_name ? `<div style="font-size: 12px; color: #9e9eb8;">${item.variant_name}</div>` : ''}
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0ece4; text-align: center; color: #0a0a23;">x${item.quantity}</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f0ece4; text-align: right; font-weight: 600; color: #0a0a23;">${formatCurrency(item.unit_price * item.quantity)}</td>
                    </tr>
                `).join('');

                    await sendEmail({
                        to: customerEmail,
                        subject: `Order Confirmed - #${order.id.substring(0, 8).toUpperCase()}`,
                        html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #0a0a23; max-width: 600px; margin: auto; border: 1px solid #e8e4dc; border-radius: 12px;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <h2 style="color: #00b4d8; margin-bottom: 8px;">Thank you for your order!</h2>
                                <p style="color: #64648b; margin-top: 0;">Hi ${customerName}, we've received your order and we're getting it ready.</p>
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
                                            <td style="padding: 12px 0 4px; text-align: right;">${formatCurrency(itemsTotal)}</td>
                                        </tr>
                                        ${finalDiscount > 0 ? `
                                        <tr>
                                            <td colspan="2" style="padding: 4px 0; text-align: right; color: #16a34a;">Discount:</td>
                                            <td style="padding: 4px 0; text-align: right; color: #16a34a;">-${formatCurrency(finalDiscount)}</td>
                                        </tr>
                                        ` : ''}
                                        <tr>
                                            <td colspan="2" style="padding: 4px 0; text-align: right; color: #64648b;">Shipping:</td>
                                            <td style="padding: 4px 0; text-align: right;">${formatCurrency(shipping_fee || 0)}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" style="padding: 12px 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #0a0a23;">Total:</td>
                                            <td style="padding: 12px 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #00b4d8;">${formatCurrency(totalAmount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 16px; margin-bottom: 12px;">Delivery Address</h3>
                                <p style="font-size: 14px; color: #64648b; line-height: 1.6; margin: 0;">
                                    ${shipping_address.full_name}<br>
                                    ${shipping_address.address_line1}${shipping_address.address_line2 ? `, ${shipping_address.address_line2}` : ''}<br>
                                    ${shipping_address.city}, ${shipping_address.state} ${shipping_address.pincode}<br>
                                    Phone: ${shipping_address.phone}
                                </p>
                            </div>

                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}" 
                                   style="background-color: #00b4d8; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(0,180,216,0.2);">
                                    View Full Order Details
                                </a>
                            </div>

                            <div style="text-align: center; background: #f8fafc; color: #0a0a23; padding: 15px; border-radius: 8px; border: 1px solid #f0ece4;">
                                <p style="margin: 0; font-weight: 600;">Payment Method: ${payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
                            </div>

                            <hr style="border: none; border-top: 1px solid #f0ece4; margin: 24px 0;" />
                            <p style="font-size: 12px; color: #9e9eb8; text-align: center;">If you have any questions, please contact us at hello@advaydecor.com</p>
                            <p style="font-size: 12px; color: #9e9eb8; text-align: center;">© 2026 AdvayDecor. All rights reserved.</p>
                        </div>
                    `,
                    });
                }
            } catch (mailErr) {
                console.error('Order Confirmation Email Error:', mailErr);
            }

            // --- Auto-Sync to Shiprocket for COD orders ---
            try {
                const { data: settingsData } = await admin
                    .from('settings')
                    .select('settings')
                    .eq('key', 'shiprocket_settings')
                    .single();
                
                const srSettings = settingsData?.settings || {};
                
                if (srSettings.enabled && srSettings.autoShipment) {
                    // We call the same logic as admin but from اینجا
                    // Since it's a bit complex, we can just fetch the order again with items to be safe
                    const { data: fullOrder } = await admin
                        .from('orders')
                        .select('*, order_items(*)')
                        .eq('id', order.id)
                        .single();

                    if (fullOrder) {
                        // Minimal payload for SR
                        const srPayload: any = {
                            order_id: fullOrder.id,
                            order_date: new Date(fullOrder.created_at).toISOString().replace('T', ' ').substring(0, 16),
                            pickup_location: srSettings.pickupLocation || 'Primary',
                            billing_customer_name: fullOrder.shipping_address.full_name,
                            billing_address: fullOrder.shipping_address.address_line1,
                            billing_city: fullOrder.shipping_address.city,
                            billing_pincode: fullOrder.shipping_address.pincode,
                            billing_state: fullOrder.shipping_address.state,
                            billing_country: 'India',
                            billing_email: user?.email || guest_info?.email || 'customer@example.com',
                            billing_phone: fullOrder.shipping_address.phone,
                            shipping_is_billing: true,
                            order_items: fullOrder.order_items.map((it: any) => ({
                                name: it.product_title,
                                sku: it.variant_id || it.product_id,
                                units: it.quantity,
                                selling_price: it.unit_price,
                            })),
                            payment_method: 'COD',
                            sub_total: fullOrder.total_amount,
                            weight: 0.5, // Default weight if not found
                        };
                        
                        const srRes = await createShiprocketOrder(srPayload);
                        if (srRes.success) {
                            await admin.from('orders').update({
                                shiprocket_order_id: String(srRes.order_id),
                                shiprocket_shipment_id: String(srRes.shipment_id),
                            }).eq('id', fullOrder.id);
                        }
                    }
                }
            } catch (srErr) {
                console.warn('Shiprocket auto-sync failed (silent):', srErr);
            }
        } // end: !isOnlinePayment email guard

        return NextResponse.json({
            success: true,
            order_id: order.id,
        });
    } catch (err) {
        console.error('Error placing order:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Link Razorpay order ID to an existing order
export async function PATCH(request: Request) {
    try {
        const { order_id, razorpay_order_id } = await request.json();

        if (!order_id || !razorpay_order_id) {
            return NextResponse.json({ error: 'order_id and razorpay_order_id are required' }, { status: 400 });
        }

        const admin = createAdminClient();

        const { error } = await admin
            .from('orders')
            .update({ razorpay_order_id })
            .eq('id', order_id);

        if (error) {
            console.error('Error linking Razorpay order ID:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error updating order:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
    createShiprocketOrder,
    generateAWB,
    generateLabel,
    requestPickup,
    getTracking,
    cancelShiprocketOrder,
    type ShiprocketOrderPayload,
} from '@/lib/shiprocket';

/**
 * POST /api/shiprocket/order
 * Admin-only endpoint for Shiprocket order operations.
 * Body: { action, order_id, ... }
 * 
 * Actions:
 *   - "sync"     → Push order to Shiprocket
 *   - "awb"      → Generate AWB (assign courier)
 *   - "label"    → Generate shipping label
 *   - "pickup"   → Request pickup
 *   - "track"    → Get current tracking info
 *   - "cancel"   → Cancel on Shiprocket
 */
export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { action, order_id } = body;

        if (!action || !order_id) {
            return NextResponse.json({ error: 'action and order_id required' }, { status: 400 });
        }

        // Fetch order
        const { data: order, error: orderErr } = await admin
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', order_id)
            .single();

        if (orderErr || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Fetch config
        const { data: configRows } = await admin.from('site_config').select('key, value');
        const config: Record<string, string> = {};
        (configRows || []).forEach((r: { key: string; value: string }) => { config[r.key] = r.value; });

        // ---- SYNC: Create order on Shiprocket ----
        if (action === 'sync') {
            if (order.shiprocket_order_id) {
                return NextResponse.json({ error: 'Order already synced to Shiprocket' }, { status: 400 });
            }

            const addr = order.shipping_address;
            const guestInfo = order.guest_info;

            // Fetch product shipping details for items
            const productIds = order.order_items.map((i: any) => i.product_id).filter(Boolean);
            const { data: products } = await admin
                .from('products')
                .select('id, weight, length, width, height, hsn_code')
                .in('id', productIds);

            const productMap: Record<string, any> = {};
            (products || []).forEach((p: any) => { productMap[p.id] = p; });

            // Calculate total dimensions
            let totalWeight = 0, maxLength = 0, maxWidth = 0, totalHeight = 0;

            const orderItems = order.order_items.map((item: any) => {
                const prod = productMap[item.product_id] || {};
                const w = prod.weight || 0.5;
                const l = prod.length || 20;
                const wd = prod.width || 20;
                const h = prod.height || 10;

                totalWeight += w * item.quantity;
                maxLength = Math.max(maxLength, l);
                maxWidth = Math.max(maxWidth, wd);
                totalHeight += h * item.quantity;

                return {
                    name: item.product_title + (item.variant_name ? ` - ${item.variant_name}` : ''),
                    sku: item.variant_id || item.product_id || 'SKU-DEFAULT',
                    units: item.quantity,
                    selling_price: item.unit_price,
                    hsn: prod.hsn_code || '',
                };
            });

            const pickupLocation = config.shiprocket_pickup_location_id || 'Primary';

            const payload: ShiprocketOrderPayload = {
                order_id: order.id,
                order_date: new Date(order.created_at).toISOString().replace('T', ' ').slice(0, 16),
                pickup_location: pickupLocation,
                billing_customer_name: addr.full_name || guestInfo?.name || 'Customer',
                billing_address: addr.address_line1 || '',
                billing_city: addr.city || '',
                billing_pincode: addr.pincode || '',
                billing_state: addr.state || '',
                billing_country: 'India',
                billing_email: addr.email || guestInfo?.email || '',
                billing_phone: addr.phone || guestInfo?.phone || '',
                shipping_is_billing: true,
                order_items: orderItems,
                payment_method: order.payment_method === 'COD' ? 'COD' : 'Prepaid',
                sub_total: order.total_amount,
                weight: Math.max(totalWeight, 0.5),
                length: Math.max(maxLength, 10),
                breadth: Math.max(maxWidth, 10),
                height: Math.max(totalHeight, 5),
            };

            const result = await createShiprocketOrder(payload);

            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 500 });
            }

            // Update order with Shiprocket IDs
            await admin.from('orders').update({
                shiprocket_order_id: String(result.order_id),
                shiprocket_shipment_id: String(result.shipment_id),
                shipping_status: 'Synced to Shiprocket',
            }).eq('id', order_id);

            return NextResponse.json({
                success: true,
                shiprocket_order_id: result.order_id,
                shipment_id: result.shipment_id,
            });
        }

        // ---- AWB: Assign courier ----
        if (action === 'awb') {
            if (!order.shiprocket_shipment_id) {
                return NextResponse.json({ error: 'Order not synced to Shiprocket yet' }, { status: 400 });
            }

            const awbResult = await generateAWB(parseInt(order.shiprocket_shipment_id));

            if (awbResult?.response?.data?.awb_code) {
                await admin.from('orders').update({
                    tracking_id: awbResult.response.data.awb_code,
                    courier_name: awbResult.response.data.courier_name || '',
                    shipping_status: 'AWB Assigned',
                }).eq('id', order_id);

                return NextResponse.json({
                    success: true,
                    awb_code: awbResult.response.data.awb_code,
                    courier_name: awbResult.response.data.courier_name,
                });
            }

            return NextResponse.json({ error: 'Failed to generate AWB', details: awbResult }, { status: 500 });
        }

        // ---- LABEL: Generate shipping label ----
        if (action === 'label') {
            if (!order.shiprocket_shipment_id) {
                return NextResponse.json({ error: 'Shipment not created yet' }, { status: 400 });
            }

            const labelResult = await generateLabel([parseInt(order.shiprocket_shipment_id)]);

            if (labelResult?.label_url) {
                await admin.from('orders').update({
                    shipping_label_url: labelResult.label_url,
                    shipping_status: 'Label Generated',
                }).eq('id', order_id);

                return NextResponse.json({ success: true, label_url: labelResult.label_url });
            }

            return NextResponse.json({ error: 'Failed to generate label', details: labelResult }, { status: 500 });
        }

        // ---- PICKUP: Request pickup ----
        if (action === 'pickup') {
            if (!order.shiprocket_shipment_id) {
                return NextResponse.json({ error: 'Shipment not created yet' }, { status: 400 });
            }

            const pickupResult = await requestPickup([parseInt(order.shiprocket_shipment_id)]);

            if (pickupResult?.pickup_status) {
                await admin.from('orders').update({
                    shipping_status: 'Pickup Scheduled',
                    status: 'Processing',
                }).eq('id', order_id);

                return NextResponse.json({ success: true, pickup: pickupResult });
            }

            return NextResponse.json({ error: 'Pickup request failed', details: pickupResult }, { status: 500 });
        }

        // ---- TRACK: Get tracking data ----
        if (action === 'track') {
            if (!order.shiprocket_shipment_id) {
                return NextResponse.json({ error: 'No shipment to track' }, { status: 400 });
            }

            const tracking = await getTracking(order.shiprocket_shipment_id);

            if (!tracking) {
                return NextResponse.json({ error: 'Tracking data not available' }, { status: 404 });
            }

            return NextResponse.json({ success: true, tracking: tracking.tracking_data });
        }

        // ---- CANCEL: Cancel on Shiprocket ----
        if (action === 'cancel') {
            if (!order.shiprocket_order_id) {
                return NextResponse.json({ error: 'Order not on Shiprocket' }, { status: 400 });
            }

            const cancelResult = await cancelShiprocketOrder([parseInt(order.shiprocket_order_id)]);

            await admin.from('orders').update({
                status: 'Cancelled',
                shipping_status: 'Cancelled',
            }).eq('id', order_id);

            return NextResponse.json({ success: true, cancel: cancelResult });
        }

        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });

    } catch (err) {
        console.error('Shiprocket order error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

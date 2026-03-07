import { NextResponse } from 'next/server';
import { createShiprocketOrder, type ShiprocketOrderInput } from '@/lib/shiprocket';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/shipping/create-order
 * 
 * Create a Shiprocket order for a confirmed internal order.
 * Called automatically after payment confirmation.
 */
export async function POST(request: Request) {
    try {
        const { order_id } = await request.json();

        if (!order_id) {
            return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Check if Shiprocket auto-ordering is enabled
        const { data: configData } = await admin
            .from('site_config')
            .select('key, value')
            .in('key', ['shiprocket_enabled', 'shiprocket_auto_order', 'shiprocket_pickup_pincode', 'shiprocket_default_weight']);

        const config: Record<string, string> = {};
        configData?.forEach((row: { key: string; value: string }) => {
            config[row.key] = row.value;
        });

        if (config.shiprocket_enabled === 'false' || config.shiprocket_auto_order === 'false') {
            return NextResponse.json({ skipped: true, reason: 'Shiprocket auto-order is disabled' });
        }

        // Fetch the order with items
        const { data: order, error: orderError } = await admin
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Skip if already has a Shiprocket order
        if (order.shiprocket_order_id) {
            return NextResponse.json({
                success: true,
                already_created: true,
                shiprocket_order_id: order.shiprocket_order_id,
            });
        }

        // Fetch order items
        const { data: orderItems } = await admin
            .from('order_items')
            .select('*')
            .eq('order_id', order_id);

        if (!orderItems || orderItems.length === 0) {
            return NextResponse.json({ error: 'No order items found' }, { status: 400 });
        }

        // Fetch product dimensions for weight calculation
        const productIds = orderItems.map((i: any) => i.product_id).filter(Boolean);
        const { data: products } = await admin
            .from('products')
            .select('id, weight, length, breadth, height')
            .in('id', productIds);

        const productMap: Record<string, any> = {};
        products?.forEach((p: any) => { productMap[p.id] = p; });

        const defaultWeight = parseFloat(config.shiprocket_default_weight || '0.5');
        let totalWeight = 0;
        let maxLength = 10;
        let maxBreadth = 10;
        let totalHeight = 0;

        const shiprocketItems = orderItems.map((item: any) => {
            const product = productMap[item.product_id];
            const qty = item.quantity || 1;
            const w = product?.weight || defaultWeight;

            totalWeight += w * qty;
            maxLength = Math.max(maxLength, product?.length || 10);
            maxBreadth = Math.max(maxBreadth, product?.breadth || 10);
            totalHeight += (product?.height || 10) * qty;

            return {
                name: item.product_title,
                sku: item.variant_id || item.product_id,
                units: qty,
                selling_price: item.unit_price,
            };
        });

        const shipping = order.shipping_address;
        const nameParts = (shipping.full_name || '').trim().split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || '';

        const orderDate = new Date(order.created_at);
        const formattedDate = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')} ${String(orderDate.getHours()).padStart(2, '0')}:${String(orderDate.getMinutes()).padStart(2, '0')}`;

        const shiprocketOrder: ShiprocketOrderInput = {
            order_id: order.id,
            order_date: formattedDate,
            billing_customer_name: firstName,
            billing_last_name: lastName,
            billing_address: shipping.address_line1,
            billing_address_2: shipping.address_line2 || '',
            billing_city: shipping.city,
            billing_pincode: shipping.pincode,
            billing_state: shipping.state,
            billing_country: 'India',
            billing_email: order.guest_info?.email || shipping.email || '',
            billing_phone: shipping.phone,
            shipping_is_billing: true,
            order_items: shiprocketItems,
            payment_method: order.payment_method === 'COD' ? 'COD' : 'Prepaid',
            sub_total: order.total_amount,
            length: maxLength,
            breadth: maxBreadth,
            height: totalHeight,
            weight: totalWeight,
        };

        const result = await createShiprocketOrder(shiprocketOrder);

        // Update our order with Shiprocket IDs
        await admin
            .from('orders')
            .update({
                shiprocket_order_id: result.order_id?.toString(),
                shipment_id: result.shipment_id?.toString(),
                awb_code: result.awb_code || null,
                courier_name: result.courier_name || null,
            })
            .eq('id', order_id);

        // Create shipment record
        await admin.from('shipments').insert({
            order_id,
            shiprocket_order_id: result.order_id?.toString(),
            shipment_id: result.shipment_id?.toString(),
            courier_name: result.courier_name || null,
            awb_code: result.awb_code || null,
            status: 'NEW',
        });

        return NextResponse.json({
            success: true,
            shiprocket_order_id: result.order_id,
            shipment_id: result.shipment_id,
            awb_code: result.awb_code,
            courier_name: result.courier_name,
        });
    } catch (error) {
        console.error('Shiprocket order creation error:', error);
        return NextResponse.json({ error: 'Failed to create Shiprocket order' }, { status: 500 });
    }
}

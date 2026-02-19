import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// POST: Place a new order (guest or authenticated)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { guest_info, shipping_address, items, payment_method, shipping_fee } = body;

        if (!shipping_address || !items || items.length === 0) {
            return NextResponse.json({ error: 'Shipping address and items are required' }, { status: 400 });
        }

        // Calculate total
        const itemsTotal = items.reduce(
            (sum: number, item: { unit_price: number; quantity: number }) =>
                sum + item.unit_price * item.quantity,
            0
        );
        const totalAmount = itemsTotal + (shipping_fee || 0);

        // Use admin client to bypass RLS (guest orders have no user_id)
        const admin = createAdminClient();

        // Insert order
        const { data: order, error: orderError } = await admin
            .from('orders')
            .insert({
                user_id: null,
                guest_info: guest_info || null,
                status: 'Pending',
                total_amount: totalAmount,
                shipping_fee: shipping_fee || 0,
                shipping_address,
                payment_method: payment_method || 'COD',
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

        return NextResponse.json({
            success: true,
            order_id: order.id,
        });
    } catch (err) {
        console.error('Error placing order:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

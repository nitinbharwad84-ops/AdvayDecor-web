import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase-admin';

// POST: Place a new order (guest or authenticated)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { guest_info, shipping_address, items, payment_method, shipping_fee, coupon_code } = body;

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

        // Insert order
        const { data: order, error: orderError } = await admin
            .from('orders')
            .insert({
                user_id: user?.id || null,
                guest_info: guest_info || null,
                status: 'Pending',
                total_amount: totalAmount,
                shipping_fee: shipping_fee || 0,
                shipping_address,
                payment_method: payment_method || 'COD',
                coupon_code: finalCouponCode,
                discount_amount: finalDiscount,
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

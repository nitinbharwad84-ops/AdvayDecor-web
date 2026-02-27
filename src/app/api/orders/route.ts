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

        // Validate item structure
        for (const item of items) {
            if (!item.product_id || !item.quantity || item.quantity < 1) {
                return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
            }
        }

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

        // ===== SERVER-SIDE PRICE VERIFICATION =====
        // Fetch real prices from the database instead of trusting client-sent prices
        const productIds = [...new Set(items.map((item: { product_id: string }) => item.product_id))];
        const variantIds = items
            .filter((item: { variant_id: string | null }) => item.variant_id)
            .map((item: { variant_id: string }) => item.variant_id);

        const { data: dbProducts } = await admin
            .from('products')
            .select('id, base_price, title')
            .in('id', productIds);

        const { data: dbVariants } = variantIds.length > 0
            ? await admin
                .from('product_variants')
                .select('id, price, variant_name, parent_product_id, stock_quantity')
                .in('id', variantIds)
            : { data: [] };

        // Build lookup maps
        const productMap = new Map((dbProducts || []).map((p: { id: string; base_price: number; title: string }) => [p.id, p]));
        const variantMap = new Map((dbVariants || []).map((v: { id: string; price: number; variant_name: string; parent_product_id: string; stock_quantity: number | null }) => [v.id, v]));

        // Verify each item and calculate totals using server-side prices
        let itemsTotal = 0;
        const verifiedItems: {
            product_id: string;
            variant_id: string | null;
            product_title: string;
            variant_name: string | null;
            quantity: number;
            unit_price: number;
            total_price: number;
        }[] = [];

        for (const item of items) {
            const product = productMap.get(item.product_id);
            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.product_id}` }, { status: 400 });
            }

            let verifiedPrice: number;
            let variantName: string | null = null;

            if (item.variant_id) {
                const variant = variantMap.get(item.variant_id);
                if (!variant) {
                    return NextResponse.json({ error: `Variant not found: ${item.variant_id}` }, { status: 400 });
                }
                // Check stock availability
                if (variant.stock_quantity !== undefined && variant.stock_quantity !== null && variant.stock_quantity < item.quantity) {
                    return NextResponse.json({
                        error: `Insufficient stock for "${product.title} - ${variant.variant_name}". Available: ${variant.stock_quantity}`,
                    }, { status: 400 });
                }
                verifiedPrice = Number(variant.price);
                variantName = variant.variant_name;
            } else {
                verifiedPrice = Number(product.base_price);
            }

            const lineTotal = verifiedPrice * item.quantity;
            itemsTotal += lineTotal;

            verifiedItems.push({
                product_id: item.product_id,
                variant_id: item.variant_id || null,
                product_title: product.title,
                variant_name: variantName || item.variant_name || null,
                quantity: item.quantity,
                unit_price: verifiedPrice,
                total_price: lineTotal,
            });
        }

        // ===== SERVER-SIDE SHIPPING FEE VERIFICATION =====
        // Fetch shipping config from DB instead of trusting client
        const { data: configData } = await admin.from('site_config').select('key, value');
        const configMap = new Map((configData || []).map((c: { key: string; value: string }) => [c.key, c.value]));
        const dbShippingFee = Number(configMap.get('global_shipping_fee') || '50');
        const dbFreeThreshold = Number(configMap.get('free_shipping_threshold') || '999');
        const verifiedShippingFee = itemsTotal >= dbFreeThreshold ? 0 : dbShippingFee;

        // ===== COUPON VALIDATION =====
        let finalDiscount = 0;
        let finalCouponCode = null;
        let couponId: string | null = null;

        if (coupon_code) {
            const { data: coupon } = await admin
                .from('coupons')
                .select('*')
                .ilike('code', coupon_code)
                .single();

            if (coupon && coupon.is_active
                && (!coupon.expires_at || new Date(coupon.expires_at) > new Date())
                && itemsTotal >= coupon.min_order_amount
                && (coupon.max_usage === null || coupon.usage_count < coupon.max_usage)
            ) {
                if (coupon.discount_type === 'flat') {
                    finalDiscount = Math.min(coupon.discount_value, itemsTotal);
                } else if (coupon.discount_type === 'percentage') {
                    finalDiscount = (itemsTotal * coupon.discount_value) / 100;
                    if (coupon.max_discount_amount && finalDiscount > coupon.max_discount_amount) {
                        finalDiscount = coupon.max_discount_amount;
                    }
                }
                finalCouponCode = coupon.code;
                couponId = coupon.id;
            }
        }

        const totalAmount = Math.max(0, itemsTotal - finalDiscount) + verifiedShippingFee;

        // Insert order
        const { data: order, error: orderError } = await admin
            .from('orders')
            .insert({
                user_id: user?.id || null,
                guest_info: guest_info || null,
                status: 'Pending',
                total_amount: totalAmount,
                shipping_fee: verifiedShippingFee,
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

        // Insert order items with server-verified prices
        const orderItems = verifiedItems.map((item) => ({
            order_id: order.id,
            ...item,
        }));

        const { error: itemsError } = await admin
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items insert error:', itemsError);
            return NextResponse.json({
                success: true,
                order_id: order.id,
                warning: 'Order created but some items may not have been saved',
            });
        }

        // Increment coupon usage count after successful order
        if (couponId) {
            try {
                const { data: currentCoupon } = await admin
                    .from('coupons')
                    .select('usage_count')
                    .eq('id', couponId)
                    .single();
                if (currentCoupon) {
                    await admin
                        .from('coupons')
                        .update({ usage_count: (currentCoupon.usage_count || 0) + 1 })
                        .eq('id', couponId);
                }
            } catch (couponErr) {
                console.error('Warning: Failed to increment coupon usage:', couponErr);
            }
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

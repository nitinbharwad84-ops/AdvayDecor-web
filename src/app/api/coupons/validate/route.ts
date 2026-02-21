import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Fetch coupon by code
        const { data: coupon, error } = await admin
            .from('coupons')
            .select('*')
            .ilike('code', code)
            .single();

        if (error || !coupon) {
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
        }

        if (!coupon.is_active) {
            return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 });
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
        }

        if (cartTotal < coupon.min_order_amount) {
            return NextResponse.json({ error: `This coupon requires a minimum order of ₹${coupon.min_order_amount}` }, { status: 400 });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (coupon.discount_type === 'flat') {
            discountAmount = coupon.discount_value;
        } else if (coupon.discount_type === 'percentage') {
            discountAmount = (cartTotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                discountAmount = coupon.max_discount_amount;
            }
        }

        // Ensure discount doesn't exceed cart total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        return NextResponse.json({
            success: true,
            code: coupon.code,
            discount_amount: discountAmount,
        });
    } catch (err: any) {
        console.error('Coupon validation error:', err);
        return NextResponse.json({ error: 'Internal server error validating coupon' }, { status: 500 });
    }
}

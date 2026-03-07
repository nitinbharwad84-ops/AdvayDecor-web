import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/orders/return
 * 
 * Customer submits a return request.
 * Only allowed for delivered orders.
 */
export async function POST(request: Request) {
    try {
        const { order_id, reason, refund_method = 'original', refund_details } = await request.json();

        if (!order_id || !reason) {
            return NextResponse.json({ error: 'order_id and reason are required' }, { status: 400 });
        }

        // Get the authenticated user
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const admin = createAdminClient();

        // Fetch the order
        const { data: order } = await admin
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .eq('user_id', user.id)
            .single();

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Only allow returns for delivered orders
        if (order.status !== 'Delivered') {
            return NextResponse.json({
                error: 'Returns can only be requested for delivered orders. Your order is currently: ' + order.status,
            }, { status: 400 });
        }

        // Check if a return request already exists for this order
        const { data: existingReturn } = await admin
            .from('return_requests')
            .select('id, status')
            .eq('order_id', order_id)
            .single();

        if (existingReturn) {
            return NextResponse.json({
                error: `A return request already exists for this order (Status: ${existingReturn.status}).`,
            }, { status: 400 });
        }

        // Create return request
        const { error: insertError } = await admin.from('return_requests').insert({
            order_id,
            user_id: user.id,
            reason,
            refund_method,
            refund_details: refund_details || null,
            status: 'Pending',
        });

        if (insertError) {
            console.error('Return request insert error:', insertError);
            return NextResponse.json({ error: 'Failed to submit return request' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Return request submitted successfully. Our team will review it shortly.',
        });
    } catch (error) {
        console.error('Return request error:', error);
        return NextResponse.json({ error: 'Failed to submit return request' }, { status: 500 });
    }
}

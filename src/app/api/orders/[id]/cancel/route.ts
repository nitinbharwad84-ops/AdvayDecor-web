import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;
        const { reason } = await request.json();

        if (!reason || typeof reason !== 'string' || !reason.trim()) {
            return NextResponse.json(
                { error: 'A cancellation reason is required' },
                { status: 400 }
            );
        }

        // Create authenticated Supabase client
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
                            // Ignored in server context
                        }
                    },
                },
            }
        );

        // Verify user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Fetch the order — must belong to user
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, status')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !order) {
            console.error('Order fetch error:', fetchError);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Only allow cancellation from these statuses
        const cancellableStatuses = ['Awaiting Payment', 'Pending', 'Processing'];
        if (!cancellableStatuses.includes(order.status)) {
            return NextResponse.json(
                { error: `Cannot cancel an order with status "${order.status}". Only orders that are Awaiting Payment, Pending, or Processing can be cancelled.` },
                { status: 400 }
            );
        }

        // Update order status and save reason
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'Cancellation Requested',
                cancel_reason: reason.trim(),
            })
            .eq('id', orderId)
            .eq('user_id', user.id);

        if (updateError) {
            console.error('Cancel update error:', updateError);
            return NextResponse.json(
                { error: 'Failed to submit cancellation request. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Cancellation request submitted successfully',
        });
    } catch (err) {
        console.error('Cancel order error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

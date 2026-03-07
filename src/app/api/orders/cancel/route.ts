import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase-admin';
import { cancelShiprocketOrder, cancelShipment } from '@/lib/shiprocket';

/**
 * POST /api/orders/cancel
 * 
 * Customer cancels their order.
 * Blocked if estimated delivery is within 2 days.
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

        // Check if order can be cancelled
        const nonCancellable = ['Delivered', 'Cancelled', 'Returned'];
        if (nonCancellable.includes(order.status)) {
            return NextResponse.json({
                error: `This order cannot be cancelled because it is already ${order.status.toLowerCase()}.`,
            }, { status: 400 });
        }

        // Check if delivery is within 2 days
        if (order.estimated_delivery) {
            const now = new Date();
            const edd = new Date(order.estimated_delivery);
            const diffDays = (edd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

            if (diffDays <= 2 && diffDays > 0) {
                return NextResponse.json({
                    error: 'This order cannot be cancelled as it is expected to arrive within 2 days. Please try returning it after delivery instead.',
                }, { status: 400 });
            }
        }

        // Check if order is already out for delivery or shipped very recently
        if (order.status === 'Shipped' && order.estimated_delivery) {
            const now = new Date();
            const edd = new Date(order.estimated_delivery);
            const diffDays = (edd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

            if (diffDays <= 2) {
                return NextResponse.json({
                    error: 'This order is almost at your doorstep and cannot be cancelled. Please try returning it after delivery.',
                }, { status: 400 });
            }
        }

        // Create cancellation request
        await admin.from('cancellation_requests').insert({
            order_id,
            user_id: user.id,
            reason,
            refund_method,
            refund_details: refund_details || null,
            status: 'Pending',
        });

        // Update order status
        await admin
            .from('orders')
            .update({ status: 'Cancelled' })
            .eq('id', order_id);

        // Cancel on Shiprocket if applicable
        if (order.shiprocket_order_id) {
            try {
                await cancelShiprocketOrder([parseInt(order.shiprocket_order_id)]);
            } catch (srErr) {
                console.warn('Shiprocket cancellation warning:', srErr);
            }
        }

        if (order.awb_code) {
            try {
                await cancelShipment([order.awb_code]);
            } catch (srErr) {
                console.warn('Shiprocket shipment cancellation warning:', srErr);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully. Refund will be processed shortly.',
            requires_refund: order.payment_method !== 'COD',
        });
    } catch (error) {
        console.error('Order cancellation error:', error);
        return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
    }
}

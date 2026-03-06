import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTracking } from '@/lib/shiprocket';

/**
 * GET /api/shiprocket/track?order_id=xxx
 * 
 * Customer-facing tracking endpoint.
 * Returns tracking data for an order the user owns.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('order_id');

        if (!orderId) {
            return NextResponse.json({ error: 'order_id required' }, { status: 400 });
        }

        // Auth: Must be logged in
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        // Fetch order and verify ownership
        const admin = createAdminClient();
        const { data: order, error: orderErr } = await admin
            .from('orders')
            .select('id, user_id, shiprocket_shipment_id, shipping_status, tracking_id, courier_name')
            .eq('id', orderId)
            .single();

        if (orderErr || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify ownership (allow admin to also access)
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (order.user_id !== user.id && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check live tracking setting
        const { data: configRows } = await admin.from('site_config').select('key, value');
        const config: Record<string, string> = {};
        (configRows || []).forEach((r: { key: string; value: string }) => { config[r.key] = r.value; });

        const liveTrackingEnabled = config.shiprocket_live_tracking !== 'false';

        if (!order.shiprocket_shipment_id || !liveTrackingEnabled) {
            // Return basic info from our DB
            return NextResponse.json({
                tracking_id: order.tracking_id,
                courier_name: order.courier_name,
                shipping_status: order.shipping_status,
                live: false,
            });
        }

        // Get live tracking from Shiprocket
        try {
            const tracking = await getTracking(order.shiprocket_shipment_id);

            if (tracking?.tracking_data) {
                return NextResponse.json({
                    tracking_id: order.tracking_id,
                    courier_name: order.courier_name,
                    shipping_status: order.shipping_status,
                    live: true,
                    tracking_data: tracking.tracking_data,
                });
            }
        } catch (trackingError) {
            console.error('Live tracking fetch failed:', trackingError);
        }

        // Fallback
        return NextResponse.json({
            tracking_id: order.tracking_id,
            courier_name: order.courier_name,
            shipping_status: order.shipping_status,
            live: false,
        });

    } catch (err) {
        console.error('Tracking error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/fulfillment/update
 * 
 * Shiprocket sends status updates here for shipments.
 * We update the corresponding order in our database.
 */
export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        const {
            order_id: srOrderId,
            awb,
            courier_name,
            current_status,
            current_status_id,
        } = payload;

        if (!srOrderId) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Map Shiprocket status codes to our internal statuses
        const statusMap: Record<number, { shipping_status: string; order_status?: string }> = {
            1: { shipping_status: 'AWB Assigned' },
            2: { shipping_status: 'Label Generated' },
            3: { shipping_status: 'Pickup Scheduled' },
            4: { shipping_status: 'Pickup Queued' },
            5: { shipping_status: 'Manifest Generated' },
            6: { shipping_status: 'Shipped', order_status: 'Shipped' },
            7: { shipping_status: 'Delivered', order_status: 'Delivered' },
            8: { shipping_status: 'Cancelled', order_status: 'Cancelled' },
            9: { shipping_status: 'RTO Initiated' },
            10: { shipping_status: 'RTO Delivered' },
            12: { shipping_status: 'Lost' },
            13: { shipping_status: 'Pickup Error' },
            14: { shipping_status: 'RTO Acknowledged' },
            15: { shipping_status: 'Pickup Rescheduled' },
            16: { shipping_status: 'Cancellation Requested' },
            17: { shipping_status: 'Out For Delivery' },
            18: { shipping_status: 'In Transit' },
            19: { shipping_status: 'Out For Pickup' },
            20: { shipping_status: 'Pickup Exception' },
            21: { shipping_status: 'Undelivered' },
            22: { shipping_status: 'Delayed' },
            23: { shipping_status: 'Partial Delivered' },
            24: { shipping_status: 'Destroyed' },
            25: { shipping_status: 'Damaged' },
            26: { shipping_status: 'Fulfilled' },
            38: { shipping_status: 'Reached Destination Hub' },
            39: { shipping_status: 'Misrouted' },
            40: { shipping_status: 'RTO NDR' },
            41: { shipping_status: 'RTO OFD' },
            42: { shipping_status: 'Picked Up' },
            43: { shipping_status: 'Self Fulfilled' },
            44: { shipping_status: 'Disposed Off' },
            45: { shipping_status: 'Cancelled Before Dispatching' },
            46: { shipping_status: 'RTO In Transit' },
            48: { shipping_status: 'Return Initiated', order_status: 'Returned' },
        };

        const mapped = statusMap[current_status_id] || {
            shipping_status: current_status || 'Unknown',
        };

        // Build update payload
        const updateData: Record<string, any> = {
            shipping_status: mapped.shipping_status,
        };

        if (awb) updateData.tracking_id = awb;
        if (courier_name) updateData.courier_name = courier_name;
        if (mapped.order_status) updateData.status = mapped.order_status;

        // Find and update the order by shiprocket_order_id
        const { error } = await admin
            .from('orders')
            .update(updateData)
            .eq('shiprocket_order_id', String(srOrderId));

        if (error) {
            console.error('Webhook DB update error:', error);
            return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, status: mapped.shipping_status });
    } catch (err) {
        console.error('Shiprocket webhook error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { trackShipment, trackByShipmentId } from '@/lib/shiprocket';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * GET /api/shipping/track?awb=<awb_code>&order_id=<order_id>
 * 
 * Get live tracking data for a shipment.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const awbCode = searchParams.get('awb');
        const orderId = searchParams.get('order_id');

        const admin = createAdminClient();

        // Check if tracking is enabled
        const { data: configData } = await admin
            .from('site_config')
            .select('key, value')
            .in('key', ['shiprocket_enabled', 'shiprocket_tracking']);

        const config: Record<string, string> = {};
        configData?.forEach((row: { key: string; value: string }) => {
            config[row.key] = row.value;
        });

        if (config.shiprocket_enabled === 'false' || config.shiprocket_tracking === 'false') {
            return NextResponse.json({ tracking_enabled: false });
        }

        let effectiveAwb = awbCode;
        let effectiveOrderId = orderId;

        // If no AWB provided but order_id given, look up the AWB
        if (!effectiveAwb && effectiveOrderId) {
            const { data: order } = await admin
                .from('orders')
                .select('awb_code, shipment_id')
                .eq('id', effectiveOrderId)
                .single();

            if (order?.awb_code) {
                effectiveAwb = order.awb_code;
            } else if (order?.shipment_id) {
                // Try tracking by shipment ID
                const trackResult = await trackByShipmentId(order.shipment_id);
                if (trackResult?.tracking_data) {
                    return formatTrackingResponse(trackResult, effectiveOrderId, admin);
                }
                return NextResponse.json({
                    available: false,
                    message: 'Tracking information not yet available. Your order is being processed.',
                });
            }
        }

        if (!effectiveAwb) {
            return NextResponse.json({
                available: false,
                message: 'AWB code not yet assigned. Your order is being processed.',
            });
        }

        // Fetch tracking from Shiprocket
        const trackResult = await trackShipment(effectiveAwb);

        if (!trackResult?.tracking_data) {
            return NextResponse.json({
                available: false,
                message: 'Tracking information not available',
            });
        }

        return formatTrackingResponse(trackResult, effectiveOrderId, admin);
    } catch (error) {
        console.error('Tracking error:', error);
        return NextResponse.json({
            available: false,
            message: 'Unable to fetch tracking information',
        });
    }
}

async function formatTrackingResponse(trackResult: any, orderId: string | null, admin: any) {
    const trackData = trackResult.tracking_data;
    const shipmentTrack = trackData.shipment_track?.[0];
    const activities = trackData.shipment_track_activities || [];

    // Map Shiprocket statuses to our timeline statuses
    const currentStatus = shipmentTrack?.current_status || 'UNKNOWN';

    const timeline = buildTimeline(currentStatus, activities, shipmentTrack);

    // Store tracking updates in database if we have an order_id
    if (orderId && activities.length > 0) {
        try {
            // First find the shipment record
            const { data: shipment } = await admin
                .from('shipments')
                .select('id')
                .eq('order_id', orderId)
                .single();

            if (shipment) {
                // Update shipment status
                await admin
                    .from('shipments')
                    .update({
                        status: currentStatus,
                        delivered_date: shipmentTrack?.delivered_date || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', shipment.id);

                // Upsert latest tracking activities (keep last 50)
                const trackingEntries = activities.slice(0, 50).map((a: any) => ({
                    shipment_id: shipment.id,
                    order_id: orderId,
                    status: a.sr_status_label || a.status || '',
                    activity: a.activity || '',
                    location: a.location || '',
                    sr_status: a.sr_status || '',
                    sr_status_label: a.sr_status_label || '',
                    event_time: a.date || new Date().toISOString(),
                }));

                // Delete old tracking updates for this shipment, then insert new
                await admin.from('tracking_updates').delete().eq('shipment_id', shipment.id);
                await admin.from('tracking_updates').insert(trackingEntries);
            }

            // Also update order status to match Shiprocket
            const mappedStatus = mapShiprocketToOrderStatus(currentStatus);
            if (mappedStatus) {
                await admin
                    .from('orders')
                    .update({ status: mappedStatus })
                    .eq('id', orderId);
            }
        } catch (dbErr) {
            console.warn('Failed to persist tracking data:', dbErr);
        }
    }

    return NextResponse.json({
        available: true,
        current_status: currentStatus,
        etd: trackData.etd || shipmentTrack?.etd || '',
        track_url: trackData.track_url || '',
        delivered_date: shipmentTrack?.delivered_date || null,
        pickup_date: shipmentTrack?.pickup_date || null,
        timeline,
        activities: activities.map((a: any) => ({
            date: a.date,
            status: a.sr_status_label || a.status,
            activity: a.activity,
            location: a.location,
        })),
    });
}

interface TimelineStep {
    key: string;
    label: string;
    completed: boolean;
    active: boolean;
    date?: string;
    location?: string;
}

function buildTimeline(
    currentStatus: string,
    activities: any[],
    shipmentTrack: any
): TimelineStep[] {
    const statusOrder = [
        { key: 'order_placed', label: 'Order Placed' },
        { key: 'pickup', label: 'Picked Up' },
        { key: 'in_transit', label: 'In Transit' },
        { key: 'out_for_delivery', label: 'Out for Delivery' },
        { key: 'delivered', label: 'Delivered' },
    ];

    // Map Shiprocket status to our timeline step index
    const statusMap: Record<string, number> = {
        'NEW': 0,
        'AWB Assigned': 0,
        'READY TO SHIP': 0,
        'PICKED UP': 1,
        'SHIPPED': 1,
        'IN TRANSIT': 2,
        'REACHED AT DESTINTATION HUB': 2,
        'OUT FOR DELIVERY': 3,
        'DELIVERED': 4,
        'RTO INITIATED': 2,
        'RTO DELIVERED': 2,
        'CANCELLED': -1,
        'LOST': -1,
        'DAMAGED': -1,
    };

    const normalizedStatus = currentStatus.toUpperCase();
    let currentIndex = 0;

    // Find the matching status
    for (const [key, idx] of Object.entries(statusMap)) {
        if (normalizedStatus.includes(key.toUpperCase())) {
            currentIndex = idx;
            break;
        }
    }

    // Order is always placed
    currentIndex = Math.max(0, currentIndex);

    // Build timeline with activity dates
    return statusOrder.map((step, idx) => {
        let date: string | undefined;
        let location: string | undefined;

        // Try to find matching activity for this step
        if (idx === 0 && shipmentTrack) {
            date = shipmentTrack.pickup_date || undefined;
        } else if (idx === 4 && shipmentTrack?.delivered_date) {
            date = shipmentTrack.delivered_date;
        } else {
            // Search activities for matching step
            const matchingActivity = activities.find((a: any) => {
                const label = (a.sr_status_label || a.status || '').toUpperCase();
                if (idx === 1 && (label.includes('PICKED') || label.includes('SHIPPED'))) return true;
                if (idx === 2 && label.includes('TRANSIT')) return true;
                if (idx === 3 && label.includes('OUT FOR DELIVERY')) return true;
                if (idx === 4 && label.includes('DELIVERED')) return true;
                return false;
            });
            if (matchingActivity) {
                date = matchingActivity.date;
                location = matchingActivity.location;
            }
        }

        return {
            key: step.key,
            label: step.label,
            completed: idx <= currentIndex,
            active: idx === currentIndex,
            date,
            location,
        };
    });
}

function mapShiprocketToOrderStatus(shiprocketStatus: string): string | null {
    const normalized = shiprocketStatus.toUpperCase();

    if (normalized.includes('DELIVERED')) return 'Delivered';
    if (normalized.includes('OUT FOR DELIVERY')) return 'Shipped';
    if (normalized.includes('IN TRANSIT')) return 'Shipped';
    if (normalized.includes('PICKED') || normalized.includes('SHIPPED')) return 'Shipped';
    if (normalized.includes('CANCELLED')) return 'Cancelled';
    if (normalized.includes('RTO')) return 'Returned';

    return null; // Don't change status if we can't map it
}

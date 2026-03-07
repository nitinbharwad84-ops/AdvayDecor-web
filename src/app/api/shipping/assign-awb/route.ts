import { NextResponse } from 'next/server';
import { assignAWB } from '@/lib/shiprocket';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/shipping/assign-awb
 * 
 * Assign a courier and generate AWB for a shipment.
 */
export async function POST(request: Request) {
    try {
        const { shipment_id, courier_id } = await request.json();

        if (!shipment_id) {
            return NextResponse.json({ error: 'shipment_id is required' }, { status: 400 });
        }

        const result = await assignAWB(shipment_id, courier_id);

        if (result.awb_assign_status === 1 && result.response?.data) {
            const awbData = result.response.data;
            const admin = createAdminClient();

            // Update the shipment record
            await admin
                .from('shipments')
                .update({
                    awb_code: awbData.awb_code,
                    courier_name: awbData.courier_name,
                    status: 'AWB_ASSIGNED',
                    updated_at: new Date().toISOString(),
                })
                .eq('shipment_id', shipment_id);

            // Also update the orders table
            await admin
                .from('orders')
                .update({
                    awb_code: awbData.awb_code,
                    courier_name: awbData.courier_name,
                })
                .eq('shipment_id', shipment_id);

            return NextResponse.json({
                success: true,
                awb_code: awbData.awb_code,
                courier_name: awbData.courier_name,
                courier_company_id: awbData.courier_company_id,
            });
        }

        return NextResponse.json({
            success: false,
            error: 'AWB assignment failed',
            details: result,
        }, { status: 400 });
    } catch (error) {
        console.error('AWB assignment error:', error);
        return NextResponse.json({ error: 'Failed to assign AWB' }, { status: 500 });
    }
}

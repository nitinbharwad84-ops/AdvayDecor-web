import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { checkPincodeServiceability } from '@/lib/shiprocket';

/**
 * POST /api/shiprocket/check-pincode
 * Body: { pincode }
 * 
 * Checks if delivery is possible to the given pincode via Shiprocket.
 * Falls back to India Post API if Shiprocket is disabled.
 */
export async function POST(request: NextRequest) {
    try {
        const { pincode } = await request.json();

        if (!pincode || pincode.length !== 6) {
            return NextResponse.json({ error: 'Valid 6-digit pincode required' }, { status: 400 });
        }

        // Fetch site config
        const admin = createAdminClient();
        const { data: configRows } = await admin.from('site_config').select('key, value');
        const config: Record<string, string> = {};
        (configRows || []).forEach((r: { key: string; value: string }) => { config[r.key] = r.value; });

        const shiprocketEnabled = config.shiprocket_enabled === 'true';
        const pincodeCheckEnabled = config.shiprocket_pincode_check !== 'false';
        const pickupPincode = config.shiprocket_pickup_location_id || '';

        // If Shiprocket is enabled and pincode check is on, use Shiprocket
        if (shiprocketEnabled && pincodeCheckEnabled && pickupPincode) {
            try {
                const result = await checkPincodeServiceability(
                    pickupPincode,
                    pincode,
                    0.5, // Default weight for check
                    false,
                );

                if (result.available) {
                    return NextResponse.json({
                        available: true,
                        courier_name: result.courier_name,
                        estimated_delivery_days: result.estimated_delivery_days,
                        etd: result.etd,
                        source: 'shiprocket',
                    });
                } else {
                    return NextResponse.json({
                        available: false,
                        message: 'Delivery not available to this pincode.',
                        source: 'shiprocket',
                    });
                }
            } catch (err) {
                console.error('Shiprocket pincode check failed, falling back:', err);
                // Fall through to India Post fallback
            }
        }

        // Fallback: India Post API
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await res.json();

            if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
                const po = data[0].PostOffice[0];
                const area = `${po.Name}, ${po.District}, ${po.State}`;

                // Estimate delivery based on region
                let estimatedDays = 7;
                const district = (po.District || '').toLowerCase();
                const state = (po.State || '').toLowerCase();

                const metroCities = ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad'];
                if (metroCities.some(c => district.includes(c))) estimatedDays = 4;
                else if (['maharashtra', 'karnataka', 'tamil nadu', 'gujarat'].includes(state)) estimatedDays = 6;
                else if (['arunachal pradesh', 'assam', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'sikkim', 'tripura'].includes(state)) estimatedDays = 10;

                return NextResponse.json({
                    available: true,
                    area,
                    estimated_delivery_days: estimatedDays,
                    source: 'india_post',
                });
            }

            return NextResponse.json({
                available: false,
                message: 'Invalid pincode or delivery not available.',
                source: 'india_post',
            });
        } catch (fallbackErr) {
            // Both failed — assume delivery is possible
            return NextResponse.json({
                available: true,
                estimated_delivery_days: 7,
                message: 'Delivery available. Estimated 5-7 business days.',
                source: 'fallback',
            });
        }

    } catch (err) {
        console.error('Error in check-pincode:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

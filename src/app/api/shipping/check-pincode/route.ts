import { NextResponse } from 'next/server';
import { checkServiceability } from '@/lib/shiprocket';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/shipping/check-pincode
 * 
 * Check if delivery is available for a given pincode.
 * Uses a 6-hour Supabase cache to avoid redundant Shiprocket API calls.
 */
export async function POST(request: Request) {
    try {
        const { delivery_pincode, weight = 0.5, cod = false } = await request.json();

        if (!delivery_pincode || delivery_pincode.length !== 6) {
            return NextResponse.json({ error: 'Valid 6-digit pincode is required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Check if Shiprocket is enabled
        const { data: configData } = await admin
            .from('site_config')
            .select('key, value')
            .in('key', ['shiprocket_enabled', 'shiprocket_pincode_check', 'shiprocket_pickup_pincode', 'shiprocket_default_weight']);

        const config: Record<string, string> = {};
        configData?.forEach((row: { key: string; value: string }) => {
            config[row.key] = row.value;
        });

        const shiprocketEnabled = config.shiprocket_enabled !== 'false';
        const pincodeCheckEnabled = config.shiprocket_pincode_check !== 'false';
        const pickupPincode = config.shiprocket_pickup_pincode || '110001';
        const defaultWeight = parseFloat(config.shiprocket_default_weight || '0.5');

        // If Shiprocket or pincode check is disabled, return generic availability
        if (!shiprocketEnabled || !pincodeCheckEnabled) {
            return NextResponse.json({
                available: true,
                delivery_estimate: '5-7 business days',
                shipping_cost: 0,
                courier_name: null,
                source: 'fallback',
            });
        }

        const effectiveWeight = weight || defaultWeight;

        // Check cache first (6-hour TTL)
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
        const { data: cached } = await admin
            .from('pincode_cache')
            .select('response_data')
            .eq('pickup_pincode', pickupPincode)
            .eq('delivery_pincode', delivery_pincode)
            .eq('weight', effectiveWeight)
            .eq('cod', cod)
            .gte('cached_at', sixHoursAgo)
            .single();

        if (cached?.response_data) {
            return NextResponse.json({
                ...cached.response_data,
                source: 'cache',
            });
        }

        // Call Shiprocket API
        const result = await checkServiceability(pickupPincode, delivery_pincode, effectiveWeight, cod);

        if (!result.available || !result.cheapest) {
            return NextResponse.json({
                available: false,
                message: 'Delivery is not available to this pincode',
                source: 'shiprocket',
            });
        }

        const responseData = {
            available: true,
            delivery_estimate: `${result.cheapest.estimated_delivery_days} days`,
            estimated_delivery_date: result.cheapest.estimated_delivery_date,
            shipping_cost: Math.round(result.cheapest.rate),
            courier_name: result.cheapest.courier_name,
            fastest: result.fastest ? {
                delivery_estimate: `${result.fastest.estimated_delivery_days} days`,
                estimated_delivery_date: result.fastest.estimated_delivery_date,
                shipping_cost: Math.round(result.fastest.rate),
                courier_name: result.fastest.courier_name,
            } : null,
            total_couriers: result.couriers.length,
        };

        // Cache the result
        try {
            await admin.from('pincode_cache').upsert({
                pickup_pincode: pickupPincode,
                delivery_pincode: delivery_pincode,
                weight: effectiveWeight,
                cod,
                response_data: responseData,
                cached_at: new Date().toISOString(),
            }, { onConflict: 'pickup_pincode,delivery_pincode,weight,cod' });
        } catch (cacheErr) {
            console.warn('Failed to cache pincode result:', cacheErr);
        }

        return NextResponse.json({ ...responseData, source: 'shiprocket' });
    } catch (error) {
        console.error('Pincode check error:', error);
        // Graceful fallback
        return NextResponse.json({
            available: true,
            delivery_estimate: '5-7 business days',
            shipping_cost: 0,
            courier_name: null,
            source: 'fallback',
            error: 'Service temporarily unavailable',
        });
    }
}

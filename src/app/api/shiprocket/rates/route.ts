import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { checkPincodeServiceability, getShippingRates, getChargeableWeight } from '@/lib/shiprocket';

/**
 * POST /api/shiprocket/rates
 * Body: { delivery_pincode, items: [{ weight, length, width, height }], payment_method }
 * 
 * Returns shipping rates or falls back to config-defined fee.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { delivery_pincode, items, payment_method } = body;

        if (!delivery_pincode) {
            return NextResponse.json({ error: 'delivery_pincode is required' }, { status: 400 });
        }

        // Fetch site config
        const admin = createAdminClient();
        const { data: configRows } = await admin.from('site_config').select('key, value');
        const config: Record<string, string> = {};
        (configRows || []).forEach((r: { key: string; value: string }) => { config[r.key] = r.value; });

        const shiprocketEnabled = config.shiprocket_enabled === 'true';
        const shippingMode = config.shipping_mode || 'fixed';
        const fixedFee = parseFloat(config.global_shipping_fee || '50');
        const fallbackFee = parseFloat(config.shipping_fallback_fee || config.global_shipping_fee || '50');
        const pickupPincode = config.shiprocket_pickup_location_id || '';

        // If Shiprocket is disabled or shipping is fixed mode, return fixed fee
        if (!shiprocketEnabled || shippingMode === 'fixed') {
            return NextResponse.json({
                mode: 'fixed',
                shipping_fee: fixedFee,
                courier_name: null,
                estimated_delivery_days: null,
                etd: null,
            });
        }

        // Calculate total cart weight
        let totalWeight = 0;
        let maxLength = 0, maxWidth = 0, totalHeight = 0;

        if (items && items.length > 0) {
            for (const item of items) {
                const w = item.weight || 0.5;
                const l = item.length || 20;
                const wd = item.width || 20;
                const h = item.height || 10;
                const qty = item.quantity || 1;

                totalWeight += w * qty;
                maxLength = Math.max(maxLength, l);
                maxWidth = Math.max(maxWidth, wd);
                totalHeight += h * qty;
            }
        } else {
            totalWeight = 0.5;
        }

        // Chargeable weight (actual vs volumetric)
        const chargeableWeight = getChargeableWeight(totalWeight, maxLength, maxWidth, totalHeight);

        const isCod = payment_method === 'COD';

        try {
            // Try to get rates from Shiprocket
            const rates = await getShippingRates(
                pickupPincode,
                delivery_pincode,
                chargeableWeight,
                isCod,
            );

            if (rates.length === 0) {
                // No couriers available — fallback
                return NextResponse.json({
                    mode: 'fallback',
                    shipping_fee: fallbackFee,
                    courier_name: null,
                    estimated_delivery_days: null,
                    etd: null,
                    message: 'No couriers available for this pincode. Using standard rate.',
                });
            }

            // Pick based on priority
            const priority = config.courier_priority || 'recommended';
            let selected = rates[0]; // default: recommended (Shiprocket's order)

            if (priority === 'cheapest') {
                selected = rates.reduce((a, b) => a.rate < b.rate ? a : b);
            } else if (priority === 'fastest') {
                selected = rates.reduce((a, b) =>
                    a.estimated_delivery_days < b.estimated_delivery_days ? a : b
                );
            }

            return NextResponse.json({
                mode: 'variable',
                shipping_fee: selected.rate,
                courier_company_id: selected.courier_company_id,
                courier_name: selected.courier_name,
                estimated_delivery_days: selected.estimated_delivery_days,
                etd: selected.etd,
                all_rates: rates,
            });

        } catch (apiError) {
            console.error('Shiprocket rate API error:', apiError);
            // Fallback fee
            return NextResponse.json({
                mode: 'fallback',
                shipping_fee: fallbackFee,
                courier_name: null,
                estimated_delivery_days: null,
                etd: null,
                message: 'Shipping rate service unavailable. Using standard rate.',
            });
        }

    } catch (err) {
        console.error('Error in shiprocket/rates:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

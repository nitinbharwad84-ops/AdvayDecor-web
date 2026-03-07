import { NextResponse } from 'next/server';
import { calculateShippingRates } from '@/lib/shiprocket';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/shipping/calculate-rates
 * 
 * Calculate shipping rates for a given order (used at checkout).
 */
export async function POST(request: Request) {
    try {
        const { delivery_pincode, items, cod = false } = await request.json();

        if (!delivery_pincode || delivery_pincode.length !== 6) {
            return NextResponse.json({ error: 'Valid 6-digit delivery pincode is required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Fetch settings
        const { data: configData } = await admin
            .from('site_config')
            .select('key, value')
            .in('key', [
                'shiprocket_enabled', 'shiprocket_rate_calculation',
                'shiprocket_pickup_pincode', 'shiprocket_default_weight',
                'shiprocket_fixed_shipping_fee', 'shiprocket_free_shipping_threshold',
            ]);

        const config: Record<string, string> = {};
        configData?.forEach((row: { key: string; value: string }) => {
            config[row.key] = row.value;
        });

        const shiprocketEnabled = config.shiprocket_enabled !== 'false';
        const rateCalcEnabled = config.shiprocket_rate_calculation !== 'false';
        const pickupPincode = config.shiprocket_pickup_pincode || '110001';
        const defaultWeight = parseFloat(config.shiprocket_default_weight || '0.5');
        const fixedFee = parseFloat(config.shiprocket_fixed_shipping_fee || '50');
        const freeThreshold = parseFloat(config.shiprocket_free_shipping_threshold || '999');

        // Calculate cart total for free shipping check
        let cartTotal = 0;
        if (items && items.length > 0) {
            cartTotal = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
        }

        // If rate calculation is disabled, return fixed fee
        if (!shiprocketEnabled || !rateCalcEnabled) {
            const shippingFee = cartTotal >= freeThreshold ? 0 : fixedFee;
            return NextResponse.json({
                shipping_fee: shippingFee,
                delivery_estimate: '5-7 business days',
                courier_name: null,
                is_free: shippingFee === 0,
                free_threshold: freeThreshold,
                source: 'fixed',
            });
        }

        // Calculate total weight and dimensions from items
        let totalWeight = 0;
        let maxLength = 10;
        let maxBreadth = 10;
        let totalHeight = 0;

        if (items && items.length > 0) {
            // Fetch product dimensions from database
            const productIds = items.map((i: any) => i.product_id).filter(Boolean);
            if (productIds.length > 0) {
                const { data: products } = await admin
                    .from('products')
                    .select('id, weight, length, breadth, height')
                    .in('id', productIds);

                const productMap: Record<string, any> = {};
                products?.forEach((p: any) => { productMap[p.id] = p; });

                for (const item of items) {
                    const product = productMap[item.product_id];
                    const qty = item.quantity || 1;
                    const w = product?.weight || defaultWeight;
                    const l = product?.length || 10;
                    const b = product?.breadth || 10;
                    const h = product?.height || 10;

                    totalWeight += w * qty;
                    maxLength = Math.max(maxLength, l);
                    maxBreadth = Math.max(maxBreadth, b);
                    totalHeight += h * qty;
                }
            } else {
                totalWeight = defaultWeight;
            }
        } else {
            totalWeight = defaultWeight;
        }

        // Call Shiprocket for rates
        const result = await calculateShippingRates({
            pickupPincode,
            deliveryPincode: delivery_pincode,
            weight: totalWeight,
            length: maxLength,
            breadth: maxBreadth,
            height: totalHeight,
            cod,
            declaredValue: cartTotal || undefined,
        });

        if (!result.available || !result.cheapest) {
            // Fallback to fixed fee if Shiprocket returns no couriers
            const shippingFee = cartTotal >= freeThreshold ? 0 : fixedFee;
            return NextResponse.json({
                shipping_fee: shippingFee,
                delivery_estimate: '5-7 business days',
                courier_name: null,
                is_free: shippingFee === 0,
                free_threshold: freeThreshold,
                source: 'fallback',
            });
        }

        // Check free shipping threshold
        const shiprocketRate = Math.round(result.cheapest.rate);
        const shippingFee = cartTotal >= freeThreshold ? 0 : shiprocketRate;

        return NextResponse.json({
            shipping_fee: shippingFee,
            delivery_estimate: `${result.cheapest.estimated_delivery_days} days`,
            estimated_delivery_date: result.cheapest.estimated_delivery_date,
            courier_name: result.cheapest.courier_name,
            is_free: shippingFee === 0,
            free_threshold: freeThreshold,
            all_couriers: result.couriers.map(c => ({
                name: c.courier_name,
                rate: Math.round(c.rate),
                days: c.estimated_delivery_days,
                etd: c.estimated_delivery_date,
            })),
            source: 'shiprocket',
        });
    } catch (error) {
        console.error('Rate calculation error:', error);
        return NextResponse.json({
            shipping_fee: 50,
            delivery_estimate: '5-7 business days',
            courier_name: null,
            is_free: false,
            source: 'error_fallback',
        });
    }
}

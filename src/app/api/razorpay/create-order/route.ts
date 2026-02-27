import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * POST /api/razorpay/create-order
 * Creates a Razorpay Order for online payment.
 * Requires NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in env.
 */
export async function POST(request: NextRequest) {
    try {
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return NextResponse.json({
                error: 'Razorpay is not configured. Online payment is unavailable.',
            }, { status: 503 });
        }

        const supabase = await createServerSupabaseClient();
        const body = await request.json();
        const { amount, currency = 'INR', receipt } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Razorpay expects amount in paise (smallest unit)
        const amountInPaise = Math.round(amount * 100);

        // Create Razorpay order via their REST API
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const razRes = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`,
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
            }),
        });

        if (!razRes.ok) {
            const err = await razRes.json();
            console.error('Razorpay order creation failed:', err);
            return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
        }

        const razOrder = await razRes.json();

        return NextResponse.json({
            order_id: razOrder.id,
            amount: razOrder.amount,
            currency: razOrder.currency,
            key_id: keyId,
        });
    } catch (err) {
        console.error('Razorpay error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

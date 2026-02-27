import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/razorpay/verify
 * Verifies a Razorpay payment signature after the checkout modal is completed.
 */
export async function POST(request: NextRequest) {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 });
        }

        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
        }

        // Verify signature using HMAC SHA256
        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            console.error('Razorpay signature mismatch');
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
        });
    } catch (err) {
        console.error('Razorpay verification error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

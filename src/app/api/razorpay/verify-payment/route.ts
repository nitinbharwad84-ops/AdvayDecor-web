import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
        }

        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_secret) {
            return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 });
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', key_secret)
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            payment_id: razorpay_payment_id,
        });
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

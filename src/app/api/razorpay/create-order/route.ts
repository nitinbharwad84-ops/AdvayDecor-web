import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { amount, currency = 'INR', receipt } = await request.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 });
        }

        // Create order via Razorpay Orders API
        const res = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${key_id}:${key_secret}`).toString('base64'),
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Razorpay expects amount in paise
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Razorpay create order error:', data);
            return NextResponse.json({ error: data.error?.description || 'Failed to create Razorpay order' }, { status: 400 });
        }

        return NextResponse.json({
            order_id: data.id,
            amount: data.amount,
            currency: data.currency,
            key_id,
        });
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// Simple in-memory rate limiter for OTP verification attempts
const verifyAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_VERIFY_ATTEMPTS = 10; // max verify attempts per email per window
const VERIFY_WINDOW = 15 * 60 * 1000; // 15-minute window

function isVerifyLimited(email: string): boolean {
    const now = Date.now();
    const entry = verifyAttempts.get(email);

    if (!entry || now > entry.resetAt) {
        verifyAttempts.set(email, { count: 1, resetAt: now + VERIFY_WINDOW });
        return false;
    }

    if (entry.count >= MAX_VERIFY_ATTEMPTS) {
        return true;
    }

    entry.count++;
    return false;
}

export async function POST(request: Request) {
    try {
        const { email, password, fullName, otp } = await request.json();

        if (!email || !password || !otp) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Rate limiting check
        if (isVerifyLimited(email)) {
            return NextResponse.json({ error: 'Too many verification attempts. Please request a new code.' }, { status: 429 });
        }

        const admin = createAdminClient();

        // 1. Verify OTP
        const { data: otpData, error: otpError } = await admin
            .from('email_verification_otps')
            .select('*')
            .eq('email', email)
            .eq('otp', otp)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (otpError || !otpData) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        // 2. Clear used OTP
        await admin
            .from('email_verification_otps')
            .delete()
            .eq('email', email);

        // 3. Create confirmed user in Supabase
        const { data: userData, error: signupError } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (signupError) {
            console.error('Signup error:', signupError);
            return NextResponse.json({ error: signupError.message }, { status: 500 });
        }

        // Reset rate limit counter on success
        verifyAttempts.delete(email);

        return NextResponse.json({
            success: true,
            message: 'Account created and verified successfully!'
        });

    } catch (err) {
        console.error('Verify & Signup error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

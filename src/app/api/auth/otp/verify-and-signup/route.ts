import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const { email, password, fullName, otp } = await request.json();

        if (!email || !password || !otp) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

        return NextResponse.json({
            success: true,
            message: 'Account created and verified successfully!'
        });

    } catch (err) {
        console.error('Verify & Signup error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

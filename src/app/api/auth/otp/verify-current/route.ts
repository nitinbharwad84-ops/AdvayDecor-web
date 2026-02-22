import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { otp } = await request.json();
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = user.email;
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

        // 2. Delete the used OTP
        await admin
            .from('email_verification_otps')
            .delete()
            .eq('id', otpData.id);

        return NextResponse.json({
            success: true,
            message: 'Identity verified. You can now enter your new email address.'
        });

    } catch (err) {
        console.error('OTP verification error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

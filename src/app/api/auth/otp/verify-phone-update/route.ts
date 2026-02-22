import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { phone, otp } = await request.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/[^\d+]/g, '');

        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();

        // 1. Verify OTP
        const { data: otpData, error: otpError } = await admin
            .from('phone_verification_otps')
            .select('*')
            .eq('phone', cleanPhone)
            .eq('otp', otp)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (otpError || !otpData) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        // 2. Double check uniqueness one last time
        const { data: existingProfile } = await admin
            .from('profiles')
            .select('id')
            .eq('phone', cleanPhone)
            .neq('id', user.id)
            .single();

        if (existingProfile) {
            return NextResponse.json({ error: 'This phone number was just taken by another account' }, { status: 400 });
        }

        // 3. Update Profile
        const { error: updateError } = await admin
            .from('profiles')
            .update({ phone: cleanPhone })
            .eq('id', user.id);

        if (updateError) {
            console.error('Phone update error:', updateError);
            return NextResponse.json({ error: 'Failed to update phone number' }, { status: 500 });
        }

        // 4. Clean up OTP
        await admin
            .from('phone_verification_otps')
            .delete()
            .eq('id', otpData.id);

        return NextResponse.json({
            success: true,
            message: 'Phone number verified and updated successfully.'
        });

    } catch (err: any) {
        console.error('Phone verification error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

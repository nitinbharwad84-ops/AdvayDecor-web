import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { phone, otp } = await request.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
        }

        if (otp.length !== 8) {
            return NextResponse.json({ error: 'OTP must be 8 digits' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/[^\d+]/g, '');

        // 1. Authenticate user
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!user.email) {
            return NextResponse.json({ error: 'No email on account' }, { status: 400 });
        }

        const admin = createAdminClient();

        // 2. Rate limit: max 10 verification attempts per 15 min
        const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const { count } = await admin
            .from('email_verification_otps')
            .select('id', { count: 'exact', head: true })
            .eq('email', user.email)
            .gte('created_at', fifteenMinAgo);

        // We use the OTP records count as a proxy for attempts
        // If more than 10 OTPs exist in the window, something is off
        if ((count || 0) > 10) {
            return NextResponse.json({
                error: 'Too many attempts. Please try again later.'
            }, { status: 429 });
        }

        // 3. Find the latest valid OTP for this user's email
        const { data: otpRecord } = await admin
            .from('email_verification_otps')
            .select('*')
            .eq('email', user.email)
            .eq('otp', otp)
            .gte('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!otpRecord) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        // 4. OTP is valid — delete it so it can't be reused
        await admin
            .from('email_verification_otps')
            .delete()
            .eq('id', otpRecord.id);

        // 5. Double-check phone uniqueness one last time
        const { data: existingProfile } = await admin
            .from('profiles')
            .select('id')
            .eq('phone', cleanPhone)
            .neq('id', user.id)
            .maybeSingle();

        if (existingProfile) {
            return NextResponse.json({
                error: 'This phone number was just taken by another account'
            }, { status: 400 });
        }

        // 6. Update the profile with the verified phone number
        const { error: updateError } = await admin
            .from('profiles')
            .update({ phone: cleanPhone })
            .eq('id', user.id);

        if (updateError) {
            console.error('Phone update error:', updateError);
            return NextResponse.json({ error: 'Failed to update phone number' }, { status: 500 });
        }

        // 7. Clean up all remaining OTPs for this email (optional housekeeping)
        await admin
            .from('email_verification_otps')
            .delete()
            .eq('email', user.email)
            .lt('expires_at', new Date().toISOString());

        return NextResponse.json({
            success: true,
            message: 'Phone number verified and updated successfully.'
        });

    } catch (err: unknown) {
        console.error('Phone verification error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

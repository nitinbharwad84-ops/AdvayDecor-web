import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { newEmail, otp } = await request.json();

        if (!newEmail || !otp) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();

        // 1. Verify OTP for new email
        const { data: otpData, error: otpError } = await admin
            .from('email_verification_otps')
            .select('*')
            .eq('email', newEmail)
            .eq('otp', otp)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (otpError || !otpData) {
            return NextResponse.json({ error: 'Invalid or expired verification code for new email' }, { status: 400 });
        }

        // 2. Update Email in Auth via Admin SDK (this bypasses manual confirmation emails)
        const { data: updateData, error: updateError } = await admin.auth.admin.updateUserById(
            user.id,
            { email: newEmail, email_confirm: true }
        );

        if (updateError) {
            console.error('Error updating user email:', updateError);
            return NextResponse.json({ error: 'Failed to update user account' }, { status: 500 });
        }

        // 3. Update Email in the Profiles table
        const { error: profileError } = await admin
            .from('profiles')
            .update({ email: newEmail })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error updating profile email:', profileError);
            // Non-critical if auth succeeds, but we should log it
        }

        // 4. Clean up OTP
        await admin
            .from('email_verification_otps')
            .delete()
            .eq('id', otpData.id);

        return NextResponse.json({
            success: true,
            message: 'Your email has been successfully updated.'
        });

    } catch (err) {
        console.error('Email update error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

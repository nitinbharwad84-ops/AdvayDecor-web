import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = user.email;
        const admin = createAdminClient();

        // 1. Generate 8-digit OTP
        const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // 2. Save OTP to database
        await admin
            .from('email_verification_otps')
            .delete()
            .eq('email', email);

        const { error: insertError } = await admin
            .from('email_verification_otps')
            .insert({
                email,
                otp,
                expires_at: expiresAt
            });

        if (insertError) {
            console.error('Error saving OTP:', insertError);
            return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
        }

        // 3. Send Email
        await sendEmail({
            to: email,
            subject: 'Security Code to Change Email - AdvayDecor',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #0a0a23; max-width: 600px; margin: auto; border: 1px solid #e8e4dc; border-radius: 12px;">
                    <h2 style="color: #00b4d8;">Verification Required</h2>
                    <p>We received a request to change the email address for your AdvayDecor account.</p>
                    <p>Please enter the following 8-digit code to verify your identity:</p>
                    <div style="background: #fdfbf7; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #00b4d8;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #9e9eb8;">If you did not request this change, please ignore this email and ensure your account is secure.</p>
                    <hr style="border: none; border-top: 1px solid #f0ece4; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #9e9eb8; text-align: center;">© 2026 AdvayDecor. All rights reserved.</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true, message: 'OTP sent to your current email.' });

    } catch (err) {
        console.error('OTP Send error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

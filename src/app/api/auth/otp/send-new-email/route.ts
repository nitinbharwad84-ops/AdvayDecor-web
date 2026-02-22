import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const { newEmail } = await request.json();

        if (!newEmail) {
            return NextResponse.json({ error: 'New email is required' }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();

        // 1. Check if new email is already taken
        const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
        if (listError) throw listError;

        const emailExists = users.some(u => u.email?.toLowerCase() === newEmail.toLowerCase());
        if (emailExists) {
            return NextResponse.json({ error: 'This email is already associated with another account' }, { status: 400 });
        }

        // 2. Generate 8-digit OTP
        const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // 3. Save OTP to database
        await admin
            .from('email_verification_otps')
            .delete()
            .eq('email', newEmail);

        const { error: insertError } = await admin
            .from('email_verification_otps')
            .insert({
                email: newEmail,
                otp,
                expires_at: expiresAt
            });

        if (insertError) {
            console.error('Error saving OTP:', insertError);
            return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
        }

        // 4. Send Email
        await sendEmail({
            to: newEmail,
            subject: 'Confirm your new email - AdvayDecor',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #0a0a23; max-width: 600px; margin: auto; border: 1px solid #e8e4dc; border-radius: 12px;">
                    <h2 style="color: #00b4d8;">Verify your new email</h2>
                    <p>You are requesting to change your AdvayDecor account email to this address.</p>
                    <p>Please enter the following 8-digit code to confirm you own this email:</p>
                    <div style="background: #fdfbf7; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #00b4d8;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #9e9eb8;">This code will expire in 10 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #f0ece4; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #9e9eb8; text-align: center;">© 2026 AdvayDecor. All rights reserved.</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true, message: 'Verification code sent to your new email.' });

    } catch (err) {
        console.error('OTP Send error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

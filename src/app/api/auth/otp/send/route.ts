import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // 1. Check if user already exists in auth.users
        const { data: { users }, error: listError } = await admin.auth.admin.listUsers();

        if (listError) {
            console.error('Error listing users:', listError);
            return NextResponse.json({ error: 'Failed to verify email availability' }, { status: 500 });
        }

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
        }

        // 2. Generate 8-digit OTP
        const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

        // 3. Save OTP to database (delete old ones for this email first)
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

        // 4. Send Email
        const result = await sendEmail({
            to: email,
            subject: 'Verify your AdvayDecor Account',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #0a0a23; max-width: 600px; margin: auto; border: 1px solid #e8e4dc; border-radius: 12px;">
                    <h2 style="color: #00b4d8;">Welcome to AdvayDecor!</h2>
                    <p>Please use the following 8-digit code to verify your email address and complete your signup:</p>
                    <div style="background: #fdfbf7; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #00b4d8;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #9e9eb8;">This code will expire in 10 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #f0ece4; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #9e9eb8; text-align: center;">© 2024 AdvayDecor. All rights reserved.</p>
                </div>
            `,
        });

        let feedback = 'Verification code sent to your email.';
        if (result.method === 'console') {
            feedback = 'Testing Mode: Verification code logged to terminal.';
        } else if (result.method === 'resend' && email !== 'nitinbharwad44@gmail.com') {
            // We know it might fail if unverified, but we rely on sendEmail's catch-all if it actually throws.
            // If resend returns success but it was actually restricted, we've handled that in sendEmail's error check.
        }

        return NextResponse.json({
            success: true,
            message: feedback
        });

    } catch (err) {
        console.error('OTP Send error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

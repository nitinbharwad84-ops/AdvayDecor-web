import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone } = body;

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Clean phone number (keep only digits and +)
        const cleanPhone = phone.replace(/[^\d+]/g, '');

        if (cleanPhone.length < 10) {
            return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
        }

        // 1. Verify user is authenticated
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!user.email) {
            return NextResponse.json({ error: 'No email address on account to send OTP' }, { status: 400 });
        }

        const admin = createAdminClient();

        // 2. Check if phone is already used by another account
        const { data: existingProfile } = await admin
            .from('profiles')
            .select('id, email')
            .eq('phone', cleanPhone)
            .neq('id', user.id)
            .maybeSingle();

        if (existingProfile) {
            return NextResponse.json({
                error: 'This phone number is already linked to another account'
            }, { status: 400 });
        }

        // 3. Rate limit: max 5 OTP requests per 15 minutes per user
        const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const { count } = await admin
            .from('email_verification_otps')
            .select('id', { count: 'exact', head: true })
            .eq('email', user.email)
            .gte('created_at', fifteenMinAgo);

        if ((count || 0) >= 5) {
            return NextResponse.json({
                error: 'Too many OTP requests. Please try again in 15 minutes.'
            }, { status: 429 });
        }

        // 4. Generate OTP and store it
        const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

        await admin.from('email_verification_otps').insert({
            email: user.email,
            otp,
            expires_at: expiresAt,
        });

        // 5. Send OTP via email
        await sendEmail({
            to: user.email,
            subject: 'AdvayDecor — Phone Number Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fdfbf7; border-radius: 16px;">
                    <h2 style="color: #0a0a23; margin-bottom: 16px;">Phone Number Verification</h2>
                    <p style="color: #64648b; font-size: 15px; line-height: 1.6;">
                        You requested to update your phone number to <strong>${cleanPhone}</strong>.
                        Use the code below to confirm this change:
                    </p>
                    <div style="background: #0a0a23; color: #fff; font-size: 28px; font-weight: 700; letter-spacing: 6px; text-align: center; padding: 20px; border-radius: 12px; margin: 24px 0;">
                        ${otp}
                    </div>
                    <p style="color: #9e9eb8; font-size: 13px;">
                        This code expires in 10 minutes. If you didn't request this, please ignore this email.
                    </p>
                </div>
            `,
        });

        return NextResponse.json({
            success: true,
            message: `Verification code sent to ${user.email}`
        });

    } catch (err: unknown) {
        console.error('Phone OTP Send error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

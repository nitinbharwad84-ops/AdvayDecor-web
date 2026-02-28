import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/mail';

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

        // 4. Send Welcome Email
        try {
            await sendEmail({
                to: email,
                subject: 'Welcome to AdvayDecor!',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #0a0a23; max-width: 600px; margin: auto; border: 1px solid #e8e4dc; border-radius: 12px;">
                        <h2 style="color: #00b4d8;">Hi ${fullName || 'there'}, welcome to AdvayDecor!</h2>
                        <p>We're thrilled to have you join our community of decor enthusiasts. Your account has been successfully created and verified.</p>
                        
                        <div style="background: #fdfbf7; padding: 20px; border-radius: 8px; margin: 24px 0;">
                            <h3 style="margin-top: 0; color: #0a0a23;">Getting Started</h3>
                            <ul style="padding-left: 20px; color: #64648b;">
                                <li>Browse our latest collections</li>
                                <li>Save your shipping addresses for faster checkout</li>
                                <li>Track your orders in real-time</li>
                            </ul>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://advaydecor.com'}/shop" 
                               style="background: #00b4d8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                               Start Shopping
                            </a>
                        </div>

                        <p style="font-size: 14px; color: #9e9eb8;">If you have any questions, just reply to this email. We're here to help!</p>
                        
                        <hr style="border: none; border-top: 1px solid #f0ece4; margin: 24px 0;" />
                        <p style="font-size: 12px; color: #9e9eb8; text-align: center;">© 2026 AdvayDecor. All rights reserved.</p>
                    </div>
                `,
            });
        } catch (mailErr) {
            console.error('Welcome Email Error:', mailErr);
            // Don't fail the signup if the welcome email fails
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

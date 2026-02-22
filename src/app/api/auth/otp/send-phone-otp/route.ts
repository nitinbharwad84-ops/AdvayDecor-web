import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendSMS } from '@/lib/sms';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, checkOnly } = body;

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Clean phone number (keep only digits and +)
        const cleanPhone = phone.replace(/[^\d+]/g, '');

        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();

        // 1. Check if phone is already used by another account
        const { data: existingProfile, error: profileError } = await admin
            .from('profiles')
            .select('id, email')
            .eq('phone', cleanPhone)
            .neq('id', user.id) // Not current user
            .maybeSingle();

        if (profileError) {
            console.error('Profile check error:', profileError);
            return NextResponse.json({ error: 'Database error while checking phone uniqueness' }, { status: 500 });
        }

        if (existingProfile) {
            return NextResponse.json({
                error: 'This phone number is already linked to another account'
            }, { status: 400 });
        }

        // 2. Generate and save internal 6-digit OTP (Fallback/Testing)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await admin
            .from('phone_verification_otps')
            .delete()
            .eq('phone', cleanPhone);

        const { error: insertError } = await admin
            .from('phone_verification_otps')
            .insert({
                phone: cleanPhone,
                otp,
                expires_at: expiresAt
            });

        if (insertError) {
            console.error('Error saving Phone OTP:', insertError);
            return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
        }

        if (checkOnly) {
            return NextResponse.json({
                success: true,
                message: 'Phone number is available',
                internalOtp: otp // Provide for frontend fallback
            });
        }

        // 3. Optional: Send SMS via Twilio if configured
        const smsResult = await sendSMS({
            to: cleanPhone,
            message: `${otp} is your AdvayDecor verification code. Valid for 10 minutes.`
        });

        if (smsResult.success) {
            return NextResponse.json({
                success: true,
                message: `Verification code sent to ${cleanPhone}.`
            });
        }

        // 4. Default Fallback
        console.log('------------------------------------------');
        console.log(`DEV OTP FOR ${cleanPhone}: ${otp}`);
        console.log('------------------------------------------');

        return NextResponse.json({
            success: true,
            testingMode: true,
            internalOtp: otp,
            message: `Testing Mode: Code logged to terminal.`
        });

    } catch (err: any) {
        console.error('Phone OTP Send error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

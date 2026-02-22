import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

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
            .single();

        if (existingProfile) {
            return NextResponse.json({
                error: 'This phone number is already linked to another account'
            }, { status: 400 });
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // 3. Save OTP to database
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

        // 4. Send SMS (Mock for now, log to console)
        console.log('------------------------------------------');
        console.log(`SMS TO: ${cleanPhone}`);
        console.log(`VERIFICATION CODE: ${otp}`);
        console.log('ALERT: SMS provider not configured. Code logged above.');
        console.log('------------------------------------------');

        return NextResponse.json({
            success: true,
            message: `Verification code sent to ${cleanPhone}. (Check terminal for code)`
        });

    } catch (err: any) {
        console.error('Phone OTP Send error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

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

        // If checkOnly is specified we just return success
        // otherwise this endpoint behaves exactly the same
        return NextResponse.json({
            success: true,
            message: 'Phone number is available'
        });

    } catch (err: any) {
        console.error('Phone OTP Send error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

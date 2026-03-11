import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// POST /api/auth/verify-seo
// Accepts a user ID and checks if they exist in seo_users table
// Uses service role key = bypasses RLS completely
export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data: seoUser, error } = await supabase
            .from('seo_users')
            .select('role, email, full_name')
            .eq('id', userId)
            .single();

        if (error || !seoUser) {
            return NextResponse.json({ error: 'Not an SEO account' }, { status: 403 });
        }

        return NextResponse.json({ role: seoUser.role, email: seoUser.email, full_name: seoUser.full_name });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

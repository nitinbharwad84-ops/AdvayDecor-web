import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// POST /api/auth/verify-admin
// Accepts a user ID and checks if they exist in admin_users table
// Uses service role key = bypasses RLS completely
export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('role, email')
            .eq('id', userId)
            .single();

        if (error || !adminUser) {
            return NextResponse.json({ error: 'Not an admin account' }, { status: 403 });
        }

        return NextResponse.json({ role: adminUser.role, email: adminUser.email });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

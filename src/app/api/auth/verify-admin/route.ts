import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// POST /api/auth/verify-admin
// Accepts a user ID and checks if they exist in admin_users table
// Uses service role key = bypasses RLS completely
export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        console.log('[verify-admin] Checking admin status for userId:', userId);

        if (!userId) {
            console.log('[verify-admin] Missing user ID');
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // First, let's see ALL admin users to debug
        const { data: allAdmins, error: listError } = await supabase
            .from('admin_users')
            .select('id, email, role');

        console.log('[verify-admin] All admin users in table:', JSON.stringify(allAdmins));
        console.log('[verify-admin] List error:', listError?.message || 'none');

        // Now check for this specific user
        const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('role, email')
            .eq('id', userId)
            .single();

        console.log('[verify-admin] Query result:', JSON.stringify(adminUser));
        console.log('[verify-admin] Query error:', error?.message || 'none');

        if (error || !adminUser) {
            return NextResponse.json({
                error: 'Not an admin account',
                debug: {
                    userId,
                    queryError: error?.message,
                    totalAdminsFound: allAdmins?.length || 0,
                    allAdminIds: allAdmins?.map(a => a.id) || [],
                }
            }, { status: 403 });
        }

        return NextResponse.json({ role: adminUser.role, email: adminUser.email });
    } catch (err) {
        console.error('[verify-admin] Server error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

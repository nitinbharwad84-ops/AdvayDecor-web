import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Helper: verify caller is an authenticated admin
async function verifyAdmin() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', status: 401, admin: null as ReturnType<typeof createAdminClient> | null };

    const admin = createAdminClient();
    const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
    if (!isAdmin) return { error: 'Unauthorized', status: 403, admin: null };

    return { error: null, status: 200, admin };
}

export async function GET() {
    try {
        const auth = await verifyAdmin();
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { data: users, error } = await auth.admin!
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ users });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Error fetching admin users:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const auth = await verifyAdmin();
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { email, password, full_name, phone } = await request.json();

        if (!email || !password || !full_name) {
            return NextResponse.json({ error: 'Email, password, and full name are required' }, { status: 400 });
        }

        // 1. Create a user in auth.users
        const { data: authData, error: authError } = await auth.admin!.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name, phone },
        });

        if (authError) throw authError;

        // Upsert profile in case the trigger fails or is missing
        if (authData.user) {
            const { error: profileError } = await auth.admin!
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email,
                    full_name,
                    phone: phone || null
                });
            if (profileError) console.error('Failed to upsert profile:', profileError);
        }

        return NextResponse.json({ success: true, user: authData.user });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Error creating user:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const auth = await verifyAdmin();
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { error } = await auth.admin!.auth.admin.deleteUser(id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const auth = await verifyAdmin();
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id, full_name, phone } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Update auth.users metadata
        const { error: authError } = await auth.admin!.auth.admin.updateUserById(id, {
            user_metadata: { full_name, phone },
        });

        if (authError) throw authError;

        // 2. Update profiles table
        const { error: profileError } = await auth.admin!
            .from('profiles')
            .update({
                full_name,
                phone: phone || null
            })
            .eq('id', id);

        if (profileError) throw profileError;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Error updating user:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

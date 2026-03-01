import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

async function checkAdminAuth() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized', status: 401 };

    const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!adminUser) return { error: 'Forbidden', status: 403 };

    return { user };
}

export async function GET() {
    try {
        const auth = await checkAdminAuth();
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const admin = createAdminClient();

        // Fetch users from the profiles table
        const { data: users, error } = await admin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ users });
    } catch (error: any) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const auth = await checkAdminAuth();
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { email, password, full_name, phone } = await request.json();

        if (!email || !password || !full_name) {
            return NextResponse.json({ error: 'Email, password, and full name are required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // 1. Create a user in auth.users
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // auto-confirm
            user_metadata: { full_name, phone },
        });

        if (authError) throw authError;

        // Note: Our Supabase trigger automatically creates a profile row in 'profiles'
        // But if needed, we can upsert one anyway in case the trigger fails or is missing
        if (authData.user) {
            const { error: profileError } = await admin
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
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const auth = await checkAdminAuth();
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Delete from auth.users (this cascades to profiles and other linked tables because of ON DELETE CASCADE)
        const { error } = await admin.auth.admin.deleteUser(id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const auth = await checkAdminAuth();
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id, full_name, phone } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // 1. Update auth.users metadata
        const { error: authError } = await admin.auth.admin.updateUserById(id, {
            user_metadata: { full_name, phone },
        });

        if (authError) throw authError;

        // 2. Update profiles table
        const { error: profileError } = await admin
            .from('profiles')
            .update({
                full_name,
                phone: phone || null
            })
            .eq('id', id);

        if (profileError) throw profileError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

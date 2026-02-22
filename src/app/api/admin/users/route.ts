import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
    try {
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

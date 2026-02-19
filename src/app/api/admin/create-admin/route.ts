import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        // Step 1: Verify the caller is an admin
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Check caller exists in admin_users table
        const adminClient = createAdminClient();
        const { data: callerAdmin } = await adminClient
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!callerAdmin) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
        }

        // Step 2: Get new admin details from request body
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Step 3: Check if admin already exists
        const { data: existingAdmin } = await adminClient
            .from('admin_users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingAdmin) {
            return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 400 });
        }

        // Step 4: Create the user in Supabase Auth (service role bypasses RLS)
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Admin' },
        });

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 400 });
        }

        if (!newUser.user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        // Step 5: Insert into admin_users table (NOT profiles)
        const { error: insertError } = await adminClient
            .from('admin_users')
            .insert({
                id: newUser.user.id,
                email: email,
                full_name: 'Admin',
                role: 'admin',
                created_by: user.id,
            });

        if (insertError) {
            return NextResponse.json({ error: 'User created but failed to add to admin_users: ' + insertError.message }, { status: 500 });
        }

        // Step 6: Remove from profiles if trigger auto-created one
        await adminClient
            .from('profiles')
            .delete()
            .eq('id', newUser.user.id);

        return NextResponse.json({
            success: true,
            message: `Admin user ${email} created successfully`,
            userId: newUser.user.id,
        });
    } catch (err) {
        console.error('Error creating admin user:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

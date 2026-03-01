import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

type Context = {
    params: Promise<{
        id: string;
    }>;
};

export async function PUT(request: Request, context: Context) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user exists in admin_users table
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!adminUser) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, slug, description } = body;
        const params = await context.params;

        const { data, error } = await supabase
            .from('categories')
            .update({ name, slug, description })
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: Context) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check user role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const params = await context.params;

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', params.id);

        if (error) {
            // Usually need to catch constraint violations if products are attached.
            if (error.code === '23503') {
                return NextResponse.json({ error: 'Cannot delete category because it is in use by products.' }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

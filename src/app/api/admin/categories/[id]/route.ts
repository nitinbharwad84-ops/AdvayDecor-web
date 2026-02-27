import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// PUT: Update a category
export async function PUT(request: Request, context: { params: { id: string } }) {
    try {
        const id = context.params.id;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { name, slug, description, image_url, is_active } = body;

        const { error } = await admin
            .from('categories')
            .update({ name, slug, description, image_url, is_active })
            .eq('id', id);

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A category with this name or slug already exists' }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error updating category:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a category
export async function DELETE(request: Request, context: { params: { id: string } }) {
    try {
        const id = context.params.id;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // Check if there are products using this category
        // Assuming products table has 'category' column matching 'slug' or 'name'. 
        // Best approach is just to delete, but for now we'll allow it.
        const { error } = await admin.from('categories').delete().eq('id', id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error deleting category:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

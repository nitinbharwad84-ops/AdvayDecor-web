import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
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

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
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

        const body = await request.json();
        const { name, slug, description } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('categories')
            .insert({ name, slug, description })
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
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

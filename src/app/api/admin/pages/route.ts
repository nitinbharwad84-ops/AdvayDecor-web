import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('page_content')
            .select('*')
            .order('title');

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { slug, content } = body;

        if (!slug || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Use upsert or update. Since the row must exist, we can use update. 
        // But what if the table is empty? Best to upsert. Wait, we don't know the title for upserts if its new.
        // We'll trust the row exists, or we use upsert with a fallback title.
        const { data, error } = await supabase
            .from('page_content')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('slug', slug)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Page not found. Please ensure DB migrations are run.' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

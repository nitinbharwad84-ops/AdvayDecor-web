import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Verify the caller is an SEO user
async function verifySeoUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data: seoUser } = await admin.from('seo_users').select('id').eq('id', user.id).single();
    return seoUser ? user : null;
}

// GET: Fetch all SEO page metadata
export async function GET() {
    try {
        const admin = createAdminClient();
        const { data: pages, error } = await admin
            .from('seo_page_metadata')
            .select('*')
            .order('page_key');

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ pages: pages || [] });
    } catch (err) {
        console.error('Error fetching SEO metadata:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update a single page's SEO metadata
export async function PUT(request: NextRequest) {
    try {
        const user = await verifySeoUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { page_key, title, description, keywords, og_title, og_description } = body;

        if (!page_key) return NextResponse.json({ error: 'page_key is required' }, { status: 400 });

        const admin = createAdminClient();
        const { error } = await admin
            .from('seo_page_metadata')
            .upsert({
                page_key,
                title: title || null,
                description: description || null,
                keywords: keywords || null,
                og_title: og_title || null,
                og_description: og_description || null,
                updated_by: user.id,
            }, { onConflict: 'page_key' });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error updating SEO metadata:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

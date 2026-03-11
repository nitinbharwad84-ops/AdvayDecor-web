import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Fetch all SEO settings
export async function GET() {
    try {
        const admin = createAdminClient();
        const { data: settings, error } = await admin
            .from('seo_settings')
            .select('*');

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const configObj: Record<string, string> = {};
        (settings || []).forEach((s: { key: string; value: string }) => {
            configObj[s.key] = s.value;
        });

        return NextResponse.json(configObj);
    } catch (err) {
        console.error('Error fetching SEO settings:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update SEO settings
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: seoUser } = await admin.from('seo_users').select('id').eq('id', user.id).single();
        if (!seoUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();

        const updates = Object.entries(body).map(async ([key, value]) => {
            const { error } = await admin
                .from('seo_settings')
                .upsert({ key, value: String(value) }, { onConflict: 'key' });
            if (error) throw error;
        });

        await Promise.all(updates);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error updating SEO settings:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

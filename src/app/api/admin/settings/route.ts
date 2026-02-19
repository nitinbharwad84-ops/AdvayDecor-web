import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Fetch all site_config
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { data: config, error } = await admin
            .from('site_config')
            .select('*');

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Convert array of {key, value} to object
        const configObj: Record<string, string> = {};
        (config || []).forEach((c: { key: string; value: string }) => {
            configObj[c.key] = c.value;
        });

        return NextResponse.json(configObj);
    } catch (err) {
        console.error('Error fetching settings:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update site_config values
export async function PUT(request: Request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        // Body is { key: value, key: value, ... }

        const updates = Object.entries(body).map(async ([key, value]) => {
            const { error } = await admin
                .from('site_config')
                .upsert(
                    { key, value: String(value) },
                    { onConflict: 'key' }
                );
            if (error) throw error;
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error updating settings:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

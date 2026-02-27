import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { reply_text } = body;

        if (!reply_text) {
            return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
        }

        // Verify admin authentication
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const admin = createAdminClient();
        const { data: adminCheck } = await admin
            .from('admin_users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!adminCheck) {
            return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 });
        }

        // Use admin client for update (RLS policies may block anon-keyed writes)
        const { data, error } = await admin
            .from('faq_questions')
            .update({
                status: 'replied',
                answer_text: reply_text,
                answered_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Reply API Error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

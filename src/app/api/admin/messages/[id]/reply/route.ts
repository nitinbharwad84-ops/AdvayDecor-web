import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { reply_text } = body;

        if (!reply_text) {
            return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
        }

        const admin = createAdminClient();

        const { data, error } = await admin
            .from('contact_messages')
            .update({
                reply_text,
                status: 'replied',
                replied_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, message: data });
    } catch (error: any) {
        console.error('Reply API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

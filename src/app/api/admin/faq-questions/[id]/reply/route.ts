import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { reply_text } = body;

        if (!reply_text) {
            return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options);
                            });
                        } catch (error) { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        // Optional: Ensure admin Check
        const { data: adminCheck } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', user?.id)
            .single();

        if (!adminCheck) {
            return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('faq_questions')
            .update({
                status: 'replied',
                answer_text: reply_text,
                answered_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Reply API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

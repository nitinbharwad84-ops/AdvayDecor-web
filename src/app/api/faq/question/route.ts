import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, question, user_id } = body;

        if (!name || !email || !question) {
            return NextResponse.json(
                { error: 'Name, email, and question are required' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options);
                            });
                        } catch (error) {
                            // The `set` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        // Optional: try to get user id from server session just in case
        let finalUserId = user_id;
        if (!finalUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            finalUserId = user?.id || null;
        }

        const { error } = await supabase
            .from('faq_questions')
            .insert({
                user_id: finalUserId,
                name,
                email,
                question,
                status: 'new',
            });

        if (error) {
            console.error('Supabase error inserting faq_question:', error);
            return NextResponse.json(
                { error: 'Failed to submit question. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Question submitted successfully' });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const productId = url.searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();

        // Fetch approved reviews for this product
        const { data, error } = await supabase
            .from('product_reviews')
            .select('*')
            .eq('product_id', productId)
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate average
        const avgRating = data.length > 0
            ? data.reduce((acc, r) => acc + r.rating, 0) / data.length
            : 0;

        return NextResponse.json({
            reviews: data,
            average: avgRating,
            total: data.length
        });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { product_id, rating, review_text } = await request.json();

        if (!product_id || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid review data' }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's name for display
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        const reviewerName = profile?.full_name || 'Anonymous User';

        const { data, error } = await supabase
            .from('product_reviews')
            .upsert({
                product_id,
                user_id: user.id,
                rating,
                review_text,
                reviewer_name: reviewerName,
                // Default to true for now unless you want manual admin approval
                is_approved: true,
            }, {
                onConflict: 'product_id,user_id'
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error submitting review:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

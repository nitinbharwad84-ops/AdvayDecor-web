import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

// GET: Fetch approved reviews for a product (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('product_id');

        if (!productId) {
            return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        const { data: reviews, error } = await supabase
            .from('product_reviews')
            .select('id, rating, review_text, reviewer_name, created_at')
            .eq('product_id', productId)
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also compute average rating
        const ratings = (reviews || []).map(r => r.rating);
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

        return NextResponse.json({
            reviews: reviews || [],
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: ratings.length,
        });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Submit a review (authenticated users only)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'You must be logged in to leave a review' }, { status: 401 });
        }

        const body = await request.json();
        const { product_id, rating, review_text } = body;

        if (!product_id || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'product_id and rating (1-5) are required' }, { status: 400 });
        }

        // Get user's name
        const admin = createAdminClient();
        const { data: profile } = await admin
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        const reviewerName = profile?.full_name || user.email?.split('@')[0] || 'Anonymous';

        // Check if user already reviewed (upsert)
        const { data: existing } = await supabase
            .from('product_reviews')
            .select('id')
            .eq('product_id', product_id)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            // Update existing review
            const { error } = await supabase
                .from('product_reviews')
                .update({
                    rating: Math.round(rating),
                    review_text: review_text?.trim() || null,
                    reviewer_name: reviewerName,
                })
                .eq('id', existing.id);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ success: true, message: 'Review updated' });
        }

        // Insert new review
        const { error } = await supabase
            .from('product_reviews')
            .insert({
                product_id,
                user_id: user.id,
                rating: Math.round(rating),
                review_text: review_text?.trim() || null,
                reviewer_name: reviewerName,
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Review submitted' });
    } catch (err) {
        console.error('Error submitting review:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

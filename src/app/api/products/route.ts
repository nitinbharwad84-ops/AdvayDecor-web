import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// Public API — returns only active products
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                product_variants (*),
                product_images (*),
                product_reviews (rating, is_approved)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const shaped = (products || []).map((p: any) => {
            const approvedReviews = (p.product_reviews || []).filter((r: any) => r.is_approved);
            const totalRating = approvedReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
            const avgRating = approvedReviews.length > 0 ? totalRating / approvedReviews.length : 0;

            return {
                ...p,
                variants: p.product_variants || [],
                images: p.product_images || [],
                avg_rating: avgRating,
                review_count: approvedReviews.length
            };
        });

        return NextResponse.json(shaped);
    } catch (err) {
        console.error('Error fetching public products:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

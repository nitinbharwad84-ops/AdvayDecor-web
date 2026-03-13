import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase-admin';
import type { Product } from '@/types';
import { unstable_noStore as noStore } from 'next/cache';
import FeaturedCollectionClient from './FeaturedCollectionClient';

async function getFeaturedProducts(): Promise<Product[]> {
    noStore(); // Disable caching to reflect changes instantly
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
            .order('created_at', { ascending: false })
            .limit(4);

        if (error || !products) return [];

        return products.map((p: any) => {
            const approvedReviews = (p.product_reviews || []).filter((r: any) => r.is_approved);
            const totalRating = approvedReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
            const avgRating = approvedReviews.length > 0 ? totalRating / approvedReviews.length : 0;

            return {
                ...p,
                variants: (p.product_variants || []).filter((v: any) => v.is_active),
                images: p.product_images || [],
                avg_rating: avgRating,
                review_count: approvedReviews.length
            };
        });
    } catch {
        return [];
    }
}

export default async function FeaturedCollection() {
    const featured = await getFeaturedProducts();

    return (
        <section style={{ padding: '5rem 0', background: '#fdfbf7' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <div>
                        <span style={{ color: '#00b4d8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Curated for You
                        </span>
                        <h2
                            className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#0a0a23', marginTop: '0.5rem' }}
                        >
                            Featured Collection
                        </h2>
                    </div>

                    <div>
                        <Link
                            href="/shop"
                            className="group hidden sm:inline-flex items-center font-medium"
                            style={{ gap: '0.5rem', fontSize: '0.875rem', color: '#00b4d8' }}
                        >
                            Buy designer sofa cushions
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Product Grid — client component with motion */}
                <FeaturedCollectionClient products={featured} />

                {/* Mobile CTA */}
                <div className="sm:hidden" style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link
                        href="/shop"
                        className="inline-flex items-center font-medium"
                        style={{ gap: '0.5rem', fontSize: '0.875rem', color: '#00b4d8' }}
                    >
                        Shop designer cushion covers
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}

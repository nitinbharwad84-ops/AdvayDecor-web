import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Automated XML Sitemap with keyword-rich category URLs
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createServerSupabaseClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://advaydecor.in';

    // Fetch all active products
    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true);

    const productUrls: MetadataRoute.Sitemap = (products || []).map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Static/core pages
    const staticUrls: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/story`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ];

    // Keyword-rich category URLs for search engines
    const categoryUrls: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/cushions/embroidered-covers`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/cushions/linen-covers`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    // Trend pages
    const trendUrls: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/trends`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/trends/2026-boucle-cushions`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];

    return [...staticUrls, ...categoryUrls, ...trendUrls, ...productUrls];
}

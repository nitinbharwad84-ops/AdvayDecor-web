import { createAdminClient } from '@/lib/supabase-admin';

interface SeoConfig {
    title: string;
    description: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
}

// Default SEO values (used as fallbacks when DB has no data)
const DEFAULTS: Record<string, SeoConfig> = {
    home: {
        title: 'AdvayDecor: Premium Home Decor & Cushion Covers Online India',
        description: 'Elevate spaces with artisan cushions, linen covers & designer decor. Pan-India shipping directly from our Mumbai studio.',
        keywords: ['home decor online India', 'cushion covers online India', 'buy cushions online', 'premium cushion covers', 'artisan home accessories', 'designer cushion covers', 'embroidered cushion covers', 'linen pillow covers India', 'handmade home decor Mumbai', 'AdvayDecor'],
    },
    shop: {
        title: 'Buy Cushion Covers Online India - AdvayDecor Collection',
        description: 'Curated linen, embroidered & bouclé cushions for sofas. Discover premium artistic decor to match your space and your vibe.',
        keywords: ['cushion covers online India', 'buy cushions online', 'designer cushion covers', 'embroidered cushion covers', 'linen pillow covers India', 'bouclé cushions 2026', 'sofa cushion sets Mumbai'],
    },
    story: {
        title: 'Our Story & Studio | Handmade Home Decor Mumbai',
        description: 'AdvayDecor is a premium home decor brand based in Dahisar East, Mumbai. Contact us for bespoke artisan cushions and accessories.',
        keywords: ['handmade home decor Mumbai', 'artisan cushions Dahisar', 'home decor brand Mumbai', 'AdvayDecor story'],
    },
    contact: {
        title: 'Contact Us | Handmade Home Decor Mumbai - AdvayDecor',
        description: 'AdvayDecor is a premium home decor brand based in Dahisar East, Mumbai. Reach out for bespoke artisan cushions and accessories.',
        keywords: ['handmade home decor Mumbai', 'artisan cushions Dahisar', 'AdvayDecor contact'],
    },
};

/**
 * Fetch SEO config for a page from the database, with hardcoded fallbacks.
 * Used by page layouts to dynamically render metadata.
 */
export async function getSeoConfig(pageKey: string): Promise<SeoConfig> {
    const fallback = DEFAULTS[pageKey] || { title: 'AdvayDecor', description: '', keywords: [] };

    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('seo_page_metadata')
            .select('title, description, keywords, og_title, og_description')
            .eq('page_key', pageKey)
            .single();

        if (error || !data) return fallback;

        return {
            title: data.title || fallback.title,
            description: data.description || fallback.description,
            keywords: data.keywords
                ? data.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
                : fallback.keywords,
            ogTitle: data.og_title || undefined,
            ogDescription: data.og_description || undefined,
        };
    } catch {
        return fallback;
    }
}

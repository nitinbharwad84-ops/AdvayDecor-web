import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * Meta (Facebook/Instagram) Product Catalog Feed
 * Returns a TSV (Tab-Separated Values) feed compatible with Meta Commerce Manager.
 * URL: /api/shopping-feed/meta
 */
export async function GET() {
    try {
        const admin = createAdminClient();
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.advaydecor.com';

        const { data: products, error } = await admin
            .from('products')
            .select(`
                id, title, description, slug, base_price, category,
                product_images (image_url, display_order),
                product_variants (id, variant_name, price, stock_quantity)
            `)
            .eq('is_active', true);

        if (error) throw error;

        // Meta Commerce requires specific TSV columns
        const headers = [
            'id', 'title', 'description', 'availability', 'condition',
            'price', 'link', 'image_link', 'brand', 'product_type',
            'additional_image_link',
        ];

        const rows = (products || []).map((product: Record<string, unknown>) => {
            const images = (product.product_images as { image_url: string; display_order: number }[] || [])
                .sort((a, b) => a.display_order - b.display_order);
            const primaryImage = images[0]?.image_url || '';
            const additionalImages = images.slice(1).map(img => img.image_url).join(',');

            const variants = product.product_variants as { stock_quantity: number | null }[] || [];
            const totalStock = variants.length > 0
                ? variants.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0)
                : 10;

            const desc = String(product.description || '')
                .replace(/\t/g, ' ')
                .replace(/\n/g, ' ')
                .substring(0, 5000);

            return [
                product.id,
                product.title,
                desc,
                totalStock > 0 ? 'in stock' : 'out of stock',
                'new',
                `${product.base_price} INR`,
                `${baseUrl}/product/${product.slug}`,
                primaryImage,
                'AdvayDecor',
                product.category || 'Home Decor',
                additionalImages,
            ].join('\t');
        });

        const tsv = [headers.join('\t'), ...rows].join('\n');

        return new NextResponse(tsv, {
            status: 200,
            headers: {
                'Content-Type': 'text/tab-separated-values; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error: unknown) {
        console.error('Error generating Meta feed:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

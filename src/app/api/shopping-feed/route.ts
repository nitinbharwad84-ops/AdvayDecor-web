import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Google Merchant Center Product Feed (public, uses RLS-compliant client)
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.advaydecor.com';

        // Fetch products WITH their images from the product_images table
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                id, title, description, slug, base_price, category,
                product_images (image_url, display_order)
            `)
            .eq('is_active', true);

        if (error) throw error;

        // Generate XML string for RSS feed
        const itemsXml = (products || []).map((product: Record<string, unknown>) => {
            const productUrl = `${baseUrl}/product/${product.slug}`;
            const images = product.product_images as { image_url: string; display_order: number }[] | null;
            const primaryImage = images && images.length > 0
                ? images.sort((a, b) => a.display_order - b.display_order)[0].image_url
                : '';
            // Make sure description is xml-safe
            const safeDescription = (String(product.description || '')).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            return `
        <item>
            <g:id>${product.id}</g:id>
            <g:title><![CDATA[${product.title}]]></g:title>
            <g:description><![CDATA[${safeDescription}]]></g:description>
            <g:link>${productUrl}</g:link>
            <g:image_link>${primaryImage}</g:image_link>
            <g:condition>new</g:condition>
            <g:availability>in_stock</g:availability>
            <g:price>${product.base_price} INR</g:price>
            <g:brand>AdvayDecor</g:brand>
            <g:product_type><![CDATA[${product.category || 'Home Decor'}]]></g:product_type>
        </item>`;
        }).join('');

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
    <channel>
        <title>AdvayDecor Products</title>
        <link>${baseUrl}</link>
        <description>Handcrafted Home Decor and Premium Furnishings</description>
        ${itemsXml}
    </channel>
</rss>`;

        return new NextResponse(rssXml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error: unknown) {
        console.error('Error generating product feed:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

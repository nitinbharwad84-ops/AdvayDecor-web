import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// 4. Live Product Feed API Route (Google Merchant Center)
export async function GET() {
    try {
        const admin = createAdminClient();
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.advaydecor.com';

        const { data: products, error } = await admin
            .from('products')
            .select('id, title, description, slug, base_price, category, images')
            .eq('is_active', true);

        if (error) throw error;

        // Generate XML string for RSS feed
        const itemsXml = (products || []).map((product) => {
            const productUrl = `${baseUrl}/product/${product.slug}`;
            const primaryImage = product.images && product.images.length > 0 ? product.images[0] : '';
            // Make sure description is xml-safe
            const safeDescription = (product.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
    } catch (error: any) {
        console.error('Error generating product feed:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

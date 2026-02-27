import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase-admin';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;

    try {
        const admin = createAdminClient();
        const { data: product } = await admin
            .from('products')
            .select(`
                title, description, base_price, category, slug,
                product_images (image_url, display_order)
            `)
            .eq('slug', params.slug)
            .eq('is_active', true)
            .single();

        if (!product) {
            return {
                title: 'Product Not Found — AdvayDecor',
                description: 'This product could not be found.',
            };
        }

        const images = (product.product_images || [])
            .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order);
        const ogImage = images[0]?.image_url || '/logo.png';
        const price = `₹${Number(product.base_price).toLocaleString('en-IN')}`;

        return {
            title: `${product.title} — AdvayDecor`,
            description: product.description
                ? product.description.substring(0, 160)
                : `Shop ${product.title} at AdvayDecor. Premium home decor starting at ${price}.`,
            keywords: [product.title, product.category, 'home decor', 'AdvayDecor', 'buy online'].filter(Boolean),
            openGraph: {
                title: `${product.title} — AdvayDecor`,
                description: product.description
                    ? product.description.substring(0, 160)
                    : `Shop ${product.title} at AdvayDecor.`,
                type: 'website',
                siteName: 'AdvayDecor',
                images: [
                    {
                        url: ogImage,
                        width: 800,
                        height: 800,
                        alt: product.title,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${product.title} — AdvayDecor`,
                description: product.description
                    ? product.description.substring(0, 160)
                    : `Shop ${product.title} at AdvayDecor.`,
                images: [ogImage],
            },
        };
    } catch {
        return {
            title: 'Shop — AdvayDecor',
            description: 'Discover premium home decor at AdvayDecor.',
        };
    }
}

export default async function ProductLayout(props: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { children } = props;

    let jsonLd = null;

    try {
        const admin = createAdminClient();
        const { data: product } = await admin
            .from('products')
            .select(`
                title, description, base_price, category,
                product_images (image_url, display_order)
            `)
            .eq('slug', params.slug)
            .eq('is_active', true)
            .single();

        if (product) {
            const images = (product.product_images || [])
                .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
                .map((img: { image_url: string }) => img.image_url);

            jsonLd = {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: product.title,
                image: images.length > 0 ? images : undefined,
                description: product.description,
                sku: params.slug,
                category: product.category,
                offers: {
                    '@type': 'Offer',
                    url: `https://www.advaydecor.com/product/${params.slug}`,
                    priceCurrency: 'INR',
                    price: product.base_price,
                    itemCondition: 'https://schema.org/NewCondition',
                    availability: 'https://schema.org/InStock',
                },
            };
        }
    } catch {
        // Non-critical: page will still render without structured data
    }

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
        </>
    );
}

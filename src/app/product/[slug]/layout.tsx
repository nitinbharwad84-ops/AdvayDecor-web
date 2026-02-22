import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// 1. Dynamic Metadata Generation
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const supabase = await createServerSupabaseClient();

    const { data: product } = await supabase
        .from('products')
        .select('title, description, base_price, images')
        .eq('slug', params.slug)
        .single();

    if (!product) {
        return {
            title: 'Product Not Found - AdvayDecor',
        };
    }

    return {
        title: `${product.title} | AdvayDecor`,
        description: product.description,
        openGraph: {
            title: product.title,
            description: product.description,
            images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.title,
            description: product.description,
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        },
    };
}

export default async function ProductLayout(props: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { children } = props;

    const supabase = await createServerSupabaseClient();
    const { data: product } = await supabase
        .from('products')
        .select('title, description, base_price, category, images')
        .eq('slug', params.slug)
        .single();

    if (!product) return <>{children}</>;

    // 3. JSON-LD Structured Data for Google Rich Snippets
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        image: product.images && product.images.length > 0 ? product.images : undefined,
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
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}

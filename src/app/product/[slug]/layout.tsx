import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// 1. Dynamic Metadata Generation
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const supabase = await createServerSupabaseClient();

    const { data: product } = await supabase
        .from('products')
        .select(`
            title, 
            description, 
            base_price, 
            images:product_images(image_url)
        `)
        .eq('slug', params.slug)
        .single();

    if (!product) {
        return {
            title: 'Product Not Found - AdvayDecor',
        };
    }

    const firstImage = (product as any).images?.[0]?.image_url;

    return {
        title: `${product.title} | AdvayDecor`,
        description: product.description,
        openGraph: {
            title: product.title,
            description: product.description,
            images: firstImage ? [{ url: firstImage }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.title,
            description: product.description,
            images: firstImage ? [firstImage] : [],
        },
    };
}

export default async function ProductLayout(props: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { children } = props;

    const supabase = await createServerSupabaseClient();
    const { data: product } = await supabase
        .from('products')
        .select(`
            title, 
            description, 
            base_price, 
            category, 
            images:product_images(image_url)
        `)
        .eq('slug', params.slug)
        .single();

    if (!product) return <>{children}</>;

    const productImages = (product as any).images?.map((img: any) => img.image_url) || [];

    // 3. JSON-LD Structured Data for Google Rich Snippets
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        image: productImages.length > 0 ? productImages : undefined,
        description: product.description,
        sku: params.slug,
        category: product.category,
        offers: {
            '@type': 'Offer',
            url: `https://www.advaydecor.vercel.app/product/${params.slug}`,
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

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
            category,
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
    const productTitle = `${product.title} Cushion Cover - Buy Online India | AdvayDecor`;
    const productDescription = product.description
        ? `Shop the ${product.title}. ${product.description.slice(0, 120)}. Fast delivery across India.`
        : `Shop the ${product.title}. Premium artisan home decor. Fast delivery across India.`;

    return {
        title: productTitle,
        description: productDescription,
        keywords: [
            product.title,
            'cushion covers',
            'home decor India',
            'buy cushions online India',
            product.category || 'home decor',
            'AdvayDecor',
        ],
        openGraph: {
            title: product.title,
            description: productDescription,
            images: firstImage ? [{ url: firstImage }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.title,
            description: productDescription,
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

    // 3. JSON-LD Structured Data for Google Rich Snippets (with keywords)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        image: productImages.length > 0 ? productImages : undefined,
        description: product.description,
        sku: params.slug,
        category: product.category,
        keywords: ['cushion covers', 'home decor India', 'embroidered cushions', 'premium cushion covers', 'buy online India'],
        offers: {
            '@type': 'Offer',
            url: `https://advaydecor.in/product/${params.slug}`,
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

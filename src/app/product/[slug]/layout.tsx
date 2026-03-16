import { createServerSupabaseClient } from '@/lib/supabase-server';

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

    // JSON-LD Structured Data for Google Rich Snippets
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
            url: `https://www.advaydecor.in/product/${params.slug}`,
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

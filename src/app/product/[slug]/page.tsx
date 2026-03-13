import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import ProductDetailClient from './ProductDetailClient';
import type { Product } from '@/types';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProductData(slug: string) {
    const supabase = await createServerSupabaseClient();
    
    // Fetch specifically requested product
    const { data: product } = await supabase
        .from('products')
        .select(`
            *,
            images:product_images(*),
            variants:product_variants(*, images:product_images(*))
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (!product) return { product: null, allProducts: [] };

    // Fetch related products for the client component (limited set for performance)
    const { data: allProducts } = await supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('is_active', true)
        .limit(20);

    return { product: product as Product, allProducts: (allProducts || []) as Product[] };
}

export async function generateMetadata(
    { params }: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const paramsObj = await params;
    const slug = decodeURIComponent(paramsObj.slug);
    const { product } = await getProductData(slug);

    if (!product) {
        return {
            title: 'Product Not Found | Advay Decor',
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.advaydecor.in';
    const productUrl = `${baseUrl}/product/${slug}`;
    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: `${product.title} | Premium Home Decor | Advay Decor`,
        description: product.description || `Buy ${product.title} online at Advay Decor. Premium quality handcrafted cushion covers and home decor accessories.`,
        alternates: {
            canonical: productUrl,
        },
        openGraph: {
            title: product.title,
            description: product.description || '',
            url: productUrl,
            images: [
                ...(product.images?.[0]?.image_url ? [{ url: product.images[0].image_url }] : []),
                ...previousImages,
            ],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.title,
            description: product.description || '',
            images: product.images?.[0]?.image_url ? [product.images[0].image_url] : [],
        },
    };
}

export default async function ProductPage({ params }: PageProps) {
    const paramsObj = await params;
    const slug = decodeURIComponent(paramsObj.slug);
    const { product, allProducts } = await getProductData(slug);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} allProducts={allProducts} />;
}

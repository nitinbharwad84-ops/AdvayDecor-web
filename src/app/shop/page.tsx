import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import ShopClient from './ShopClient';
import type { Product } from '@/types';

interface PageProps {
    searchParams: Promise<{ category?: string; q?: string }>;
}

async function getProducts() {
    const supabase = await createServerSupabaseClient();
    const { data: products } = await supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return (products || []) as Product[];
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const category = (await searchParams).category;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.advaydecor.in';
    
    let title = 'Shop Premium Cushion Covers Online | Advay Decor';
    let description = 'Browse our collection of handcrafted cushion covers, linen covers, and designer home decor. Pan-India shipping available.';
    let canonical = `${baseUrl}/shop`;

    if (category) {
        title = `${category} Cushion Covers | Advay Decor`;
        description = `Explore our exclusive range of ${category.toLowerCase()} cushion covers. Handcrafted with premium fabrics and artisan techniques.`;
        
        // Handle canonical mapping for rewritten URLs
        if (category === 'Embroidered') {
            canonical = `${baseUrl}/cushions/embroidered-covers`;
        } else if (category === 'Linen') {
            canonical = `${baseUrl}/cushions/linen-covers`;
        } else {
            // All other filtered views should canonicalize to the main shop page
            canonical = `${baseUrl}/shop`;
        }
    }

    return {
        title,
        description,
        alternates: {
            canonical: canonical,
        },
        openGraph: {
            title,
            description,
            url: canonical,
        }
    };
}

export default async function ShopPage({ searchParams }: PageProps) {
    const products = await getProducts();
    const category = (await searchParams).category;

    return <ShopClient initialProducts={products} initialCategory={category} />;
}

import { Metadata } from 'next';
import { getSeoConfig } from '@/lib/seo-config';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getSeoConfig('shop');
    return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        openGraph: {
            title: seo.ogTitle || seo.title,
            description: seo.ogDescription || seo.description,
            type: 'website',
            url: '/shop',
        },
    };
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

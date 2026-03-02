import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop Our Collection | AdvayDecor',
    description: 'Browse our curated collection of premium home decor. Hand-stitched cushions, designer frames, and artisanal accents to elevate your living space.',
    keywords: ['home decor shop', 'buy cushions online', 'designer home accessories', 'AdvayDecor collection'],
    openGraph: {
        title: 'Shop Our Collection | AdvayDecor',
        description: 'Browse our curated collection of premium home decor.',
        type: 'website',
        url: '/shop',
    },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

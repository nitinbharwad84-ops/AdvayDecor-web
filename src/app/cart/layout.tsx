import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Your Shopping Cart | AdvayDecor',
    description: 'Review your selected items and proceed to checkout. Ready to transform your space with premium artisanal decor.',
    openGraph: {
        title: 'Your Shopping Cart | AdvayDecor',
        description: 'Review your selected items and proceed to checkout.',
        type: 'website',
        url: '/cart',
    },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

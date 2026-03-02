import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Your Wishlist | AdvayDecor',
    description: 'Save your favorite artisanal pieces and build your dream home collection. Revisit your top picks for cushions, frames, and more.',
    openGraph: {
        title: 'Your Wishlist | AdvayDecor',
        description: 'Save your favorites for your artisanal home collection.',
        type: 'website',
    },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

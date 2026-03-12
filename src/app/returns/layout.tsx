import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Returns & Exchanges | AdvayDecor',
    description: 'Hassle-free returns and exchanges. We stand by the quality of our artisanal products and ensure your complete satisfaction.',
    alternates: {
        canonical: '/returns',
    },
    openGraph: {
        title: 'Returns & Exchanges | AdvayDecor',
        description: 'Hassle-free returns for our home collection.',
        type: 'website',
    },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

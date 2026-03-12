import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions | AdvayDecor',
    description: 'Help with sizes, shipping, return policies, and cleaning care for our artisanal home products. Find answers immediately.',
    alternates: {
        canonical: '/faq',
    },
    openGraph: {
        title: 'AdvayDecor Help | FAQ',
        description: 'Find answers about our artisanal home products.',
        type: 'website',
    },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

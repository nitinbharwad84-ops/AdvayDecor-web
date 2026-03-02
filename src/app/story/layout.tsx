import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Story — Artisanal Craftsmanship | AdvayDecor',
    description: 'Hand-sewn, locally sourced, and thoughtfully designed. Meet the artisans who create our premium home collections.',
    openGraph: {
        title: 'Meet the Makers | Our Story',
        description: 'The artisanal craftsmanship behind AdvayDecor.',
        type: 'website',
    },
};

export default function StoryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

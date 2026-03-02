import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | AdvayDecor',
    description: 'Reach out to our artisanal studio for any questions about our collection or to collaborate on bespoke home decor solutions.',
    openGraph: {
        title: 'Contact Us | AdvayDecor',
        description: 'Reach out to our artisanal studio.',
        type: 'website',
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

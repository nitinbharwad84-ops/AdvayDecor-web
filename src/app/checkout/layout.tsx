import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Secure Checkout | AdvayDecor',
    description: 'Complete your purchase and bring timeless style to your home. Secure payments and nationwide delivery across India.',
    openGraph: {
        title: 'Secure Checkout | AdvayDecor',
        description: 'Complete your purchase with secure options.',
        type: 'website',
        url: '/checkout',
    },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

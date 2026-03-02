import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shipping Policy — Pan-India Delivery | AdvayDecor',
    description: 'Fast and secure nationwide delivery for artisanal home decor. Track your orders and understand our delivery timelines across India.',
    openGraph: {
        title: 'Shipping Policy | AdvayDecor',
        description: 'Track your orders and understand our delivery timelines.',
        type: 'website',
    },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

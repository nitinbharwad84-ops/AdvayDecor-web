import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Details | AdvayDecor',
    description: 'View your order details, shipping information, and payment status.',
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

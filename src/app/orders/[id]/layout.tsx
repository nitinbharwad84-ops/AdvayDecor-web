import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Status | AdvayDecor',
    robots: {
        index: false,
        follow: false,
    },
};

export default function OrderDetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

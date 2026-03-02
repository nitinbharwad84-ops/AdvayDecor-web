import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Your Account Profile | AdvayDecor',
    description: 'Manage your settings, view your order history, and update your saved shipping details. Your personalized AdvayDecor experience.',
    openGraph: {
        title: 'Your Account | AdvayDecor',
        description: 'Manage your artisanal home decor settings.',
        type: 'website',
    },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

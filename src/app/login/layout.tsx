import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login / Sign Up | AdvayDecor',
    description: 'Join the AdvayDecor community. Access your order history, manage your wishlist, and save your artisanal home preferences.',
    openGraph: {
        title: 'Customer Login | AdvayDecor',
        description: 'Join the AdvayDecor community.',
        type: 'website',
    },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

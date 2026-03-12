'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/layout/Footer'), {
    loading: () => <div style={{ minHeight: '300px', background: '#070718' }} />,
});

export default function ConditionalFooter() {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/admin-login' || pathname === '/seo-login';
    const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/seo') || isAuthPage;

    if (isAdminPage) return null;
    return <Footer />;
}

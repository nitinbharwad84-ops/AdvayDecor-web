'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';

export default function ConditionalFooter() {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/admin-login' || pathname === '/seo-login';
    const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/seo') || isAuthPage;

    if (isAdminPage) return null;
    return <Footer />;
}

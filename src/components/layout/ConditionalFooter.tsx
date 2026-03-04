'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';

export default function ConditionalFooter() {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/admin-login';
    const isAdminPage = pathname?.startsWith('/admin') || isAuthPage;

    if (isAdminPage) return null;
    return <Footer />;
}

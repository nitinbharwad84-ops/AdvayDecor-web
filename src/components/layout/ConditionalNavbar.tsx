'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import CartDrawer from '@/components/shop/CartDrawer';

export default function ConditionalNavbar() {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/admin-login' || pathname === '/seo-login';
    const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/seo') || isAuthPage;

    if (isAdminPage) return null;

    return (
        <>
            <Navbar />
            <CartDrawer />
        </>
    );
}

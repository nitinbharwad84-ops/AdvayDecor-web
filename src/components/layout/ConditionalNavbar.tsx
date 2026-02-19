'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import CartDrawer from '@/components/shop/CartDrawer';

export default function ConditionalNavbar() {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    if (isAdminPage) return null;

    return (
        <>
            <Navbar />
            <CartDrawer />
        </>
    );
}

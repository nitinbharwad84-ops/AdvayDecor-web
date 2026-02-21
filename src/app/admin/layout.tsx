'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    Menu,
    X,
    ChevronRight,
    LogOut,
    MessageSquare,
    FileText,
} from 'lucide-react';
import { useAdminAuthStore } from '@/lib/auth-store';
import { createClient } from '@/lib/supabase';

const sidebarLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Pages', href: '/admin/pages', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isAdminAuthenticated, adminEmail, clearAdminAuth } = useAdminAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // No login page bypass needed — admin login is at /admin-login (separate route)

    // --- Auth Guard Logic (for all non-login admin pages) ---
    // Show loading while hydrating
    if (!mounted) {
        return (
            <div style={{
                minHeight: '100vh', background: '#0a0a23',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAdminAuthenticated) {
        // Use effect-based redirect to avoid render-time navigation
        return <AdminRedirect />;
    }

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        clearAdminAuth();
        router.push('/admin-login');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f0eff5' }}>
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex lg:hidden items-center justify-center"
                style={{
                    position: 'fixed', top: '1rem', left: '1rem', zIndex: 50,
                    width: '44px', height: '44px', borderRadius: '0.75rem',
                    background: '#fff', border: 'none', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: '#0a0a23',
                }}
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div style={{ display: 'flex' }}>
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex" style={{
                    flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0,
                    width: '260px', background: '#fff', borderRight: '1px solid #e8e4dc',
                    overflowY: 'auto', zIndex: 40,
                }}>
                    <div style={{ padding: '1.5rem' }}>
                        {/* Admin branding */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Image
                                    src="/logo.png"
                                    alt="Advay Decor"
                                    width={32}
                                    height={32}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23' }}>Admin Panel</p>
                                <p style={{ fontSize: '0.7rem', color: '#9e9eb8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                    {adminEmail || 'AdvayDecor'}
                                </p>
                            </div>
                        </div>

                        {/* Nav links */}
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {sidebarLinks.map((link) => {
                                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                            fontSize: '0.875rem', fontWeight: 500,
                                            textDecoration: 'none', transition: 'all 0.2s ease',
                                            background: isActive ? 'rgba(0,180,216,0.08)' : 'transparent',
                                            color: isActive ? '#00b4d8' : '#64648b',
                                        }}
                                    >
                                        <link.icon size={18} />
                                        {link.name}
                                        {isActive && (
                                            <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#00b4d8' }} />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom actions */}
                    <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid #f0ece4' }}>
                        <Link
                            href="/"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                fontSize: '0.875rem', fontWeight: 500, color: '#64648b',
                                textDecoration: 'none', marginBottom: '0.5rem',
                            }}
                        >
                            <Package size={18} />
                            View Store
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                fontSize: '0.875rem', fontWeight: 500, color: '#ef4444',
                                background: 'rgba(239,68,68,0.05)', border: 'none', cursor: 'pointer',
                            }}
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <>
                            <motion.div
                                style={{
                                    position: 'fixed', inset: 0,
                                    background: 'rgba(10,10,35,0.5)', backdropFilter: 'blur(4px)',
                                    zIndex: 40,
                                }}
                                className="lg:hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                            <motion.aside
                                className="lg:hidden"
                                style={{
                                    position: 'fixed', left: 0, top: 0, bottom: 0,
                                    width: '260px', background: '#fff',
                                    boxShadow: '4px 0 24px rgba(0,0,0,0.15)', zIndex: 50,
                                    display: 'flex', flexDirection: 'column',
                                }}
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            >
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                        <div style={{
                                            width: '40px', height: '40px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Image
                                                src="/logo.png"
                                                alt="Advay Decor"
                                                width={32}
                                                height={32}
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23' }}>Admin Panel</p>
                                            <p style={{ fontSize: '0.7rem', color: '#9e9eb8' }}>AdvayDecor</p>
                                        </div>
                                    </div>

                                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {sidebarLinks.map((link) => {
                                            const isActive = pathname === link.href;
                                            return (
                                                <Link
                                                    key={link.name}
                                                    href={link.href}
                                                    onClick={() => setIsSidebarOpen(false)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                                        fontSize: '0.875rem', fontWeight: 500,
                                                        textDecoration: 'none', transition: 'all 0.2s',
                                                        background: isActive ? 'rgba(0,180,216,0.08)' : 'transparent',
                                                        color: isActive ? '#00b4d8' : '#64648b',
                                                    }}
                                                >
                                                    <link.icon size={18} />
                                                    {link.name}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>

                                <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid #f0ece4' }}>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                                            padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                            fontSize: '0.875rem', fontWeight: 500, color: '#ef4444',
                                            background: 'rgba(239,68,68,0.05)', border: 'none', cursor: 'pointer',
                                        }}
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="admin-main-content" style={{ flex: 1, minHeight: '100vh' }}>
                    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
                        {children}
                    </div>
                </main>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .admin-main-content {
                        margin-left: 260px;
                    }
                }
            `}</style>
        </div>
    );
}

// Separate component for redirect (avoids calling router.push during render)
function AdminRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin-login');
    }, [router]);

    return (
        <div style={{
            minHeight: '100vh', background: '#0a0a23',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '1rem',
        }}>
            <div style={{ position: 'relative', width: '48px', height: '48px', opacity: 0.5 }}>
                <Image
                    src="/logo.png"
                    alt="Advay Decor"
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
                Redirecting to admin login...
            </p>
        </div>
    );
}

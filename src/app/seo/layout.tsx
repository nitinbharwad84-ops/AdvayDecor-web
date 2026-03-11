'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    Search,
    Map,
    Settings,
    Menu,
    X,
    ChevronRight,
    LogOut,
    Globe,
} from 'lucide-react';
import { useSeoAuthStore } from '@/lib/auth-store';
import { createClient } from '@/lib/supabase';

const sidebarLinks = [
    { name: 'Dashboard', href: '/seo/dashboard', icon: LayoutDashboard },
    { name: 'Page Metadata', href: '/seo/metadata', icon: FileText },
    { name: 'Analytics', href: '/seo/analytics', icon: BarChart3 },
    { name: 'Search Console', href: '/seo/search-console', icon: Search },
    { name: 'Sitemap', href: '/seo/sitemap', icon: Map },
    { name: 'Settings', href: '/seo/settings', icon: Settings },
];

export default function SeoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isSeoAuthenticated, seoEmail, clearSeoAuth } = useSeoAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Show loading while hydrating
    if (!mounted) {
        return (
            <div style={{
                minHeight: '100vh', background: '#0a1a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '3px solid rgba(34,197,94,0.2)', borderTop: '3px solid #22c55e',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isSeoAuthenticated) {
        return <SeoRedirect />;
    }

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        clearSeoAuth();
        router.push('/seo-login');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f0f5f0' }}>
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex lg:hidden items-center justify-center"
                style={{
                    position: 'fixed', top: '1rem', left: '1rem', zIndex: 50,
                    width: '44px', height: '44px', borderRadius: '0.75rem',
                    background: '#fff', border: 'none', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: '#0a1a0a',
                }}
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div style={{ display: 'flex' }}>
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex" style={{
                    flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0,
                    width: '260px', background: '#fff', borderRight: '1px solid #e0e8e0',
                    overflowY: 'auto', zIndex: 40,
                }}>
                    <div style={{ padding: '1.5rem' }}>
                        {/* SEO branding */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Globe size={20} style={{ color: '#22c55e' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a1a0a' }}>SEO Dashboard</p>
                                <p style={{ fontSize: '0.7rem', color: '#6b7c6b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                    {seoEmail || 'AdvayDecor'}
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
                                            background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                                            color: isActive ? '#22c55e' : '#64748b',
                                        }}
                                    >
                                        <link.icon size={18} />
                                        {link.name}
                                        {isActive && (
                                            <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#22c55e' }} />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom actions */}
                    <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid #e0e8e0' }}>
                        <Link
                            href="/"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                fontSize: '0.875rem', fontWeight: 500, color: '#64748b',
                                textDecoration: 'none', marginBottom: '0.5rem',
                            }}
                        >
                            <Globe size={18} />
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
                                    background: 'rgba(10,26,10,0.5)', backdropFilter: 'blur(4px)',
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
                                            width: '40px', height: '40px', borderRadius: '0.75rem',
                                            background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Globe size={20} style={{ color: '#22c55e' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a1a0a' }}>SEO Dashboard</p>
                                            <p style={{ fontSize: '0.7rem', color: '#6b7c6b' }}>AdvayDecor</p>
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
                                                        background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                                                        color: isActive ? '#22c55e' : '#64748b',
                                                    }}
                                                >
                                                    <link.icon size={18} />
                                                    {link.name}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>

                                <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid #e0e8e0' }}>
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
                <main className="seo-main-content" style={{ flex: 1, minHeight: '100vh' }}>
                    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
                        {children}
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (min-width: 1024px) {
                    .seo-main-content {
                        margin-left: 260px;
                    }
                }
            `}</style>
        </div>
    );
}

// Separate component for redirect
function SeoRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/seo-login');
    }, [router]);

    return (
        <div style={{
            minHeight: '100vh', background: '#0a1a0a',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '1rem',
        }}>
            <div style={{ position: 'relative', width: '48px', height: '48px', opacity: 0.5 }}>
                <Image
                    src="/logo.svg"
                    unoptimized
                    alt="Advay Decor"
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
                Redirecting to SEO login...
            </p>
        </div>
    );
}

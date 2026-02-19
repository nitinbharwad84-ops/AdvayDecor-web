'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, ChevronRight, Search } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useUserAuthStore } from '@/lib/auth-store';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Story', href: '/story' },
    { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { openCart, getItemCount } = useCartStore();
    const { user, isAuthenticated, clearUser } = useUserAuthStore();
    const [itemCount, setItemCount] = useState(0);



    const isHeroPage = pathname === '/';
    const showSolid = !isHeroPage || isScrolled;

    useEffect(() => {
        setItemCount(getItemCount());
    }, [getItemCount]);

    useEffect(() => {
        const unsub = useCartStore.subscribe((state) => {
            setItemCount(state.getItemCount());
        });
        return unsub;
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileOpen]);

    return (
        <>
            {/* CSS variable for nav height - used by pages for top padding */}
            <style jsx global>{`
                :root { --nav-height: ${showSolid ? '64px' : '72px'}; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <motion.header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: showSolid ? '0' : '0',
                    background: showSolid
                        ? 'rgba(255,255,255,0.92)'
                        : 'linear-gradient(180deg, rgba(10,10,35,0.5) 0%, transparent 100%)',
                    backdropFilter: showSolid ? 'blur(20px) saturate(1.4)' : 'none',
                    WebkitBackdropFilter: showSolid ? 'blur(20px) saturate(1.4)' : 'none',
                    borderBottom: showSolid ? '1px solid rgba(0,0,0,0.04)' : '1px solid transparent',
                    boxShadow: showSolid ? '0 1px 12px rgba(0,0,0,0.04)' : 'none',
                }}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            >
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: showSolid ? '0.75rem 1.5rem' : '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'padding 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Image
                                src="/logo.png"
                                alt="Advay Decor"
                                width={36}
                                height={36}
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                            <span
                                className="font-[family-name:var(--font-display)]"
                                style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}
                            >
                                <span style={{
                                    color: showSolid ? '#0a0a23' : '#ffffff',
                                    transition: 'color 0.4s ease',
                                }}>
                                    Advay
                                </span>
                                <span style={{ color: '#00b4d8' }}>Decor</span>
                            </span>
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    style={{
                                        position: 'relative',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase' as const,
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        color: isActive
                                            ? (showSolid ? '#0a0a23' : '#ffffff')
                                            : (showSolid ? 'rgba(10,10,35,0.5)' : 'rgba(255,255,255,0.6)'),
                                        background: isActive
                                            ? (showSolid ? 'rgba(0,180,216,0.08)' : 'rgba(255,255,255,0.1)')
                                            : 'transparent',
                                    }}
                                >
                                    {link.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavPill"
                                            style={{
                                                position: 'absolute',
                                                bottom: '2px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '16px',
                                                height: '2px',
                                                borderRadius: '9999px',
                                                background: '#00b4d8',
                                            }}
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {/* Search (desktop only) */}
                        <button
                            className="hidden md:flex"
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                background: 'transparent',
                                color: showSolid ? 'rgba(10,10,35,0.5)' : 'rgba(255,255,255,0.6)',
                            }}
                            aria-label="Search"
                        >
                            <Search size={18} strokeWidth={1.8} />
                        </button>

                        {/* User — auth-aware */}
                        {isAuthenticated ? (
                            <Link
                                href="/profile"
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: 'transparent',
                                    color: showSolid ? '#0a0a23' : '#ffffff',
                                    textDecoration: 'none',
                                }}
                                title="My Profile"
                                aria-label="My Profile"
                            >
                                <User size={18} strokeWidth={1.8} />
                                <span style={{
                                    position: 'absolute', bottom: '4px', right: '4px',
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: '#22c55e', border: '2px solid #fff',
                                }} />
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    transition: 'all 0.3s ease',
                                    color: showSolid ? 'rgba(10,10,35,0.5)' : 'rgba(255,255,255,0.6)',
                                    textDecoration: 'none',
                                }}
                            >
                                <User size={18} strokeWidth={1.8} />
                            </Link>
                        )}

                        {/* Cart */}
                        <button
                            onClick={openCart}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                background: 'transparent',
                                color: showSolid ? 'rgba(10,10,35,0.5)' : 'rgba(255,255,255,0.6)',
                            }}
                            aria-label="Open cart"
                        >
                            <ShoppingBag size={18} strokeWidth={1.8} />
                            {itemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={{
                                        position: 'absolute',
                                        top: '2px',
                                        right: '2px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: '#00b4d8',
                                        color: '#fff',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,180,216,0.4)',
                                    }}
                                >
                                    {itemCount}
                                </motion.span>
                            )}
                        </button>

                        {/* Mobile Hamburger — flex on mobile, hidden on md+ */}
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="flex md:hidden items-center justify-center"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                background: 'transparent',
                                color: showSolid ? '#0a0a23' : '#ffffff',
                                marginLeft: '0.25rem',
                            }}
                            aria-label="Toggle menu"
                        >
                            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                        className="md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(10,10,35,0.6)',
                                backdropFilter: 'blur(4px)',
                            }}
                            onClick={() => setIsMobileOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Slide-in Panel */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '85%',
                                maxWidth: '360px',
                                height: '100%',
                                background: '#fdfbf7',
                                boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            {/* Panel Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid #f0ece4',
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Image
                                        src="/logo.png"
                                        alt="Advay Decor"
                                        width={32}
                                        height={32}
                                        style={{ objectFit: 'contain' }}
                                    />
                                    <span
                                        className="font-[family-name:var(--font-display)]"
                                        style={{ fontSize: '1.25rem', fontWeight: 700 }}
                                    >
                                        <span style={{ color: '#0a0a23' }}>Advay</span>
                                        <span style={{ color: '#00b4d8' }}>Decor</span>
                                    </span>
                                </span>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        background: 'rgba(10,10,35,0.04)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#0a0a23',
                                    }}
                                    aria-label="Close menu"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Nav Links */}
                            <nav style={{ padding: '1rem 1rem', flex: 1 }}>
                                {navLinks.map((link, index) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <motion.div
                                            key={link.name}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + index * 0.05 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsMobileOpen(false)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '1rem 1rem',
                                                    borderRadius: '0.75rem',
                                                    textDecoration: 'none',
                                                    fontSize: '1rem',
                                                    fontWeight: isActive ? 600 : 500,
                                                    color: isActive ? '#00b4d8' : '#0a0a23',
                                                    background: isActive ? 'rgba(0,180,216,0.06)' : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    marginBottom: '0.25rem',
                                                }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {isActive && (
                                                        <span style={{
                                                            width: '4px',
                                                            height: '20px',
                                                            borderRadius: '9999px',
                                                            background: '#00b4d8',
                                                        }} />
                                                    )}
                                                    {link.name}
                                                </span>
                                                <ChevronRight size={16} style={{ color: isActive ? '#00b4d8' : '#9e9eb8' }} />
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </nav>

                            {/* Bottom — auth-aware */}
                            <motion.div
                                style={{
                                    padding: '1.25rem 1.5rem',
                                    borderTop: '1px solid #f0ece4',
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {isAuthenticated ? (
                                    <>
                                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                            <p style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>Signed in as</p>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a0a23' }}>{user?.full_name || user?.email}</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsMobileOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '0.75rem',
                                                background: '#0a0a23',
                                                color: '#ffffff',
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            <User size={16} />
                                            My Profile
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMobileOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            background: 'linear-gradient(135deg, #0a0a23, #1a1a3e)',
                                            color: '#ffffff',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        <User size={16} />
                                        Sign In / Create Account
                                    </Link>
                                )}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

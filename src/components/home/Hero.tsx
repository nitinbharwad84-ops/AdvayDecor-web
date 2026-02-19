'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';

export default function Hero() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);

    return (
        <section ref={ref} className="relative w-full min-h-screen overflow-hidden" style={{ minHeight: '100vh' }}>
            {/* Background Image with Parallax */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ y, scale }}
            >
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80')`,
                    }}
                />
                {/* Multi-layer gradient overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a23]/80 via-[#0a0a23]/40 to-[#0a0a23]/90" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a23]/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a23]/50 via-transparent to-transparent" />
            </motion.div>

            {/* Decorative Orbs */}
            <div className="absolute top-32 right-16 w-80 h-80 rounded-full animate-float hidden lg:block"
                style={{ background: 'radial-gradient(circle, rgba(0,180,216,0.12) 0%, transparent 70%)' }} />
            <div className="absolute bottom-48 left-8 w-56 h-56 rounded-full animate-float hidden lg:block"
                style={{ background: 'radial-gradient(circle, rgba(200,169,81,0.1) 0%, transparent 70%)', animationDelay: '3s' }} />
            <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full animate-float hidden xl:block"
                style={{ background: 'radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 70%)', animationDelay: '5s' }} />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }} />

            {/* Content */}
            <motion.div
                className="relative z-10 flex items-center justify-center"
                style={{ opacity, minHeight: '100vh' }}
            >
                <div className="w-full" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ maxWidth: '680px' }}>
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="inline-flex items-center rounded-full text-sm"
                            style={{
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'rgba(255,255,255,0.9)',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <Sparkles size={14} style={{ color: '#00b4d8' }} />
                            Handcrafted with Love
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.7 }}
                            className="font-bold text-white font-[family-name:var(--font-display)]"
                            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', lineHeight: 1.08, marginBottom: '1.5rem' }}
                        >
                            Your Space,
                            <br />
                            <span className="relative">
                                Your{' '}
                                <span className="relative" style={{ color: '#00b4d8' }}>
                                    Vibe
                                    <motion.svg
                                        className="absolute w-full"
                                        style={{ bottom: '-6px', left: 0 }}
                                        viewBox="0 0 300 12"
                                        fill="none"
                                    >
                                        <motion.path
                                            d="M2 8C50 2 100 4 150 6C200 8 250 4 298 7"
                                            stroke="#00b4d8"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ delay: 1.2, duration: 0.8, ease: 'easeInOut' }}
                                        />
                                    </motion.svg>
                                </span>
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                            style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.55)', maxWidth: '540px', marginBottom: '2.5rem', lineHeight: 1.7 }}
                        >
                            Elevate your space with elegance & style. Discover our curated collection of premium, artisanal home decor crafted to inspire.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.6 }}
                            className="flex flex-wrap"
                            style={{ gap: '1rem' }}
                        >
                            <Link href="/shop">
                                <motion.button
                                    className="group inline-flex items-center font-semibold text-white"
                                    style={{
                                        gap: '0.5rem',
                                        padding: '1rem 2rem',
                                        background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                                        borderRadius: '9999px',
                                        fontSize: '0.95rem',
                                        boxShadow: '0 8px 32px rgba(0,180,216,0.3)',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                    whileHover={{ scale: 1.04, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Explore Collection
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>
                            <Link href="/story">
                                <motion.button
                                    className="font-semibold text-white"
                                    style={{
                                        padding: '1rem 2rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.95rem',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        background: 'rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(8px)',
                                        cursor: 'pointer',
                                    }}
                                    whileHover={{ scale: 1.04, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Our Story
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute left-1/2 z-10 flex flex-col items-center"
                style={{ bottom: '2rem', transform: 'translateX(-50%)', gap: '0.5rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Scroll</span>
                <motion.div
                    style={{ width: '1.5rem', height: '2.5rem', borderRadius: '9999px', border: '2px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', paddingTop: '0.5rem' }}
                >
                    <motion.div
                        style={{ width: '3px', height: '10px', borderRadius: '9999px', background: '#00b4d8' }}
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    />
                </motion.div>
            </motion.div>
        </section>
    );
}

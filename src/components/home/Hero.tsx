'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
    const bgRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const progress = Math.min(scrollY / windowHeight, 1);

            // Background parallax: translate Y (0 to 200) and scale (1 to 1.15)
            if (bgRef.current) {
                const y = progress * 200;
                const scale = 1 + (progress * 0.15);
                bgRef.current.style.transform = `translateY(${y}px) scale(${scale})`;
            }

            // Content opacity (1 down to 0 at 50% scroll)
            if (contentRef.current) {
                const opacityProgress = Math.min(scrollY / (windowHeight * 0.5), 1);
                const opacity = 1 - opacityProgress;
                contentRef.current.style.opacity = opacity.toString();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial setup
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="relative w-full min-h-screen overflow-hidden" style={{ minHeight: '100vh' }}>
            {/* Background Image with Parallax */}
            <div
                ref={bgRef}
                className="absolute inset-0 z-0 origin-center will-change-transform"
            >
                <Image
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=75"
                    alt="Elegant living room with premium home decor by Advay Decor"
                    fill
                    priority
                    fetchPriority="high"
                    sizes="100vw"
                    quality={60}
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxQf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJYvD6## truncated"
                />
                {/* Multi-layer gradient overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a23]/80 via-[#0a0a23]/40 to-[#0a0a23]/90" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a23]/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a23]/50 via-transparent to-transparent" />
            </div>

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
            <div
                ref={contentRef}
                className={`relative z-10 flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ minHeight: '100vh', willChange: 'opacity' }}
            >
                <div className="w-full" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ maxWidth: '680px' }}>
                        {/* Badge */}
                        <div
                            className="inline-flex items-center rounded-full text-sm animate-fade-in-up"
                            style={{
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'rgba(255,255,255,0.9)',
                                marginBottom: '1.5rem',
                                animationDelay: '0.3s',
                            }}
                        >
                            <Sparkles size={14} style={{ color: '#00b4d8' }} />
                            Handcrafted with Love
                        </div>

                        {/* Heading */}
                        <h1
                            className="font-bold text-white font-[family-name:var(--font-display)] animate-fade-in-up"
                            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', lineHeight: 1.08, marginBottom: '1.5rem', animationDelay: '0.5s' }}
                        >
                            Your Space,
                            <br />
                            <span className="relative">
                                Your{' '}
                                <span className="relative" style={{ color: '#00b4d8' }}>
                                    Vibe
                                    <svg
                                        className="absolute w-full"
                                        style={{ bottom: '-6px', left: 0 }}
                                        viewBox="0 0 300 12"
                                        fill="none"
                                    >
                                        <path
                                            d="M2 8C50 2 100 4 150 6C200 8 250 4 298 7"
                                            stroke="#00b4d8"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            className={isVisible ? "animate-draw-path" : ""}
                                        />
                                    </svg>
                                </span>
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p
                            className="animate-fade-in-up"
                            style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.55)', maxWidth: '540px', marginBottom: '2.5rem', lineHeight: 1.7, animationDelay: '0.7s' }}
                        >
                            Elevate your space with Advay Decor. Discover our curated collection of premium, artisanal home decor crafted to inspire.
                        </p>

                        {/* CTAs */}
                        <div
                            className="flex flex-wrap animate-fade-in-up"
                            style={{ gap: '1rem', animationDelay: '0.9s' }}
                        >
                            <Link href="/shop">
                                <button
                                    className="group inline-flex items-center font-semibold text-white hover:scale-105 active:scale-95 transition-all duration-300"
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
                                >
                                    Explore Collection
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/story">
                                <button
                                    className="font-semibold text-white hover:scale-105 active:scale-95 transition-all duration-300"
                                    style={{
                                        padding: '1rem 2rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.95rem',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        background: 'rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(8px)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Our Story
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div
                className={`absolute left-1/2 z-10 flex flex-col items-center transition-opacity duration-1000 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ bottom: '2rem', transform: 'translateX(-50%)', gap: '0.5rem' }}
            >
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Scroll</span>
                <div
                    style={{ width: '1.5rem', height: '2.5rem', borderRadius: '9999px', border: '2px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', paddingTop: '0.5rem' }}
                >
                    <div
                        className="animate-bounce-indicator"
                        style={{ width: '3px', height: '10px', borderRadius: '9999px', background: '#00b4d8' }}
                    />
                </div>
            </div>
        </section>
    );
}

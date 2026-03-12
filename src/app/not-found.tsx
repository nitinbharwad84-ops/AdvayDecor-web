'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Search, Sparkles } from 'lucide-react';

export default function NotFound() {
    return (
        <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', backgroundColor: '#fdfbf7', position: 'relative', overflow: 'hidden', width: '100%' }}>
            {/* Background Decorative Elements */}
            <motion.div 
                style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.04, pointerEvents: 'none' }}
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                <Sparkles size={120} />
            </motion.div>
            <motion.div 
                style={{ position: 'absolute', bottom: '15%', right: '10%', opacity: 0.04, pointerEvents: 'none' }}
                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <ShoppingBag size={150} />
            </motion.div>

            <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                {/* 404 Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'center' }}
                >
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
                        <span className="text-[120px] md:text-[180px]" style={{ fontWeight: 800, color: '#00b4d8', opacity: 0.08, letterSpacing: '-0.05em', userSelect: 'none', lineHeight: 1 }}>
                            404
                        </span>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Search className="w-20 h-20 md:w-28 md:h-28" strokeWidth={1.5} color="#00b4d8" style={{ opacity: 0.85 }} />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    style={{ marginBottom: '3.5rem' }}
                >
                    <h1 className="text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-display), "Playfair Display", serif', fontWeight: 600, color: '#0a0a23', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                        Lost in the <span style={{ color: '#00b4d8' }}>Decor?</span>
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: '#64648b', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto', fontWeight: 300 }}>
                        The piece of beauty you are looking for seems to have vanished. 
                        Let's find your way back to creating a home you love.
                    </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                    className="flex-col sm:flex-row"
                >
                    <Link
                        href="/"
                        className="group relative overflow-hidden transition-all hover:bg-[#1a1a3e]"
                        style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            padding: '0 2rem', height: '54px', backgroundColor: '#0a0a23', color: '#ffffff',
                            borderRadius: '9999px', fontWeight: 500, textDecoration: 'none',
                            boxShadow: '0 8px 32px rgba(10,10,35,0.15)', minWidth: '200px'
                        }}
                    >
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <Home size={18} />
                        <span>Back to Home</span>
                    </Link>
                    
                    <Link
                        href="/shop"
                        className="transition-all hover:border-[#00b4d8] hover:text-[#00b4d8]"
                        style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            padding: '0 2rem', height: '54px', backgroundColor: '#ffffff', color: '#0a0a23',
                            border: '1px solid #c0bcb4', borderRadius: '9999px', fontWeight: 500, textDecoration: 'none',
                            minWidth: '200px'
                        }}
                    >
                        <ShoppingBag size={18} />
                        <span>Explore Shop</span>
                    </Link>
                </motion.div>

                {/* Footer Notes */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    style={{ marginTop: '4.5rem', paddingTop: '2.5rem', borderTop: '1px solid #eae5de', fontSize: '0.875rem', color: '#8c8c9e' }}
                >
                    <p style={{ marginBottom: '0.5rem', fontStyle: 'italic' }}>"Art should be found in every corner of your home."</p>
                    <p>
                        Need assistance? Contact us at 
                        <a href="mailto:support@advaydecor.in" className="hover:underline" style={{ marginLeft: '0.35rem', color: '#00b4d8', fontWeight: 600, textDecoration: 'none' }}>
                            support@advaydecor.in
                        </a>
                        <span style={{ margin: '0 0.5rem' }}>or</span>
                        <a href="mailto:help@advaydecor.in" className="hover:underline" style={{ color: '#00b4d8', fontWeight: 600, textDecoration: 'none' }}>
                            help@advaydecor.in
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

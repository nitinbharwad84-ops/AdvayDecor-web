'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';

export default function HomeHighlights() {
    return (
        <>
            {/* Why AdvayDecor Section */}
            <section style={{ padding: '5rem 0', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, right: 0, width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(0,180,216,0.04) 0%, transparent 70%)',
                    transform: 'translate(30%, -30%)',
                }} />

                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <span style={{ color: '#00b4d8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Why Choose Us
                        </span>
                        <h2
                            className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 700, color: '#0a0a23', marginTop: '0.5rem' }}
                        >
                            The AdvayDecor Difference
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem' }}>
                        {[
                            {
                                num: '01',
                                title: 'Artisan Crafted',
                                desc: 'Every piece is designed with care and crafted by skilled artisans who pour their passion into every stitch.',
                                gradient: 'linear-gradient(135deg, rgba(0,180,216,0.06), rgba(0,180,216,0.02))',
                            },
                            {
                                num: '02',
                                title: 'Premium Materials',
                                desc: '100% cotton and eco-friendly materials ensure durability, comfort, and a luxurious feel that lasts.',
                                gradient: 'linear-gradient(135deg, rgba(200,169,81,0.06), rgba(200,169,81,0.02))',
                            },
                            {
                                num: '03',
                                title: 'Affordable Luxury',
                                desc: 'Premium quality at honest prices. Beautiful home decor should be accessible to everyone.',
                                gradient: 'linear-gradient(135deg, rgba(0,180,216,0.06), rgba(200,169,81,0.02))',
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={item.num}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                className="group"
                            >
                                <div style={{
                                    padding: '2.5rem 2rem',
                                    borderRadius: '1.25rem',
                                    border: '1px solid #f0ece4',
                                    height: '100%',
                                    transition: 'all 0.5s ease',
                                    background: item.gradient,
                                    cursor: 'default',
                                }}>
                                    <span className="font-[family-name:var(--font-display)]"
                                        style={{ fontSize: '3.5rem', fontWeight: 700, color: 'rgba(0,180,216,0.12)', lineHeight: 1 }}>
                                        {item.num}
                                    </span>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0a0a23', marginTop: '1rem', marginBottom: '0.75rem' }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64648b', lineHeight: 1.7 }}>
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial / Quote Section */}
            <section style={{
                padding: '5rem 0',
                background: 'linear-gradient(135deg, #0a0a23, #1a1a3e)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }} />

                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ maxWidth: '720px', margin: '0 auto' }}
                    >
                        <Quote size={40} style={{ color: 'rgba(0,180,216,0.25)', margin: '0 auto 1.5rem' }} />
                        <blockquote
                            className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, fontStyle: 'italic' }}
                        >
                            &ldquo;A home should tell the story of who you are, and be a collection of what you love.&rdquo;
                        </blockquote>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '1.5rem' }}>
                            — Nate Berkus
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{ padding: '6rem 0', background: '#fdfbf7', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, width: '320px', height: '320px',
                    background: 'radial-gradient(circle, rgba(200,169,81,0.06) 0%, transparent 70%)',
                    transform: 'translate(-30%, 30%)',
                }} />

                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}
                    >
                        <h2
                            className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#0a0a23', marginBottom: '1rem' }}
                        >
                            Ready to Transform Your Space?
                        </h2>
                        <p style={{ color: '#64648b', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Explore our handpicked collection and find the perfect piece to complement your home.
                        </p>
                        <Link href="/shop">
                            <motion.button
                                className="group inline-flex items-center font-semibold text-white"
                                style={{
                                    gap: '0.5rem',
                                    padding: '1rem 2.25rem',
                                    background: 'linear-gradient(135deg, #0a0a23, #1a1a3e)',
                                    borderRadius: '9999px',
                                    fontSize: '0.95rem',
                                    boxShadow: '0 8px 24px rgba(10,10,35,0.2)',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                whileHover={{ scale: 1.04, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Shop the Collection
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </>
    );
}

'use client';

import { motion } from 'framer-motion';
import { Heart, Star, Palette, Sparkles } from 'lucide-react';

export default function StoryPage() {
    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)' }}>
            {/* Hero Banner */}
            <section style={{
                position: 'relative',
                background: 'linear-gradient(145deg, #0a0a23, #1a1a3e)',
                padding: '5rem 0 6rem',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.05,
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }} />
                <div style={{
                    position: 'absolute', top: '40px', right: '40px', width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} className="hidden lg:block" />

                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: '#00b4d8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}
                    >
                        Our Journey
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff', marginTop: '0.75rem', marginBottom: '1.25rem' }}
                    >
                        The AdvayDecor Story
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}
                    >
                        Born from a passion for artisanal craftsmanship and a love for beautiful spaces.
                    </motion.p>
                </div>
            </section>

            {/* Story Content */}
            <section style={{ padding: '5rem 0' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Story sections */}
                            {[
                                {
                                    title: 'It Started with a Vision',
                                    content: 'AdvayDecor was born from a simple yet powerful idea — that every home deserves to be a reflection of its owner\u2019s unique personality. We noticed a gap in the market: while mass-produced decor dominated shelves, there was a craving for something more personal, more artisanal, more alive.',
                                },
                                {
                                    title: 'Craftsmanship Meets Modernity',
                                    content: 'Every piece in our collection represents a harmonious blend of traditional Indian craftsmanship and contemporary design sensibilities. We work directly with skilled artisans across India, ensuring that each product carries the warmth of handcrafted authenticity while meeting the aesthetic standards of modern living.',
                                },
                                {
                                    title: 'More Than Decor',
                                    content: 'We don\u2019t just sell cushions and decor — we help you create spaces that tell your story. Spaces that welcome you home after a long day, that make your guests feel the warmth of your personality, and that bring a smile to your face every morning.',
                                },
                            ].map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{
                                        marginBottom: '2.5rem',
                                        paddingLeft: '2rem',
                                        borderLeft: index === 0 ? '3px solid' : '3px solid transparent',
                                        borderImage: index === 0 ? 'linear-gradient(180deg, #00b4d8, #c8a951) 1' : 'none',
                                    }}
                                >
                                    <h2
                                        className="font-[family-name:var(--font-display)]"
                                        style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.75rem' }}
                                    >
                                        {section.title}
                                    </h2>
                                    <p style={{ fontSize: '1rem', color: '#64648b', lineHeight: 1.8 }}>
                                        {section.content}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section style={{ padding: '5rem 0', background: '#ffffff' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '3rem' }}
                    >
                        <h2
                            className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#0a0a23' }}
                        >
                            Our Values
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.25rem', maxWidth: '960px', margin: '0 auto' }}>
                        {[
                            { icon: Heart, title: 'Passion', desc: 'Every product is infused with love and creative energy.', color: '#ef4444' },
                            { icon: Star, title: 'Quality', desc: '100% premium materials that stand the test of time.', color: '#c8a951' },
                            { icon: Palette, title: 'Creativity', desc: 'Unique designs that break the monotony of mass production.', color: '#00b4d8' },
                            { icon: Sparkles, title: 'Joy', desc: 'Creating moments of delight in everyday spaces.', color: '#8b5cf6' },
                        ].map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                                style={{
                                    textAlign: 'center',
                                    padding: '2rem 1.5rem',
                                    borderRadius: '1.25rem',
                                    border: '1px solid #f0ece4',
                                    transition: 'all 0.5s ease',
                                    cursor: 'default',
                                }}
                            >
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    margin: '0 auto 1rem',
                                    borderRadius: '0.75rem',
                                    background: `${value.color}10`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.4s ease',
                                }}>
                                    <value.icon size={24} style={{ color: value.color }} />
                                </div>
                                <h3 style={{ fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>{value.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#9e9eb8', lineHeight: 1.5 }}>{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote */}
            <section style={{
                padding: '5rem 0',
                background: 'linear-gradient(135deg, #0a0a23, #1a1a3e)',
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
                    <motion.blockquote
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="font-[family-name:var(--font-display)]"
                        style={{
                            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                            color: 'rgba(255,255,255,0.88)',
                            fontStyle: 'italic',
                            maxWidth: '720px',
                            margin: '0 auto',
                            lineHeight: 1.6,
                        }}
                    >
                        &ldquo;Your space is a canvas. Let it tell the world who you are.&rdquo;
                    </motion.blockquote>
                    <p style={{ color: '#00b4d8', marginTop: '1.5rem', fontWeight: 600, fontSize: '0.875rem' }}>— Team AdvayDecor</p>
                </div>
            </section>
        </div>
    );
}

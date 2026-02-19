'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, Sparkles, Undo2 } from 'lucide-react';

const badges = [
    { icon: Truck, label: 'Pan-India Delivery', sub: 'Free above ₹999' },
    { icon: Shield, label: 'Secure Payments', sub: '100% Protected' },
    { icon: Sparkles, label: 'Artisan Crafted', sub: 'Handmade with love' },
    { icon: Undo2, label: 'Easy Returns', sub: '7-day return policy' },
];

export default function TrustBadges() {
    return (
        <section style={{ padding: '4rem 0', background: '#ffffff', borderBottom: '1px solid #f0ece4' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '1.5rem' }}>
                    {badges.map((badge, index) => (
                        <motion.div
                            key={badge.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                            className="group"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.25rem',
                                borderRadius: '1rem',
                                border: '1px solid rgba(0,0,0,0.04)',
                                transition: 'all 0.4s ease',
                                cursor: 'default',
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(0,180,216,0.08), rgba(0,180,216,0.04))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.4s ease',
                            }}>
                                <badge.icon size={22} style={{ color: '#00b4d8' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23', marginBottom: '2px' }}>
                                    {badge.label}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>
                                    {badge.sub}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

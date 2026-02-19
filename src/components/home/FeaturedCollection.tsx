'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export default function FeaturedCollection() {
    const [featured, setFeatured] = useState<Product[]>([]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFeatured(data.filter((p: Product) => p.is_active).slice(0, 4));
                }
            })
            .catch(() => { });
    }, []);

    return (
        <section style={{ padding: '5rem 0', background: '#fdfbf7' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span style={{ color: '#00b4d8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Curated for You
                        </span>
                        <h2
                            className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#0a0a23', marginTop: '0.5rem' }}
                        >
                            Featured Collection
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <Link
                            href="/shop"
                            className="group hidden sm:inline-flex items-center font-medium"
                            style={{ gap: '0.5rem', fontSize: '0.875rem', color: '#00b4d8' }}
                        >
                            View All
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '1.25rem' }}>
                    {featured.map((product, index) => {
                        const mainImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=600&q=80';
                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                            >
                                <Link href={`/product/${product.slug}`} className="group block">
                                    <div style={{ borderRadius: '1rem', overflow: 'hidden', background: '#fff', border: '1px solid #f0ece4', transition: 'all 0.5s ease' }}>
                                        {/* Image */}
                                        <div className="relative overflow-hidden" style={{ aspectRatio: '1/1', background: '#f5f0e8' }}>
                                            <Image
                                                src={mainImage}
                                                alt={product.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                            <div className="absolute inset-0 transition-all duration-500"
                                                style={{ background: 'linear-gradient(to top, rgba(10,10,35,0.15) 0%, transparent 50%)' }} />
                                            <motion.div
                                                className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                style={{ bottom: '1rem', left: '1rem', right: '1rem', transform: 'translateY(0.5rem)' }}
                                            >
                                                <span style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    padding: '0.625rem',
                                                    background: 'rgba(255,255,255,0.92)',
                                                    backdropFilter: 'blur(8px)',
                                                    color: '#0a0a23',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    textAlign: 'center',
                                                    borderRadius: '0.75rem',
                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                }}>
                                                    View Details
                                                </span>
                                            </motion.div>
                                        </div>

                                        {/* Info */}
                                        <div style={{ padding: '1rem' }}>
                                            <p style={{ fontSize: '0.65rem', color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                                                {product.category}
                                            </p>
                                            <h3 className="group-hover:text-cyan transition-colors duration-300"
                                                style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {product.title}
                                            </h3>
                                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a0a23', marginTop: '0.5rem' }}>
                                                {formatCurrency(product.base_price)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mobile CTA */}
                <div className="sm:hidden" style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link
                        href="/shop"
                        className="inline-flex items-center font-medium"
                        style={{ gap: '0.5rem', fontSize: '0.875rem', color: '#00b4d8' }}
                    >
                        View All Products
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}

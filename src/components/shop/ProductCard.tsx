'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const mainImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=600&q=80';
    const hasLowStock = product.variants?.some((v) => v.stock_quantity > 0 && v.stock_quantity < 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
        >
            <Link href={`/product/${product.slug}`} className="group block">
                <div style={{
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    background: '#fff',
                    border: '1px solid #f0ece4',
                    transition: 'all 0.5s ease',
                }}>
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: '1/1', background: '#f5f0e8' }}>
                        <Image
                            src={mainImage}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />

                        {/* Quick View */}
                        <motion.div
                            className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300"
                            style={{ bottom: '1rem', left: '1rem', right: '1rem' }}
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

                        {/* Badges */}
                        <div className="absolute" style={{ top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {hasLowStock && (
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: '#ef4444',
                                    color: '#fff',
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    borderRadius: '9999px',
                                }}>
                                    Low Stock
                                </span>
                            )}
                        </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a0a23' }}>
                                {formatCurrency(product.base_price)}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

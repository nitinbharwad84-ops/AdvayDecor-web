'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface FeaturedCollectionClientProps {
    products: Product[];
}

const FALLBACK = 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=600&q=80';

export default function FeaturedCollectionClient({ products }: FeaturedCollectionClientProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.25rem' }}>
            {products.map((product, index) => {
                const mainImage = product.images?.[0]?.image_url || FALLBACK;
                return (
                    <div
                        key={product.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                    >
                        <Link href={`/product/${product.slug}`} className="group block">
                            <div style={{ borderRadius: '1rem', overflow: 'hidden', background: '#fff', border: '1px solid #f0ece4', transition: 'all 0.5s ease' }}>
                                {/* Image */}
                                <div className="relative overflow-hidden" style={{ aspectRatio: '1/1', background: '#f5f0e8' }}>
                                    <Image
                                        src={mainImage}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 transition-all duration-500"
                                        style={{ background: 'linear-gradient(to top, rgba(10,10,35,0.15) 0%, transparent 50%)' }} />
                                    <div
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
                                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a0a23', marginTop: '0.5rem' }}>
                                        {formatCurrency(product.base_price)}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}

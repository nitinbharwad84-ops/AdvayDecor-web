'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, LayoutGrid } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import type { Product } from '@/types';

export default function ShopPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [gridCols, setGridCols] = useState<2 | 3>(3);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Dynamically derive categories from products
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(
            new Set(allProducts.map((p) => p.category).filter(Boolean))
        );
        return ['All', ...uniqueCategories];
    }, [allProducts]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAllProducts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(
            (p) => p.is_active && (selectedCategory === 'All' || p.category === selectedCategory)
        );
    }, [selectedCategory, allProducts]);

    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)' }}>
            {/* Page Header */}
            <section style={{
                position: 'relative',
                background: 'linear-gradient(145deg, #0a0a23, #1a1a3e)',
                padding: '4rem 0 5rem',
                overflow: 'hidden',
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                }} />
                <div style={{
                    position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />

                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: '#00b4d8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}
                    >
                        Our Collection
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff', marginTop: '0.75rem', marginBottom: '1rem' }}
                    >
                        Shop
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}
                    >
                        Discover our curated collection of premium home decor, crafted to bring warmth and style to your space.
                    </motion.p>
                </div>
            </section>

            {/* Filters & Grid */}
            <section style={{ padding: '3rem 0 4rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Toolbar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '2rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '1px solid #f0ece4',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64648b' }}>
                                <SlidersHorizontal size={16} />
                                <span>Filter:</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        style={{
                                            padding: '0.5rem 1.25rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            background: selectedCategory === cat ? '#0a0a23' : '#f5f0e8',
                                            color: selectedCategory === cat ? '#fff' : '#64648b',
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#9e9eb8', marginRight: '0.5rem' }}>
                                {filteredProducts.length} products
                            </span>
                            <button
                                onClick={() => setGridCols(2)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: gridCols === 2 ? 'rgba(10,10,35,0.1)' : 'transparent',
                                    color: gridCols === 2 ? '#0a0a23' : '#9e9eb8',
                                }}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setGridCols(3)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: gridCols === 3 ? 'rgba(10,10,35,0.1)' : 'transparent',
                                    color: gridCols === 3 ? '#0a0a23' : '#9e9eb8',
                                }}
                            >
                                <Grid3X3 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {/* Product Grid */}
                    {!loading && (
                        <div
                            className={`grid ${gridCols === 3
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-1 sm:grid-cols-2'
                                }`}
                            style={{ gap: '1.5rem' }}
                        >
                            {filteredProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))}
                        </div>
                    )}

                    {!loading && filteredProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                            <p style={{ color: '#9e9eb8', fontSize: '1.1rem' }}>No products found in this category.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

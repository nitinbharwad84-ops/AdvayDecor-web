'use client';

import { useState, useMemo, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, LayoutGrid, ChevronDown, Search, X } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import type { Product } from '@/types';

interface ShopClientProps {
    initialProducts: Product[];
    initialCategory?: string;
}

export default function ShopClient({ initialProducts, initialCategory = 'All' }: ShopClientProps) {
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [gridCols, setGridCols] = useState<2 | 3>(3);
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Dynamically derive categories from products
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(
            new Set(initialProducts.map((p) => p.category).filter(Boolean))
        );
        return ['All', ...uniqueCategories];
    }, [initialProducts]);

    const sortedProducts = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        let items = initialProducts.filter(
            (p) => {
                const is_active = p.is_active;
                const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
                const matchesSearch = !query ||
                    p.title.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query));

                return is_active && matchesCategory && matchesSearch;
            }
        );

        if (sortBy === 'price-low') {
            items.sort((a, b) => a.base_price - b.base_price);
        } else if (sortBy === 'price-high') {
            items.sort((a, b) => b.base_price - a.base_price);
        } else if (sortBy === 'newest') {
            items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortBy === 'rating') {
            items.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        }

        return items;
    }, [selectedCategory, sortBy, initialProducts, searchQuery]);

    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)' }}>
            {/* Page Header */}
            <section style={{
                position: 'relative',
                background: 'linear-gradient(145deg, #0a0a23, #1a1a3e)',
                padding: '4rem 0 5rem',
                overflow: 'hidden',
            }}>
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
                    <m.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: '#00b4d8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}
                    >
                        Our Collection
                    </m.span>
                    <m.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff', marginTop: '0.75rem', marginBottom: '1rem' }}
                    >
                        Cushion Covers Online
                    </m.h1>
                    <m.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}
                    >
                        Curated linen, embroidered & boucl cushions for sofas. Discover premium artistic decor to match your space.
                    </m.p>
                </div>
            </section>

            {/* Filters & Grid */}
            <section style={{ padding: '3rem 0 4rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Toolbar */}
                    <div
                        className="flex flex-col xl:flex-row xl:items-center justify-between gap-6"
                        style={{ marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0ece4' }}
                    >
                        <div className="flex items-center gap-3 w-full xl:w-auto overflow-hidden">
                            <div className="flex items-center gap-2 text-[#64648b] shrink-0" style={{ fontSize: '0.875rem' }}>
                                <SlidersHorizontal size={16} />
                                <span>Filter:</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 w-full" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className="shrink-0"
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
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full xl:flex-1 xl:max-w-md">
                            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '9999px', border: '1px solid #e2e8f0', padding: '0 1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <Search size={16} style={{ color: '#9e9eb8', flexShrink: 0, marginRight: '0.5rem' }} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '0.6rem 0',
                                        fontSize: '0.875rem',
                                        color: '#0a0a23',
                                        outline: 'none',
                                        width: '100%',
                                        fontWeight: 500
                                    }}
                                />
                                <AnimatePresence>
                                    {searchQuery && (
                                        <m.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            onClick={() => setSearchQuery('')}
                                            style={{
                                                background: '#f5f0e8',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: '#64648b',
                                                marginLeft: '0.5rem'
                                            }}
                                        >
                                            <X size={12} strokeWidth={3} />
                                        </m.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto xl:justify-end">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64648b', fontWeight: 500 }}>Sort By:</span>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{
                                            appearance: 'none',
                                            background: '#fff',
                                            border: '1px solid #e2e8f0',
                                            padding: '0.5rem 2.5rem 0.5rem 1rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.85rem',
                                            color: '#0a0a23',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            outline: 'none',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                    >
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Best Rating</option>
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#9e9eb8' }}>
                                    {sortedProducts.length} products
                                </span>
                                <div className="hidden lg:flex items-center gap-1 bg-white p-1 rounded-xl border border-[#e2e8f0]">
                                    <button
                                        onClick={() => setGridCols(2)}
                                        style={{
                                            padding: '0.4rem',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: gridCols === 2 ? '#f5f0e8' : 'transparent',
                                            color: gridCols === 2 ? '#0a0a23' : '#9e9eb8',
                                        }}
                                    >
                                        <LayoutGrid size={16} />
                                    </button>
                                    <button
                                        onClick={() => setGridCols(3)}
                                        style={{
                                            padding: '0.4rem',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: gridCols === 3 ? '#f5f0e8' : 'transparent',
                                            color: gridCols === 3 ? '#0a0a23' : '#9e9eb8',
                                        }}
                                    >
                                        <Grid3X3 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div
                        className={`grid ${gridCols === 3
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1 sm:grid-cols-2'
                            }`}
                        style={{ gap: '1.5rem' }}
                    >
                        {sortedProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>

                    {sortedProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                            <p style={{ color: '#0a0a23', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No products found</p>
                            <p style={{ color: '#9e9eb8', fontSize: '1rem' }}>
                                {searchQuery
                                    ? `We couldn't find anything matching "${searchQuery}".`
                                    : "No products found in this category."}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

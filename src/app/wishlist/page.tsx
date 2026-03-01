'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useUserAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface WishlistItem {
    id: string;
    created_at: string;
    product: {
        id: string;
        title: string;
        slug: string;
        base_price: number;
        category: string;
        images: { image_url: string }[];
    };
}

export default function WishlistPage() {
    const { isAuthenticated } = useUserAuthStore();
    const { addItem } = useCartStore();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (wishlistId: string, productId: string) => {
        setRemovingId(wishlistId);
        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId }),
            });
            if (!res.ok) throw new Error('Failed to remove');

            setItems((prev) => prev.filter((item) => item.id !== wishlistId));
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error(error);
            toast.error('Error removing item');
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = (item: WishlistItem) => {
        const product = {
            id: item.product.id,
            title: item.product.title,
            slug: item.product.slug,
            description: null,
            base_price: item.product.base_price,
            category: item.product.category,
            has_variants: false,
            is_active: true,
            created_at: '',
        };
        const image = item.product.images?.[0]?.image_url || '';
        addItem(product, null, image);
        toast.success('Added to cart!');
    };

    // Not logged in state
    if (!isAuthenticated) {
        return (
            <div style={{ paddingTop: 'var(--nav-height, 80px)' }}>
                <div style={{
                    minHeight: '60vh', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center',
                }}>
                    <Heart size={48} style={{ color: '#e5e7eb', marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.75rem' }}>
                        Sign in to view your wishlist
                    </h2>
                    <p style={{ color: '#64648b', marginBottom: '2rem', maxWidth: '400px' }}>
                        Save your favorite items and come back to them anytime.
                    </p>
                    <Link
                        href="/login"
                        style={{
                            padding: '0.75rem 2rem', background: '#0a0a23', color: '#fff',
                            borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

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
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: '#00b4d8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}
                    >
                        Your Favorites
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff', marginTop: '0.75rem', marginBottom: '1rem' }}
                    >
                        Wishlist
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}
                    >
                        Items you&apos;ve saved for later. Add them to your cart when you&apos;re ready.
                    </motion.p>
                </div>
            </section>

            {/* Content */}
            <section style={{ padding: '3rem 0 4rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Loading */}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                            <Loader2 size={32} className="animate-spin" style={{ color: '#00b4d8' }} />
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && items.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                textAlign: 'center', padding: '5rem 2rem',
                                background: '#fdfbf7', borderRadius: '1.5rem',
                                border: '1px solid #f0ece4',
                            }}
                        >
                            <Heart size={48} style={{ color: '#e5e7eb', margin: '0 auto 1.5rem' }} />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.75rem' }}>
                                Your wishlist is empty
                            </h2>
                            <p style={{ color: '#64648b', marginBottom: '2rem' }}>
                                Browse our collection and save items you love!
                            </p>
                            <Link
                                href="/shop"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem 2rem', background: '#0a0a23', color: '#fff',
                                    borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <ShoppingBag size={18} />
                                Browse Shop
                            </Link>
                        </motion.div>
                    )}

                    {/* Items Grid */}
                    {!loading && items.length > 0 && (
                        <>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ color: '#64648b', fontSize: '0.9rem' }}>
                                    {items.length} {items.length === 1 ? 'item' : 'items'} saved
                                </p>
                                <Link
                                    href="/shop"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        color: '#00b4d8', fontSize: '0.875rem', fontWeight: 600,
                                        textDecoration: 'none',
                                    }}
                                >
                                    <ArrowLeft size={16} />
                                    Continue Shopping
                                </Link>
                            </div>

                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                style={{ gap: '1.5rem' }}
                            >
                                <AnimatePresence mode="popLayout">
                                    {items.map((item, index) => {
                                        const product = item.product;
                                        if (!product) return null;
                                        const image = product.images?.[0]?.image_url || '';

                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: index * 0.05 }}
                                                style={{
                                                    background: '#fff', borderRadius: '1rem',
                                                    border: '1px solid #f0ece4', overflow: 'hidden',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                {/* Image */}
                                                <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                                                    <div style={{
                                                        position: 'relative', paddingTop: '100%',
                                                        background: '#f5f0e8', overflow: 'hidden',
                                                    }}>
                                                        {image ? (
                                                            <Image
                                                                src={image}
                                                                alt={product.title}
                                                                fill
                                                                style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                position: 'absolute', inset: 0,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}>
                                                                <ShoppingBag size={32} style={{ color: '#cbd5e1' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>

                                                {/* Info */}
                                                <div style={{ padding: '1rem' }}>
                                                    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                                                        <h3 style={{
                                                            fontSize: '0.95rem', fontWeight: 600, color: '#0a0a23',
                                                            marginBottom: '0.25rem', lineHeight: 1.4,
                                                        }}>
                                                            {product.title}
                                                        </h3>
                                                    </Link>
                                                    <p style={{ fontSize: '0.8rem', color: '#64648b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {product.category}
                                                    </p>
                                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1rem' }}>
                                                        {formatCurrency(product.base_price)}
                                                    </p>

                                                    {/* Actions */}
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleAddToCart(item)}
                                                            style={{
                                                                flex: 1, padding: '0.625rem', background: '#0a0a23',
                                                                color: '#fff', border: 'none', borderRadius: '0.625rem',
                                                                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                                                                transition: 'all 0.2s',
                                                            }}
                                                        >
                                                            <ShoppingBag size={14} />
                                                            Add to Cart
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemove(item.id, product.id)}
                                                            disabled={removingId === item.id}
                                                            style={{
                                                                padding: '0.625rem', background: '#fef2f2',
                                                                color: '#ef4444', border: '1px solid #fecaca',
                                                                borderRadius: '0.625rem', cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                opacity: removingId === item.id ? 0.5 : 1,
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

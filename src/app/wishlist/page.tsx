'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useUserAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export default function WishlistPage() {
    const { isAuthenticated } = useUserAuthStore();
    const addItem = useCartStore((s) => s.addItem);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchWishlist = async () => {
            try {
                // Fetch wishlist product IDs
                const wishRes = await fetch('/api/wishlist');
                const wishData = await wishRes.json();
                const productIds: string[] = wishData.items || [];

                if (productIds.length === 0) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                // Fetch all products and filter
                const prodRes = await fetch('/api/products');
                const allProducts = await prodRes.json();

                if (Array.isArray(allProducts)) {
                    const wishlistProducts = allProducts.filter((p: Product) =>
                        productIds.includes(p.id)
                    );
                    setProducts(wishlistProducts);
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [isAuthenticated]);

    const handleRemove = async (productId: string) => {
        try {
            await fetch(`/api/wishlist?product_id=${productId}`, { method: 'DELETE' });
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast.success('Removed from wishlist');
        } catch {
            toast.error('Failed to remove');
        }
    };

    const handleAddToCart = (product: Product) => {
        const img = product.images?.[0]?.image_url || '';
        if (product.has_variants && product.variants && product.variants.length > 0) {
            // Redirect to product page for variant selection
            window.location.href = `/product/${product.slug}`;
            return;
        }
        addItem(product, null, img);
        toast.success(`${product.title} added to cart!`);
    };

    if (!isAuthenticated) {
        return (
            <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Heart size={48} style={{ margin: '0 auto 1rem', color: '#e8e4dc' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem' }}>Your Wishlist</h1>
                    <p style={{ color: '#9e9eb8', marginBottom: '1.5rem' }}>Sign in to view your saved items</p>
                    <Link href="/auth" style={{
                        display: 'inline-block', padding: '0.75rem 2rem', background: '#0a0a23',
                        color: '#fff', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none',
                    }}>
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Link href="/shop" style={{ color: '#9e9eb8', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23' }}>
                            My Wishlist
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#9e9eb8', marginTop: '0.25rem' }}>
                            {products.length} item{products.length !== 1 ? 's' : ''} saved
                        </p>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <Heart size={56} style={{ margin: '0 auto 1.5rem', color: '#e8e4dc' }} />
                        <p style={{ fontSize: '1.1rem', color: '#64648b', marginBottom: '0.5rem' }}>Your wishlist is empty</p>
                        <p style={{ fontSize: '0.875rem', color: '#9e9eb8', marginBottom: '2rem' }}>
                            Browse our collection and save your favorites!
                        </p>
                        <Link href="/shop" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                            color: '#fff', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none',
                        }}>
                            <ShoppingBag size={16} /> Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                                    padding: '1.25rem', borderRadius: '1rem', background: '#fff',
                                    border: '1px solid #f0ece4', flexWrap: 'wrap',
                                }}
                            >
                                {/* Image */}
                                <Link href={`/product/${product.slug}`} style={{ flexShrink: 0 }}>
                                    <div style={{
                                        width: '100px', height: '100px', borderRadius: '0.75rem',
                                        overflow: 'hidden', background: '#f5f0e8',
                                    }}>
                                        {product.images?.[0] ? (
                                            <Image
                                                src={product.images[0].image_url}
                                                alt={product.title}
                                                width={100}
                                                height={100}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShoppingBag size={24} style={{ color: '#9e9eb8' }} />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                                        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.25rem' }}>
                                            {product.title}
                                        </p>
                                    </Link>
                                    <p style={{ fontSize: '0.75rem', color: '#9e9eb8', marginBottom: '0.5rem' }}>
                                        {product.category}
                                    </p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0a0a23' }}>
                                        {formatCurrency(product.base_price)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                    <motion.button
                                        onClick={() => handleAddToCart(product)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                                            background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                                            color: '#fff', fontWeight: 600, fontSize: '0.8rem',
                                            border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                                        }}
                                    >
                                        <ShoppingBag size={14} />
                                        {product.has_variants ? 'View' : 'Add to Cart'}
                                    </motion.button>
                                    <motion.button
                                        onClick={() => handleRemove(product.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: '0.625rem', borderRadius: '0.75rem',
                                            background: 'rgba(239,68,68,0.06)', color: '#ef4444',
                                            border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer',
                                        }}
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 size={16} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

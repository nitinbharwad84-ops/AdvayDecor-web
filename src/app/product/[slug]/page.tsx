'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ChevronRight, Shield, Truck, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserAuthStore } from '@/lib/auth-store';
import ImageGallery from '@/components/shop/ImageGallery';
import VariantSelector from '@/components/shop/VariantSelector';
import PincodeChecker from '@/components/shop/PincodeChecker';
import StockIndicator from '@/components/shop/StockIndicator';
import ProductCard from '@/components/shop/ProductCard';
import ProductReviews from '@/components/shop/ProductReviews';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types';

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const { isAuthenticated } = useUserAuthStore();

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAllProducts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Check if product is in wishlist
    useEffect(() => {
        if (!isAuthenticated || !allProducts.length) return;
        const p = allProducts.find((p) => p.slug === slug);
        if (!p) return;
        fetch('/api/wishlist')
            .then(res => res.json())
            .then(data => {
                if (data.items && data.items.includes(p.id)) {
                    setIsWishlisted(true);
                }
            })
            .catch(() => { });
    }, [isAuthenticated, allProducts, slug]);

    const product = allProducts.find((p) => p.slug === slug) || null;

    const displayPrice = useMemo(() => {
        return selectedVariant?.price ?? product?.base_price ?? 0;
    }, [selectedVariant, product]);

    const currentImages = useMemo(() => {
        if (!product) return [];
        if (selectedVariant?.images && selectedVariant.images.length > 0) {
            return selectedVariant.images;
        }
        return product.images || [];
    }, [product, selectedVariant]);

    const stockQuantity = useMemo(() => {
        if (selectedVariant) return selectedVariant.stock_quantity;
        if (product?.variants && product.variants.length > 0) {
            return product.variants.reduce((acc, v) => acc + v.stock_quantity, 0);
        }
        return 10;
    }, [product, selectedVariant]);

    const relatedProducts = useMemo(() => {
        return allProducts.filter((p) => p.slug !== slug && p.is_active).slice(0, 3);
    }, [slug, allProducts]);

    if (loading) {
        return (
            <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1rem' }}>Product Not Found</h1>
                    <Link href="/shop" style={{ color: '#00b4d8', textDecoration: 'none' }}>
                        ← Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.has_variants && !selectedVariant) {
            toast.error('Please select a variant');
            return;
        }
        if (stockQuantity <= 0) {
            toast.error('This item is out of stock');
            return;
        }
        const img = currentImages[0]?.image_url || '';
        addItem(product, selectedVariant, img);
        toast.success(`${product.title} added to cart!`);
    };

    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)' }}>
            {/* Breadcrumb */}
            <div style={{ background: '#f5f0e8', borderBottom: '1px solid #f0ece4' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1.5rem' }}>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#9e9eb8' }}>
                        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                        <ChevronRight size={14} />
                        <Link href="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
                        <ChevronRight size={14} />
                        <span style={{ color: '#0a0a23', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</span>
                    </nav>
                </div>
            </div>

            {/* Product Section */}
            <section style={{ padding: '2rem 0 3rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '2rem' }}>
                        {/* Left: Image Gallery */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ImageGallery images={currentImages} />
                        </motion.div>

                        {/* Right: Product Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Category & Title */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: '#00b4d8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                                    {product.category}
                                </p>
                                <h1 className="font-[family-name:var(--font-display)]"
                                    style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, color: '#0a0a23', marginBottom: '0.75rem' }}>
                                    {product.title}
                                </h1>
                                <p style={{ color: '#64648b', lineHeight: 1.7, fontSize: '0.9rem' }}>
                                    {product.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23' }}>
                                    {formatCurrency(displayPrice)}
                                </span>
                                <StockIndicator quantity={stockQuantity} />
                            </div>

                            {/* Divider */}
                            <div style={{ borderTop: '1px solid #f0ece4', marginBottom: '1.5rem' }} />

                            {/* Variant Selector */}
                            {product.has_variants && product.variants && product.variants.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <VariantSelector
                                        variants={product.variants}
                                        selectedVariant={selectedVariant}
                                        onSelect={setSelectedVariant}
                                    />
                                </div>
                            )}

                            {/* Add to Cart */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <motion.button
                                    onClick={handleAddToCart}
                                    disabled={stockQuantity <= 0}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.875rem 1.5rem',
                                        background: stockQuantity <= 0 ? '#ccc' : 'linear-gradient(135deg, #00b4d8, #0096b7)',
                                        color: '#fff',
                                        borderRadius: '0.75rem',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        border: 'none',
                                        cursor: stockQuantity <= 0 ? 'not-allowed' : 'pointer',
                                        boxShadow: stockQuantity > 0 ? '0 4px 16px rgba(0,180,216,0.25)' : 'none',
                                        transition: 'all 0.3s ease',
                                    }}
                                    whileHover={stockQuantity > 0 ? { scale: 1.02 } : undefined}
                                    whileTap={stockQuantity > 0 ? { scale: 0.98 } : undefined}
                                >
                                    <ShoppingBag size={18} />
                                    {stockQuantity <= 0 ? 'Out of Stock' : 'Add to Bag'}
                                </motion.button>

                                <motion.button
                                    onClick={async () => {
                                        if (!isAuthenticated) {
                                            setIsWishlisted(!isWishlisted);
                                            toast(isWishlisted ? 'Removed from wishlist' : 'Login to save your wishlist');
                                            return;
                                        }
                                        try {
                                            if (isWishlisted) {
                                                await fetch(`/api/wishlist?product_id=${product.id}`, { method: 'DELETE' });
                                                setIsWishlisted(false);
                                                toast.success('Removed from wishlist');
                                            } else {
                                                await fetch('/api/wishlist', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ product_id: product.id }),
                                                });
                                                setIsWishlisted(true);
                                                toast.success('Added to wishlist ❤️');
                                            }
                                        } catch {
                                            toast.error('Wishlist update failed');
                                        }
                                    }}
                                    style={{
                                        padding: '0.875rem',
                                        borderRadius: '0.75rem',
                                        border: `2px solid ${isWishlisted ? '#ef4444' : '#e8e4dc'}`,
                                        background: isWishlisted ? 'rgba(239,68,68,0.05)' : '#fff',
                                        color: isWishlisted ? '#ef4444' : '#9e9eb8',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Add to wishlist"
                                >
                                    <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                                </motion.button>
                            </div>

                            {/* Pincode Checker */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <PincodeChecker />
                            </div>
                        </motion.div>
                    </div>

                    {/* Product Promises (Full Width) */}
                    <div style={{
                        marginTop: '4rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2rem',
                        padding: '3rem 2rem',
                        borderRadius: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(245,240,232,0.6) 0%, rgba(245,240,232,0.2) 100%)',
                        border: '1px solid #e8e4dc',
                    }}>
                        {[
                            { icon: Truck, label: 'Free Shipping', sub: 'Above ₹999' },
                            { icon: RotateCcw, label: 'Easy Returns', sub: '5-Day Policy' },
                            { icon: Shield, label: 'Secure Pay', sub: '100% Safe' },
                        ].map((item) => (
                            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%', background: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                                }}>
                                    <item.icon size={28} style={{ color: '#00b4d8' }} strokeWidth={1.5} />
                                </div>
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.35rem' }}>{item.label}</p>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <ProductReviews productId={product.id} />

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section style={{ padding: '3rem 0 4rem', background: '#fff' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                        <h2 className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '2rem' }}>
                            You May Also Like
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-3" style={{ gap: '1rem' }}>
                            {relatedProducts.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

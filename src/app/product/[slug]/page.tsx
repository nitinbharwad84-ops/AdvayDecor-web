'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, ChevronRight, Shield, Truck, RotateCcw, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageGallery from '@/components/shop/ImageGallery';
import VariantSelector from '@/components/shop/VariantSelector';
import PincodeChecker from '@/components/shop/PincodeChecker';
import StockIndicator from '@/components/shop/StockIndicator';
import ProductCard from '@/components/shop/ProductCard';
import { useCartStore } from '@/lib/store';
import { useUserAuthStore } from '@/lib/auth-store';
import { formatCurrency } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types';

interface Review {
    id: string;
    rating: number;
    review_text: string;
    reviewer_name: string;
    created_at: string;
}

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    // Reviews State
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [newReviewText, setNewReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

    const product = allProducts.find((p) => p.slug === slug) || null;

    // Check wishlist status on load once product is found
    useEffect(() => {
        if (!product || !isAuthenticated) return;
        fetch(`/api/wishlist/check?productId=${product.id}`)
            .then(res => res.json())
            .then(data => setIsWishlisted(data.isWishlisted))
            .catch(err => console.error('Failed to check wishlist status', err));
    }, [product, isAuthenticated]);

    // Fetch Reviews
    useEffect(() => {
        if (!product) return;
        fetch(`/api/reviews?productId=${product.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.reviews) {
                    setReviews(data.reviews);
                    setAvgRating(data.average);
                    setTotalReviews(data.total);
                }
            })
            .catch(err => console.error('Failed to fetch reviews', err));
    }, [product]);

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

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to add items to your wishlist.');
            return;
        }

        setIsWishlistLoading(true);
        // Optimistically trigger UI change
        setIsWishlisted(!isWishlisted);

        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: product.id })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            if (data.action === 'added') {
                toast.success('Added to wishlist');
            } else {
                toast.success('Removed from wishlist');
            }
        } catch (err) {
            console.error('Wishlist error', err);
            // Revert optimistic update
            setIsWishlisted(isWishlisted);
            toast.error('Failed to update wishlist');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please log in to submit a review');
            return;
        }
        if (newRating === 0) {
            toast.error('Please select a star rating');
            return;
        }

        setIsSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product?.id,
                    rating: newRating,
                    review_text: newReviewText,
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            toast.success('Review submitted successfully!');
            // Prepend new review
            setReviews(prev => [data, ...prev]);
            // Update stats approximately or ideally re-fetch
            const newTotal = totalReviews + 1;
            setTotalReviews(newTotal);
            setAvgRating(((avgRating * totalReviews) + newRating) / newTotal);

            // Reset
            setIsReviewOpen(false);
            setNewRating(0);
            setNewReviewText('');

        } catch (err: any) {
            toast.error(err.message || 'Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
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
                            {/* Category, Title & Reviews Summary */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: '#00b4d8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                                    {product.category}
                                </p>
                                <h1 className="font-[family-name:var(--font-display)]"
                                    style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, color: '#0a0a23', marginBottom: '0.75rem' }}>
                                    {product.title}
                                </h1>

                                {totalReviews > 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.125rem' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={16} fill={star <= Math.round(avgRating) ? '#fbbf24' : '#e2e8f0'} color={star <= Math.round(avgRating) ? '#fbbf24' : '#e2e8f0'} />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                                            {avgRating.toFixed(1)} <span style={{ color: '#cbd5e1' }}>|</span> {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.125rem' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={16} fill="#e2e8f0" color="#e2e8f0" />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>No reviews yet</span>
                                    </div>
                                )}

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
                                    onClick={handleToggleWishlist}
                                    disabled={isWishlistLoading}
                                    style={{
                                        padding: '0.875rem',
                                        borderRadius: '0.75rem',
                                        border: `2px solid ${isWishlisted ? '#ef4444' : '#e8e4dc'}`,
                                        background: isWishlisted ? 'rgba(239,68,68,0.05)' : '#fff',
                                        color: isWishlisted ? '#ef4444' : '#9e9eb8',
                                        cursor: isWishlistLoading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Toggle wishlist"
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
            <section style={{ padding: '4rem 0', background: '#fdfbf7', borderTop: '1px solid #f0ece4' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                        <div>
                            <h2 className="font-[family-name:var(--font-display)]" style={{ fontSize: '2rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem' }}>
                                Customer Reviews
                            </h2>
                            {totalReviews > 0 && (
                                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Overall rating: <strong style={{ color: '#0a0a23' }}>{avgRating.toFixed(1)}/5</strong> ({totalReviews} total)</p>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                if (!isAuthenticated) {
                                    toast.error('Please log in to write a review');
                                    return;
                                }
                                setIsReviewOpen(!isReviewOpen);
                            }}
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: '#0a0a23',
                                color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <MessageSquare size={18} />
                            {isReviewOpen ? 'Cancel Review' : 'Write a Review'}
                        </button>
                    </div>

                    {/* Write Review Form */}
                    <AnimatePresence>
                        {isReviewOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden', marginBottom: '3rem' }}
                            >
                                <div style={{ padding: '2rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0a0a23', marginBottom: '1.5rem' }}>Write your review</h3>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Rate this product *</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewRating(star)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                    >
                                                        <Star size={28} fill={star <= newRating ? '#fbbf24' : 'none'} color={star <= newRating ? '#fbbf24' : '#cbd5e1'} style={{ transition: 'all 0.2s' }} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Your Review (Optional)</label>
                                            <textarea
                                                value={newReviewText}
                                                onChange={(e) => setNewReviewText(e.target.value)}
                                                rows={4}
                                                placeholder="Tell us what you thought about this product..."
                                                style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', resize: 'vertical' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingReview || newRating === 0}
                                                style={{
                                                    padding: '0.75rem 2rem', borderRadius: '0.75rem', background: '#00b4d8',
                                                    color: '#fff', border: 'none', fontWeight: 600, cursor: newRating === 0 ? 'not-allowed' : 'pointer',
                                                    opacity: newRating === 0 ? 0.5 : 1
                                                }}
                                            >
                                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Review List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {reviews.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                                <MessageSquare size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>No reviews yet</h3>
                                <p style={{ color: '#94a3b8' }}>Be the first to review this product!</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} style={{ padding: '1.5rem', background: '#fff', borderRadius: '1rem', border: '1px solid #f0ece4' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#0a0a23', fontSize: '1rem' }}>{review.reviewer_name}</p>
                                            <div style={{ display: 'flex', gap: '0.125rem', marginTop: '0.25rem' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={14} fill={star <= review.rating ? '#fbbf24' : '#e2e8f0'} color={star <= review.rating ? '#fbbf24' : '#e2e8f0'} />
                                                ))}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {review.review_text && (
                                        <p style={{ color: '#475569', lineHeight: 1.6 }}>{review.review_text}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

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

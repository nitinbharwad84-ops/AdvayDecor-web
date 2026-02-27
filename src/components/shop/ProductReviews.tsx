'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserAuthStore } from '@/lib/auth-store';

interface Review {
    id: string;
    rating: number;
    review_text: string | null;
    reviewer_name: string;
    created_at: string;
}

interface ProductReviewsProps {
    productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const { isAuthenticated } = useUserAuthStore();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?product_id=${productId}`);
            const data = await res.json();
            if (data.reviews) {
                setReviews(data.reviews);
                setAvgRating(data.averageRating);
                setTotalReviews(data.totalReviews);
            }
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    rating,
                    review_text: reviewText,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message || 'Review submitted!');
                setShowForm(false);
                setRating(0);
                setReviewText('');
                fetchReviews();
            } else {
                toast.error(data.error || 'Failed to submit review');
            }
        } catch {
            toast.error('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (count: number, size = 16) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        size={size}
                        fill={i <= count ? '#f59e0b' : 'none'}
                        stroke={i <= count ? '#f59e0b' : '#d4d0c8'}
                        strokeWidth={1.5}
                    />
                ))}
            </div>
        );
    };

    return (
        <section style={{ padding: '3rem 0', borderTop: '1px solid #f0ece4' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem',
                }}>
                    <div>
                        <h2 className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem' }}>
                            Customer Reviews
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {renderStars(Math.round(avgRating), 20)}
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a23' }}>
                                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#9e9eb8' }}>
                                ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                            </span>
                        </div>
                    </div>

                    {isAuthenticated && !showForm && (
                        <motion.button
                            onClick={() => setShowForm(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                                background: '#0a0a23', color: '#fff', fontWeight: 600,
                                fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}
                        >
                            <Star size={14} /> Write a Review
                        </motion.button>
                    )}
                </div>

                {/* Review Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                overflow: 'hidden', marginBottom: '2rem',
                                background: '#fdfbf7', borderRadius: '1rem', border: '1px solid #f0ece4',
                                padding: '1.5rem',
                            }}
                        >
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '1rem' }}>
                                Your Rating
                            </h3>

                            {/* Star selector */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                        key={i}
                                        size={32}
                                        fill={i <= (hoverRating || rating) ? '#f59e0b' : 'none'}
                                        stroke={i <= (hoverRating || rating) ? '#f59e0b' : '#d4d0c8'}
                                        strokeWidth={1.5}
                                        onMouseEnter={() => setHoverRating(i)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(i)}
                                        style={{ transition: 'all 0.15s ease' }}
                                    />
                                ))}
                                {rating > 0 && (
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#64648b', alignSelf: 'center' }}>
                                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                                    </span>
                                )}
                            </div>

                            {/* Review text */}
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience with this product... (optional)"
                                rows={3}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                    border: '1px solid #e8e4dc', background: '#fff', fontSize: '0.875rem',
                                    outline: 'none', resize: 'vertical', color: '#0a0a23',
                                    fontFamily: 'inherit',
                                }}
                            />

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                <motion.button
                                    onClick={handleSubmit}
                                    disabled={submitting || rating === 0}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '0.625rem 1.5rem', borderRadius: '0.75rem',
                                        background: rating === 0 ? '#ccc' : 'linear-gradient(135deg, #00b4d8, #0096b7)',
                                        color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                                        border: 'none', cursor: rating === 0 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        opacity: submitting ? 0.6 : 1,
                                    }}
                                >
                                    <Send size={14} />
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </motion.button>
                                <button
                                    onClick={() => { setShowForm(false); setRating(0); setReviewText(''); }}
                                    style={{
                                        padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                                        background: 'transparent', color: '#64648b', fontWeight: 500,
                                        fontSize: '0.85rem', border: '1px solid #e8e4dc', cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reviews List */}
                {reviews.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '1.25rem', borderRadius: '1rem',
                                    background: '#fff', border: '1px solid #f0ece4',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <User size={16} style={{ color: '#fff' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23' }}>
                                            {review.reviewer_name}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {renderStars(review.rating, 14)}
                                            <span style={{ fontSize: '0.7rem', color: '#9e9eb8' }}>
                                                {new Date(review.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {review.review_text && (
                                    <p style={{ fontSize: '0.875rem', color: '#64648b', lineHeight: 1.6, marginLeft: '2.75rem' }}>
                                        {review.review_text}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9e9eb8' }}>
                        <Star size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p style={{ fontSize: '0.95rem' }}>No reviews yet. Be the first to review this product!</p>
                    </div>
                )}
            </div>
        </section>
    );
}

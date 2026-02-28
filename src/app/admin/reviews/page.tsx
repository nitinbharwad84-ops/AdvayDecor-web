'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight, MessageSquare, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    review_text: string | null;
    reviewer_name: string;
    is_approved: boolean;
    created_at: string;
    products?: { title: string; slug: string };
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch reviews');
            setReviews(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_approved: true }),
            });
            if (!res.ok) throw new Error('Failed to approve review');
            toast.success('Review approved');
            setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: true } : r));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_approved: false }),
            });
            if (!res.ok) throw new Error('Failed to reject review');
            toast.success('Review hidden from public');
            setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: false } : r));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this review permanently?')) return;
        try {
            const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete review');
            toast.success('Review deleted');
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Filtering
    const filteredReviews = reviews
        .filter(r => {
            if (filter === 'approved') return r.is_approved;
            if (filter === 'rejected') return !r.is_approved;
            // "pending" concept: reviews that are not approved yet (same as rejected for now)
            if (filter === 'pending') return !r.is_approved;
            return true;
        })
        .filter(r =>
            r.reviewer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.review_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.products?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    const paginatedReviews = filteredReviews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const approvedCount = reviews.filter(r => r.is_approved).length;
    const pendingCount = reviews.filter(r => !r.is_approved).length;

    const renderStars = (rating: number) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} style={{ color: s <= rating ? '#f59e0b' : '#e2e8f0', fill: s <= rating ? '#f59e0b' : 'none' }} />
                ))}
            </div>
        );
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageSquare size={28} style={{ color: '#00b4d8' }} />
                        Reviews Moderation
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Approve, reject, or delete customer product reviews</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginBottom: '0.25rem' }}>Total Reviews</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23' }}>{reviews.length}</p>
                </div>
                <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '1rem', border: '1px solid #dcfce7' }}>
                    <p style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 500, marginBottom: '0.25rem' }}>Approved</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a' }}>{approvedCount}</p>
                </div>
                <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '1rem', border: '1px solid #fef3c7' }}>
                    <p style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 500, marginBottom: '0.25rem' }}>Pending / Rejected</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#d97706' }}>{pendingCount}</p>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['all', 'approved', 'pending'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setCurrentPage(1); }}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '0.5rem',
                                    border: filter === f ? '1px solid #00b4d8' : '1px solid #e2e8f0',
                                    background: filter === f ? 'rgba(0,180,216,0.08)' : '#fff',
                                    color: filter === f ? '#00b4d8' : '#64748b',
                                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '0' }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#00b4d8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : paginatedReviews.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            No reviews found.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {paginatedReviews.map((review) => (
                                <div key={review.id} style={{
                                    padding: '1.5rem', borderBottom: '1px solid #f1f5f9',
                                    display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap',
                                }}>
                                    <div style={{ flex: 1, minWidth: '280px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 600, color: '#0a0a23', fontSize: '0.95rem' }}>
                                                {review.reviewer_name}
                                            </span>
                                            {renderStars(review.rating)}
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '0.5rem',
                                                background: review.is_approved ? '#dcfce7' : '#fef3c7',
                                                color: review.is_approved ? '#16a34a' : '#d97706',
                                            }}>
                                                {review.is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </div>

                                        <p style={{ fontSize: '0.85rem', color: '#00b4d8', fontWeight: 500, marginBottom: '0.375rem' }}>
                                            {review.products?.title || 'Unknown Product'}
                                        </p>

                                        {review.review_text && (
                                            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                                                &ldquo;{review.review_text}&rdquo;
                                            </p>
                                        )}

                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {!review.is_approved && (
                                            <button
                                                onClick={() => handleApprove(review.id)}
                                                title="Approve"
                                                style={{
                                                    padding: '0.5rem', borderRadius: '0.5rem',
                                                    background: '#dcfce7', color: '#16a34a',
                                                    border: 'none', cursor: 'pointer', display: 'flex',
                                                }}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}
                                        {review.is_approved && (
                                            <button
                                                onClick={() => handleReject(review.id)}
                                                title="Hide / Reject"
                                                style={{
                                                    padding: '0.5rem', borderRadius: '0.5rem',
                                                    background: '#fef3c7', color: '#d97706',
                                                    border: 'none', cursor: 'pointer', display: 'flex',
                                                }}
                                            >
                                                <EyeOff size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            title="Delete permanently"
                                            style={{
                                                padding: '0.5rem', borderRadius: '0.5rem',
                                                background: '#fee2e2', color: '#ef4444',
                                                border: 'none', cursor: 'pointer', display: 'flex',
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReviews.length)} of {filteredReviews.length}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', color: currentPage === 1 ? '#cbd5e1' : '#0a0a23', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', color: currentPage === totalPages ? '#cbd5e1' : '#0a0a23', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

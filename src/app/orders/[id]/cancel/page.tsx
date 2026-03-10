'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, FileText, CheckCircle, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserAuthStore } from '@/lib/auth-store';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function CancelOrderPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    const { isAuthenticated } = useUserAuthStore();

    const [order, setOrder] = useState<Order | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(`/orders/${orderId}/cancel`)}`);
        }
    }, [isAuthenticated, orderId, router]);

    // Fetch order details
    useEffect(() => {
        if (!isAuthenticated) return;

        fetch(`/api/orders/${orderId}`)
            .then(res => {
                if (!res.ok) throw new Error('Order not found');
                return res.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);
                // Guard: If order can't be cancelled, redirect back
                if (!['Awaiting Payment', 'Pending', 'Processing'].includes(data.status)) {
                    toast.error('This order cannot be cancelled');
                    router.push(`/orders/${orderId}`);
                    return;
                }
                setOrder(data);
            })
            .catch(err => {
                toast.error(err.message);
                router.push('/profile');
            })
            .finally(() => setPageLoading(false));
    }, [orderId, isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit cancellation');
            setSuccess(true);
            toast.success('Cancellation request submitted!');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) {
        return (
            <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-height, 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfbf7' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-height, 80px)', background: '#fdfbf7', paddingBottom: '4rem' }}>
            <div style={{ maxWidth: '880px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Back link */}
                <Link href={`/orders/${orderId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64648b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Back to Order Details
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-5" style={{ gap: '1.5rem' }}>

                    {/* Form — takes 3 cols */}
                    <motion.div
                        className="md:col-span-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: '#fff', borderRadius: '1.25rem', padding: 'clamp(1.5rem, 4vw, 2.5rem)', border: '1px solid #f0ece4', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                    >
                        {success ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <CheckCircle size={32} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.75rem' }}>Cancellation Requested</h2>
                                <p style={{ color: '#64648b', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '380px', margin: '0 auto 2rem' }}>
                                    Your request has been submitted. Our team will review it and update you shortly.
                                </p>
                                <Link href={`/orders/${orderId}`} style={{ display: 'inline-block', padding: '0.875rem 2rem', background: '#0a0a23', color: '#fff', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 600 }}>
                                    View Order Details
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '1.75rem' }}>
                                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <FileText size={22} style={{ color: '#ef4444' }} />
                                        Cancel Order
                                    </h1>
                                    <p style={{ color: '#64648b', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                        Tell us why you'd like to cancel. Your request will be reviewed by our team before processing.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label htmlFor="cancel-reason" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>
                                            Reason for Cancellation <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <textarea
                                            id="cancel-reason"
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            placeholder="e.g. Ordered by mistake, found a better price, no longer needed..."
                                            rows={4}
                                            style={{
                                                width: '100%', padding: '1rem', borderRadius: '0.75rem',
                                                border: '1px solid #d4d0c8', background: '#fcfbfa',
                                                fontSize: '0.95rem', color: '#0a0a23', resize: 'vertical',
                                                outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
                                            }}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || !reason.trim()}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            padding: '1rem', background: '#ef4444', color: '#fff', border: 'none',
                                            borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                                            opacity: submitting || !reason.trim() ? 0.65 : 1,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Submit Cancellation Request'}
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>

                    {/* Order Summary — takes 2 cols */}
                    <motion.div
                        className="md:col-span-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #f0ece4', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'sticky', top: 'calc(var(--nav-height, 80px) + 1rem)' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShoppingBag size={18} style={{ color: '#00b4d8' }} /> Order Summary
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                {order.items?.map((item) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f5f0e8' }}>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_title}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Qty: {item.quantity}{item.variant_name ? ` · ${item.variant_name}` : ''}</p>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0a0a23', whiteSpace: 'nowrap' }}>{formatCurrency(item.total_price)}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #f0ece4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0a23' }}>Total</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00b4d8' }}>{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

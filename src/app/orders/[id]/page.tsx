'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Package, MapPin, CreditCard, Clock, User, Mail, Phone,
    Hash, Truck, CheckCircle, AlertCircle, RotateCcw, Loader2, ShoppingBag, Tag,
    XCircle, X, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useUserAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';

interface OrderItem {
    id: string;
    product_id: string;
    variant_id: string | null;
    product_title: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface ShippingAddress {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    email?: string;
}

interface OrderDetail {
    id: string;
    user_id: string;
    guest_info: { name: string; email: string; phone: string } | null;
    status: string;
    total_amount: number;
    shipping_fee: number;
    shipping_address: ShippingAddress;
    payment_method: string;
    payment_id: string | null;
    coupon_code: string | null;
    discount_amount: number;
    razorpay_order_id?: string | null;
    shiprocket_order_id?: string | null;
    shipment_id?: string | null;
    awb_code?: string | null;
    courier_name?: string | null;
    estimated_delivery?: string | null;
    created_at: string;
    items: OrderItem[];
    profile: { full_name: string | null; email: string; phone: string | null } | null;
}

interface TimelineStep {
    key: string;
    label: string;
    completed: boolean;
    active: boolean;
    date?: string;
    location?: string;
}

interface TrackingData {
    available: boolean;
    current_status?: string;
    etd?: string;
    track_url?: string;
    timeline?: TimelineStep[];
    activities?: {
        date: string;
        status: string;
        activity: string;
        location: string;
    }[];
    message?: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    'Awaiting Payment': { color: '#d97706', bg: '#fef3c7', icon: <Clock size={16} /> },
    'Pending': { color: '#0369a1', bg: '#e0f2fe', icon: <Clock size={16} /> },
    'Processing': { color: '#7c3aed', bg: '#ede9fe', icon: <Loader2 size={16} /> },
    'Shipped': { color: '#0891b2', bg: '#cffafe', icon: <Truck size={16} /> },
    'Delivered': { color: '#166534', bg: '#dcfce7', icon: <CheckCircle size={16} /> },
    'Cancelled': { color: '#b91c1c', bg: '#fee2e2', icon: <AlertCircle size={16} /> },
    'Returned': { color: '#9f1239', bg: '#ffe4e6', icon: <RotateCcw size={16} /> },
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    const { isAuthenticated } = useUserAuthStore();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);
    const [showAllActivities, setShowAllActivities] = useState(false);

    // Cancel/Return modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [actionReason, setActionReason] = useState('');
    const [refundMethod, setRefundMethod] = useState('original');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }

        fetch(`/api/orders/${orderId}`)
            .then(res => {
                if (!res.ok) throw new Error('Order not found');
                return res.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);
                setOrder(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [orderId, isAuthenticated, router]);

    // Fetch tracking data
    useEffect(() => {
        if (!order) return;
        if (!order.awb_code && !order.shipment_id) return;

        setIsTrackingLoading(true);
        const params = order.awb_code
            ? `awb=${order.awb_code}&order_id=${order.id}`
            : `order_id=${order.id}`;

        fetch(`/api/shipping/track?${params}`)
            .then(res => res.json())
            .then(data => setTracking(data))
            .catch(() => setTracking({ available: false, message: 'Unable to load tracking' }))
            .finally(() => setIsTrackingLoading(false));
    }, [order]);

    const handleCancel = async () => {
        if (!actionReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    reason: actionReason,
                    refund_method: refundMethod,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message || 'Order cancelled successfully');
                setShowCancelModal(false);
                setOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
            } else {
                toast.error(data.error || 'Failed to cancel order');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReturn = async () => {
        if (!actionReason.trim()) {
            toast.error('Please provide a reason for return');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    reason: actionReason,
                    refund_method: refundMethod,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message || 'Return request submitted');
                setShowReturnModal(false);
            } else {
                toast.error(data.error || 'Failed to submit return request');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', paddingTop: 'var(--nav-height, 80px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfbf7',
            }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div style={{
                minHeight: '100vh', paddingTop: 'var(--nav-height, 80px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fdfbf7', flexDirection: 'column', gap: '1rem'
            }}>
                <AlertCircle size={48} style={{ color: '#ef4444' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23' }}>Order Not Found</h2>
                <p style={{ color: '#64648b', marginBottom: '1rem' }}>{error || 'This order does not exist or you do not have access to it.'}</p>
                <Link href="/profile" style={{ padding: '0.75rem 1.5rem', background: '#0a0a23', color: '#fff', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 600 }}>
                    Back to Profile
                </Link>
            </div>
        );
    }

    const statusStyle = statusConfig[order.status] || statusConfig['Pending'];
    const customerName = order.profile?.full_name || order.guest_info?.name || order.shipping_address.full_name || 'Customer';
    const customerEmail = order.profile?.email || order.guest_info?.email || order.shipping_address.email || '—';
    const customerPhone = order.profile?.phone || order.guest_info?.phone || order.shipping_address.phone || '—';
    const subtotal = order.items.reduce((sum, item) => sum + item.total_price, 0);

    // Can this order be cancelled?
    const canCancel = !['Delivered', 'Cancelled', 'Returned'].includes(order.status);
    // Can this order be returned?
    const canReturn = order.status === 'Delivered';

    const sectionStyle: React.CSSProperties = {
        background: '#fff', borderRadius: '1.25rem', padding: 'clamp(1.25rem, 3vw, 2rem)',
        border: '1px solid #f0ece4', marginBottom: '1.5rem',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem',
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '0.95rem', color: '#0a0a23', fontWeight: 600,
    };

    const formatTrackingDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        } catch { return dateStr; }
    };

    return (
        <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-height, 80px)', background: '#fdfbf7', paddingBottom: '4rem' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Back Button + Order ID Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}
                >
                    <Link href="/profile" onClick={(e) => { e.preventDefault(); router.back(); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64648b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1rem' }}
                    >
                        <ArrowLeft size={16} /> Back to Orders
                    </Link>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 className="font-[family-name:var(--font-display)]"
                                style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#0a0a23', marginBottom: '0.25rem' }}>
                                Order #{order.id.slice(0, 8).toUpperCase()}
                            </h1>
                            <p style={{ color: '#64648b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} /> Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', borderRadius: '2rem',
                            background: statusStyle.bg, color: statusStyle.color,
                            fontSize: '0.85rem', fontWeight: 700,
                        }}>
                            {statusStyle.icon}
                            {order.status}
                        </div>
                    </div>
                </motion.div>

                {/* ===== TRACKING TIMELINE ===== */}
                {(order.awb_code || order.shipment_id || tracking) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        style={sectionStyle}
                    >
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Truck size={18} style={{ color: '#00b4d8' }} /> Order Tracking
                        </h2>

                        {isTrackingLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                <Loader2 size={16} className="animate-spin" /> Loading tracking information...
                            </div>
                        ) : tracking?.available && tracking.timeline ? (
                            <div>
                                {/* Timeline Steps */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
                                    {/* Progress Bar background */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        left: '16px',
                                        right: '16px',
                                        height: '3px',
                                        background: '#e8e4dc',
                                        borderRadius: '2px',
                                        zIndex: 0,
                                    }} />
                                    {/* Progress Bar filled */}
                                    {(() => {
                                        const lastCompleted = tracking.timeline.reduce((max, step, idx) => step.completed ? idx : max, 0);
                                        const pct = (lastCompleted / (tracking.timeline.length - 1)) * 100;
                                        return (
                                            <div style={{
                                                position: 'absolute',
                                                top: '16px',
                                                left: '16px',
                                                width: `calc(${pct}% - 32px * ${pct / 100})`,
                                                height: '3px',
                                                background: 'linear-gradient(90deg, #00b4d8, #0096b7)',
                                                borderRadius: '2px',
                                                zIndex: 1,
                                                transition: 'width 0.5s ease',
                                            }} />
                                        );
                                    })()}

                                    {tracking.timeline.map((step, idx) => (
                                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: step.completed
                                                    ? step.active
                                                        ? 'linear-gradient(135deg, #00b4d8, #0096b7)'
                                                        : '#00b4d8'
                                                    : '#fff',
                                                border: step.completed ? 'none' : '2px solid #e8e4dc',
                                                color: step.completed ? '#fff' : '#94a3b8',
                                                transition: 'all 0.3s',
                                                boxShadow: step.active ? '0 0 0 4px rgba(0,180,216,0.2)' : 'none',
                                            }}>
                                                {step.completed ? <CheckCircle size={16} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e8e4dc' }} />}
                                            </div>
                                            <p style={{
                                                fontSize: '0.7rem', fontWeight: step.active ? 700 : 500,
                                                color: step.completed ? '#0a0a23' : '#94a3b8',
                                                marginTop: '0.5rem', textAlign: 'center',
                                                lineHeight: 1.3,
                                            }}>
                                                {step.label}
                                            </p>
                                            {step.date && (
                                                <p style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.125rem', textAlign: 'center' }}>
                                                    {formatTrackingDate(step.date)}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* ETA */}
                                {tracking.etd && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1rem', background: 'rgba(0,180,216,0.05)',
                                        borderRadius: '0.75rem', fontSize: '0.85rem', color: '#0369a1',
                                        marginBottom: '1rem',
                                    }}>
                                        <Clock size={14} />
                                        <span>Estimated delivery: <strong>{tracking.etd}</strong></span>
                                        {order.courier_name && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>via {order.courier_name}</span>}
                                    </div>
                                )}

                                {/* Track URL */}
                                {tracking.track_url && (
                                    <a
                                        href={tracking.track_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                            fontSize: '0.8rem', color: '#00b4d8', fontWeight: 600,
                                            textDecoration: 'none', marginBottom: '1rem',
                                        }}
                                    >
                                        <ExternalLink size={14} /> Track on courier website
                                    </a>
                                )}

                                {/* Detailed Activities */}
                                {tracking.activities && tracking.activities.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() => setShowAllActivities(!showAllActivities)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                fontSize: '0.8rem', color: '#64648b', fontWeight: 600,
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                padding: '0.5rem 0',
                                            }}
                                        >
                                            {showAllActivities ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            {showAllActivities ? 'Hide' : 'Show'} detailed tracking ({tracking.activities.length} updates)
                                        </button>

                                        <AnimatePresence>
                                            {showAllActivities && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div style={{
                                                        borderLeft: '2px solid #e8e4dc', marginLeft: '0.5rem',
                                                        paddingLeft: '1rem', marginTop: '0.5rem',
                                                    }}>
                                                        {tracking.activities.map((act, idx) => (
                                                            <div key={idx} style={{
                                                                position: 'relative', paddingBottom: '1rem',
                                                                fontSize: '0.8rem',
                                                            }}>
                                                                <div style={{
                                                                    position: 'absolute', left: '-1.375rem', top: '0.25rem',
                                                                    width: '8px', height: '8px', borderRadius: '50%',
                                                                    background: idx === 0 ? '#00b4d8' : '#e8e4dc',
                                                                }} />
                                                                <p style={{ fontWeight: 600, color: '#0a0a23' }}>{act.status}</p>
                                                                <p style={{ color: '#64648b', fontSize: '0.75rem' }}>{act.activity}</p>
                                                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.125rem' }}>
                                                                    {act.location && `${act.location} · `}{formatTrackingDate(act.date)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                {tracking?.message || 'Tracking information will be available once your order is shipped.'}
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
                    {/* Left Column (2/3) */}
                    <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column' }}>

                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={sectionStyle}
                        >
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShoppingBag size={18} style={{ color: '#00b4d8' }} /> Items Ordered
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {order.items.map((item, index) => (
                                    <div key={item.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '1rem 0',
                                        borderTop: index > 0 ? '1px solid #f0ece4' : 'none',
                                        gap: '1rem',
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.15rem' }}>
                                                {item.product_title}
                                            </p>
                                            {item.variant_name && (
                                                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Variant: {item.variant_name}</p>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <p style={{ fontSize: '0.85rem', color: '#64648b' }}>
                                                {formatCurrency(item.unit_price)} × {item.quantity}
                                            </p>
                                            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a23' }}>
                                                {formatCurrency(item.total_price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div style={{ borderTop: '2px solid #f0ece4', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#64648b', fontSize: '0.9rem' }}>Subtotal</span>
                                    <span style={{ color: '#0a0a23', fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
                                </div>
                                {(order.discount_amount > 0) && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#16a34a', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Tag size={14} /> Discount {order.coupon_code && `(${order.coupon_code})`}
                                        </span>
                                        <span style={{ color: '#16a34a', fontWeight: 600 }}>-{formatCurrency(order.discount_amount)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: '#64648b', fontSize: '0.9rem' }}>Shipping</span>
                                    <span style={{ color: '#0a0a23', fontWeight: 600 }}>{order.shipping_fee > 0 ? formatCurrency(order.shipping_fee) : 'Free'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f0ece4' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23' }}>Total</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00b4d8' }}>{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Shipping Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={sectionStyle}
                        >
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={18} style={{ color: '#00b4d8' }} /> Shipping Address
                            </h2>
                            <div style={{ lineHeight: 1.8, fontSize: '0.95rem', color: '#334155' }}>
                                <p style={{ fontWeight: 700, color: '#0a0a23', marginBottom: '0.25rem' }}>
                                    {order.shipping_address.full_name}
                                </p>
                                <p>{order.shipping_address.address_line1}</p>
                                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                <p>{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#64648b' }}>
                                    <Phone size={14} /> {order.shipping_address.phone}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column (1/3) */}
                    <div className="lg:col-span-1" style={{ display: 'flex', flexDirection: 'column' }}>

                        {/* Customer Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            style={sectionStyle}
                        >
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} style={{ color: '#00b4d8' }} /> Customer Details
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <p style={labelStyle}>Name</p>
                                    <p style={valueStyle}>{customerName}</p>
                                </div>
                                <div>
                                    <p style={labelStyle}>Email</p>
                                    <p style={{ ...valueStyle, wordBreak: 'break-all' }}>{customerEmail}</p>
                                </div>
                                <div>
                                    <p style={labelStyle}>Phone</p>
                                    <p style={valueStyle}>{customerPhone}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            style={sectionStyle}
                        >
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CreditCard size={18} style={{ color: '#00b4d8' }} /> Payment & Shipping Details
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <p style={labelStyle}>Payment Method</p>
                                    <p style={valueStyle}>
                                        {order.payment_method === 'COD' ? '💵 Cash on Delivery' : '💳 Razorpay (Online)'}
                                    </p>
                                </div>
                                {order.payment_id && (
                                    <div>
                                        <p style={labelStyle}>Transaction ID</p>
                                        <p style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                            {order.payment_id}
                                        </p>
                                    </div>
                                )}
                                {order.awb_code && (
                                    <div>
                                        <p style={labelStyle}>AWB / Tracking Number</p>
                                        <p style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            {order.awb_code}
                                        </p>
                                    </div>
                                )}
                                {order.courier_name && (
                                    <div>
                                        <p style={labelStyle}>Courier</p>
                                        <p style={valueStyle}>{order.courier_name}</p>
                                    </div>
                                )}
                                <div>
                                    <p style={labelStyle}>Order ID</p>
                                    <p style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                        {order.id}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ ...sectionStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                        >
                            <Link href="/shop" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                padding: '0.875rem', background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                                color: '#fff', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none',
                                fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(0,180,216,0.2)',
                            }}>
                                <Package size={18} /> Continue Shopping
                            </Link>

                            {/* Cancel Order */}
                            {canCancel && (
                                <button
                                    onClick={() => { setActionReason(''); setRefundMethod('original'); setShowCancelModal(true); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.875rem', border: '1px solid #fecaca', color: '#ef4444',
                                        borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
                                        background: 'rgba(239,68,68,0.03)', cursor: 'pointer',
                                    }}
                                >
                                    <XCircle size={18} /> Cancel Order
                                </button>
                            )}

                            {/* Return Order */}
                            {canReturn && (
                                <button
                                    onClick={() => { setActionReason(''); setRefundMethod('original'); setShowReturnModal(true); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.875rem', border: '1px solid #fed7aa', color: '#ea580c',
                                        borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
                                        background: 'rgba(234,88,12,0.03)', cursor: 'pointer',
                                    }}
                                >
                                    <RotateCcw size={18} /> Request Return
                                </button>
                            )}

                            <Link href="/contact" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                padding: '0.875rem', border: '1px solid #e8e4dc', color: '#64648b',
                                borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem',
                            }}>
                                Need Help?
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ===== CANCEL MODAL ===== */}
            <AnimatePresence>
                {showCancelModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(10,10,35,0.6)', backdropFilter: 'blur(4px)',
                            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1.5rem',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: '#fff', borderRadius: '1.5rem', padding: '2rem',
                                width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                position: 'relative',
                            }}
                        >
                            <button onClick={() => setShowCancelModal(false)} style={{
                                position: 'absolute', top: '1.25rem', right: '1.25rem',
                                background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer',
                            }}>
                                <X size={20} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <XCircle size={24} style={{ color: '#ef4444' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0a23' }}>Cancel Order</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>
                                    Reason for cancellation *
                                </label>
                                <textarea
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    placeholder="Please tell us why you want to cancel this order..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                                        border: '1px solid #e5e7eb', fontSize: '0.875rem', resize: 'vertical',
                                        outline: 'none', fontFamily: 'inherit',
                                    }}
                                />
                            </div>

                            {order.payment_method !== 'COD' && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>
                                        Refund Method
                                    </label>
                                    <select
                                        value={refundMethod}
                                        onChange={(e) => setRefundMethod(e.target.value)}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                                            border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none',
                                            background: '#fff',
                                        }}
                                    >
                                        <option value="original">Refund to original payment method</option>
                                        <option value="upi">Refund to UPI</option>
                                        <option value="bank_transfer">Refund to bank account</option>
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    style={{
                                        flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                                        border: '1px solid #e5e7eb', background: '#fff', color: '#64648b',
                                        fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                                    }}
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSubmitting || !actionReason.trim()}
                                    style={{
                                        flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                                        border: 'none', background: '#ef4444', color: '#fff',
                                        fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem', opacity: isSubmitting || !actionReason.trim() ? 0.6 : 1,
                                    }}
                                >
                                    {isSubmitting ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== RETURN MODAL ===== */}
            <AnimatePresence>
                {showReturnModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(10,10,35,0.6)', backdropFilter: 'blur(4px)',
                            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1.5rem',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: '#fff', borderRadius: '1.5rem', padding: '2rem',
                                width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                position: 'relative',
                            }}
                        >
                            <button onClick={() => setShowReturnModal(false)} style={{
                                position: 'absolute', top: '1.25rem', right: '1.25rem',
                                background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer',
                            }}>
                                <X size={20} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RotateCcw size={24} style={{ color: '#ea580c' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0a23' }}>Request Return</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>
                                    Reason for return *
                                </label>
                                <textarea
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    placeholder="Please describe the reason for your return (e.g., damaged item, wrong product, etc.)..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                                        border: '1px solid #e5e7eb', fontSize: '0.875rem', resize: 'vertical',
                                        outline: 'none', fontFamily: 'inherit',
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>
                                    Preferred Refund Method
                                </label>
                                <select
                                    value={refundMethod}
                                    onChange={(e) => setRefundMethod(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                                        border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none',
                                        background: '#fff',
                                    }}
                                >
                                    <option value="original">Refund to original payment method</option>
                                    <option value="upi">Refund to UPI</option>
                                    <option value="bank_transfer">Refund to bank account</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setShowReturnModal(false)}
                                    style={{
                                        flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                                        border: '1px solid #e5e7eb', background: '#fff', color: '#64648b',
                                        fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReturn}
                                    disabled={isSubmitting || !actionReason.trim()}
                                    style={{
                                        flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                                        border: 'none', background: '#ea580c', color: '#fff',
                                        fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem', opacity: isSubmitting || !actionReason.trim() ? 0.6 : 1,
                                    }}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

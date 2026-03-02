'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Package, MapPin, CreditCard, Clock, User, Mail, Phone,
    Hash, Truck, CheckCircle, AlertCircle, RotateCcw, Loader2, ShoppingBag, Tag
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useUserAuthStore } from '@/lib/auth-store';

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
    created_at: string;
    items: OrderItem[];
    profile: { full_name: string | null; email: string; phone: string | null } | null;
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

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
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
                                <CreditCard size={18} style={{ color: '#00b4d8' }} /> Payment Details
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
                                {order.razorpay_order_id && (
                                    <div>
                                        <p style={labelStyle}>Razorpay Order ID</p>
                                        <p style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                            {order.razorpay_order_id}
                                        </p>
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
        </div>
    );
}

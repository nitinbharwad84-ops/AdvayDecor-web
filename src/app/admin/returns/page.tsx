'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, RotateCcw, CheckCircle2, Ban, PackageCheck, PackageX } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
    id: string;
    product_title: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface OrderData {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_amount: number;
    shipping_fee: number;
    shipping_address: {
        full_name: string;
        phone: string;
        address_line1: string;
        address_line2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    status: string;
    payment_method: string;
    created_at: string;
    return_reason?: string | null;
    return_is_packaged?: boolean | null;
    return_is_unused?: boolean | null;
    items: OrderItem[];
}

const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
        'Return Requested': { bg: 'rgba(245, 158, 11, 0.12)', text: '#b45309' },
        'Returned': { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' },
    };
    const s = map[status] || { bg: '#f3f4f6', text: '#6b7280' };
    return (
        <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.text }}>
            {status}
        </span>
    );
};

export default function AdminReturnsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data.filter((o: OrderData) => o.status === 'Return Requested' || o.status === 'Returned'));
            }
        } catch {
            toast.error('Failed to load return requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleAction = async (orderId: string, newStatus: string) => {
        setActionLoading(orderId);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update');
            toast.success(`Order ${newStatus === 'Returned' ? 'return approved' : 'restored to delivered'}`);
            await fetchOrders();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = orders.filter(o =>
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingCount = orders.filter(o => o.status === 'Return Requested').length;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23' }}>Returns</h1>
                <p style={{ fontSize: '0.85rem', color: '#9e9eb8', marginTop: '0.25rem' }}>
                    {pendingCount > 0
                        ? <>{pendingCount} pending request{pendingCount > 1 ? 's' : ''} · {orders.length} total</>
                        : <>{orders.length} total return{orders.length !== 1 ? 's' : ''}</>
                    }
                </p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', maxWidth: '360px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9eb8' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by order ID or customer..."
                        style={{
                            width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem',
                            paddingTop: '0.625rem', paddingBottom: '0.625rem',
                            borderRadius: '0.75rem', border: '1px solid #e8e4dc',
                            background: '#fff', fontSize: '0.875rem', outline: 'none', color: '#0a0a23',
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ borderRadius: '1rem', background: '#fff', border: '1px solid #f0ece4', overflow: 'hidden' }}
            >
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(245,240,232,0.5)' }}>
                                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(order => (
                                <Fragment key={order.id}>
                                    <tr
                                        style={{ borderBottom: '1px solid #f0ece4', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#fafaf8')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 600, color: '#0a0a23' }}>{order.id.substring(0, 8)}…</td>
                                        <td style={{ padding: '0.875rem 1.25rem' }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0a0a23' }}>{order.customer_name}</p>
                                            <p style={{ fontSize: '0.72rem', color: '#9e9eb8' }}>{order.customer_email}</p>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: '#64648b' }}>{order.items?.length || 0}</td>
                                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23' }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: '#64648b' }}>{order.payment_method}</td>
                                        <td style={{ padding: '0.875rem 1.25rem' }}>{statusBadge(order.status)}</td>
                                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: '#9e9eb8' }}>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                                        <td style={{ padding: '0.875rem 1.25rem' }}>
                                            <ChevronDown size={16} style={{ color: '#9e9eb8', transition: 'transform 0.2s', transform: expandedOrder === order.id ? 'rotate(180deg)' : 'none' }} />
                                        </td>
                                    </tr>
                                    {expandedOrder === order.id && (
                                        <tr>
                                            <td colSpan={8} style={{ padding: '0', background: 'rgba(245,240,232,0.25)' }}>
                                                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                                                    {/* Return Details — full width */}
                                                    <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #f0ece4' }}>
                                                        <h4 style={{ fontSize: '0.72rem', fontWeight: 600, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>Return Request Details</h4>

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                                            <div>
                                                                <span style={{ fontSize: '0.78rem', color: '#64648b', fontWeight: 600 }}>Reason: </span>
                                                                <span style={{ fontSize: '0.875rem', color: '#0a0a23' }}>{order.return_reason || 'Not provided'}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                    {order.return_is_packaged ? <PackageCheck size={16} style={{ color: '#16a34a' }} /> : <PackageX size={16} style={{ color: '#ef4444' }} />}
                                                                    <span style={{ fontSize: '0.85rem', color: order.return_is_packaged ? '#16a34a' : '#ef4444', fontWeight: 500 }}>
                                                                        Packaging {order.return_is_packaged ? 'Intact' : 'Missing'}
                                                                    </span>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                    {order.return_is_unused ? <CheckCircle2 size={16} style={{ color: '#16a34a' }} /> : <Ban size={16} style={{ color: '#ef4444' }} />}
                                                                    <span style={{ fontSize: '0.85rem', color: order.return_is_unused ? '#16a34a' : '#ef4444', fontWeight: 500 }}>
                                                                        Product {order.return_is_unused ? 'Unused' : 'Used'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {order.status === 'Return Requested' && (
                                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); handleAction(order.id, 'Returned'); }}
                                                                    disabled={actionLoading === order.id}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', background: '#d97706', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}
                                                                >
                                                                    <CheckCircle2 size={15} /> {actionLoading === order.id ? 'Processing…' : 'Approve Return'}
                                                                </button>
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); handleAction(order.id, 'Delivered'); }}
                                                                    disabled={actionLoading === order.id}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', background: '#fff', color: '#0a0a23', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}
                                                                >
                                                                    <Ban size={15} /> Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Order Items */}
                                                    <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f0ece4' }}>
                                                        <h4 style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Order Items</h4>
                                                        {order.items?.map(item => (
                                                            <div key={item.id} style={{ fontSize: '0.85rem', color: '#0a0a23', marginBottom: '0.35rem', lineHeight: 1.5 }}>
                                                                {item.product_title}{item.variant_name ? ` (${item.variant_name})` : ''} × {item.quantity} — ₹{Number(item.total_price).toLocaleString('en-IN')}
                                                            </div>
                                                        ))}
                                                        <p style={{ fontSize: '0.75rem', color: '#9e9eb8', marginTop: '0.5rem' }}>Shipping: ₹{Number(order.shipping_fee).toLocaleString('en-IN')}</p>
                                                    </div>

                                                    {/* Address */}
                                                    <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f0ece4' }}>
                                                        <h4 style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Pickup Address</h4>
                                                        <p style={{ fontSize: '0.85rem', color: '#0a0a23', lineHeight: 1.7 }}>
                                                            {order.shipping_address.full_name}<br />
                                                            {order.shipping_address.address_line1}<br />
                                                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}<br />
                                                            {order.shipping_address.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                        <RotateCcw size={40} style={{ margin: '0 auto', color: '#d4d0c8', marginBottom: '1rem' }} />
                        <p style={{ color: '#9e9eb8', fontSize: '0.9rem' }}>No return requests found</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors: Record<string, { bg: string; text: string }> = {
    Pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' },
    Processing: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb' },
    Shipped: { bg: 'rgba(139, 92, 246, 0.1)', text: '#7c3aed' },
    Delivered: { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' },
    Cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626' },
    Returned: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' },
};

const statusOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

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
    coupon_code: string | null;
    discount_amount: number;
    created_at: string;
    items: { id: string; product_title: string; variant_name: string | null; quantity: number; unit_price: number; total_price: number }[];
}

export default function AdminOrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        fetch('/api/admin/orders')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                toast.success(`Order status updated to ${newStatus}`);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update');
            }
        } catch {
            toast.error('Failed to update order status');
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

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
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23' }}>Orders</h1>
                <p style={{ fontSize: '0.875rem', color: '#9e9eb8', marginTop: '0.25rem' }}>Manage and track customer orders ({orders.length} total)</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1', maxWidth: '360px', minWidth: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9eb8' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by order ID or customer..."
                        style={{
                            width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem',
                            paddingTop: '0.625rem', paddingBottom: '0.625rem',
                            borderRadius: '0.75rem', border: '1px solid #e8e4dc',
                            background: '#ffffff', fontSize: '0.875rem',
                            outline: 'none', color: '#0a0a23',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '9999px',
                                fontSize: '0.75rem', fontWeight: 600,
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: statusFilter === status ? '#0a0a23' : '#f5f0e8',
                                color: statusFilter === status ? '#ffffff' : '#64648b',
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ borderRadius: '1rem', background: '#ffffff', border: '1px solid #f0ece4', overflow: 'hidden' }}
            >
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(245,240,232,0.5)' }}>
                                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map((h) => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map((order) => (
                                <Fragment key={order.id}>
                                    <tr
                                        style={{ borderBottom: '1px solid #f0ece4', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                    >
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 600, color: '#0a0a23' }}>
                                            {order.id.substring(0, 8)}...
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0a0a23' }}>{order.customer_name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>{order.customer_email}</p>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64648b' }}>{order.items?.length || 0}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23' }}>
                                            ₹{Number(order.total_amount).toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64648b' }}>{order.payment_method}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                                background: statusColors[order.status]?.bg,
                                                color: statusColors[order.status]?.text,
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#9e9eb8' }}>
                                            {new Date(order.created_at).toLocaleDateString('en-IN')}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <ChevronDown size={16} style={{ color: '#9e9eb8', transition: 'transform 0.2s', transform: expandedOrder === order.id ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                        </td>
                                    </tr>
                                    {expandedOrder === order.id && (
                                        <tr>
                                            <td colSpan={8} style={{ padding: '1.25rem 1.5rem', background: 'rgba(245,240,232,0.3)' }}>
                                                <div className="admin-order-detail-grid">
                                                    {/* Order Items */}
                                                    <div>
                                                        <h4 style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Order Items</h4>
                                                        {order.items?.map(item => (
                                                            <div key={item.id} style={{ fontSize: '0.875rem', color: '#0a0a23', marginBottom: '0.25rem' }}>
                                                                {item.product_title}{item.variant_name ? ` (${item.variant_name})` : ''} × {item.quantity} — ₹{Number(item.total_price).toLocaleString('en-IN')}
                                                            </div>
                                                        ))}
                                                        <p style={{ fontSize: '0.75rem', color: '#9e9eb8', marginTop: '0.5rem' }}>
                                                            Shipping: ₹{Number(order.shipping_fee).toLocaleString('en-IN')}
                                                        </p>
                                                        {order.coupon_code && (
                                                            <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.125rem' }}>
                                                                Discount ({order.coupon_code}): -₹{Number(order.discount_amount).toLocaleString('en-IN')}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Shipping Address */}
                                                    <div>
                                                        <h4 style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Shipping Address</h4>
                                                        <p style={{ fontSize: '0.875rem', color: '#0a0a23' }}>{order.shipping_address.full_name}</p>
                                                        <p style={{ fontSize: '0.875rem', color: '#0a0a23' }}>{order.shipping_address.address_line1}</p>
                                                        <p style={{ fontSize: '0.875rem', color: '#0a0a23' }}>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                                                        <p style={{ fontSize: '0.875rem', color: '#0a0a23' }}>{order.shipping_address.phone}</p>
                                                    </div>

                                                    {/* Update Status */}
                                                    <div>
                                                        <h4 style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Update Status</h4>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            style={{
                                                                width: '100%', padding: '0.5rem 0.75rem',
                                                                borderRadius: '0.5rem', border: '1px solid #d4d0c8',
                                                                background: '#ffffff', fontSize: '0.875rem',
                                                                outline: 'none', color: '#0a0a23',
                                                            }}
                                                        >
                                                            {statusOptions.filter(s => s !== 'All').map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
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

                {filteredOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <Eye size={40} style={{ margin: '0 auto', color: '#9e9eb8', marginBottom: '1rem' }} />
                        <p style={{ color: '#64648b' }}>No orders found</p>
                    </div>
                )}
            </motion.div>

            <style>{`
                .admin-order-detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; padding: 0.5rem; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.25rem 0', marginTop: '1rem' }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e8e4dc',
                            background: '#fff', cursor: currentPage === 1 ? 'default' : 'pointer',
                            opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.25rem',
                            fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23',
                        }}
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#64648b' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e8e4dc',
                            background: '#fff', cursor: currentPage === totalPages ? 'default' : 'pointer',
                            opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.25rem',
                            fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23',
                        }}
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}

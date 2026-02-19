'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, IndianRupee, Clock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const statIcons = [ShoppingCart, IndianRupee, Clock, Package]; // mapped by index
const statGradients = [
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #22c55e, #10b981)',
    'linear-gradient(135deg, #f59e0b, #f97316)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
];

const statusColors: Record<string, { bg: string; text: string }> = {
    Pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' },
    Processing: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb' },
    Shipped: { bg: 'rgba(139, 92, 246, 0.1)', text: '#7c3aed' },
    Delivered: { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' },
    Cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626' },
};

interface DashboardData {
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    revenue: number;
    recentOrders: { id: string; customer: string; total: string; status: string; date: string }[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/dashboard')
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!data) {
        return <div style={{ textAlign: 'center', padding: '3rem', color: '#9e9eb8' }}>Failed to load dashboard data</div>;
    }

    const stats = [
        { title: 'Total Orders', value: data.totalOrders.toString(), change: '', href: '/admin/orders' },
        { title: 'Revenue', value: `₹${data.revenue.toLocaleString('en-IN')}`, change: '', href: '/admin/orders' },
        { title: 'Pending Orders', value: data.pendingOrders.toString(), change: data.pendingOrders > 0 ? 'Needs attention' : 'All clear', href: '/admin/orders' },
        { title: 'Total Products', value: data.totalProducts.toString(), change: '', href: '/admin/products' },
    ];

    return (
        <div style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23' }}>Dashboard</h1>
                <p style={{ fontSize: '0.875rem', color: '#9e9eb8', marginTop: '0.25rem' }}>Welcome back! Here&apos;s what&apos;s happening today.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {stats.map((stat, index) => {
                    const Icon = statIcons[index];
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <Link href={stat.href} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    padding: '1.25rem', borderRadius: '1rem', background: '#ffffff',
                                    border: '1px solid #f0ece4', transition: 'all 0.3s ease', cursor: 'pointer',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '0.75rem',
                                            background: statGradients[index], display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Icon size={20} style={{ color: '#fff' }} />
                                        </div>
                                        <ArrowUpRight size={16} style={{ color: '#9e9eb8' }} />
                                    </div>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23' }}>{stat.value}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#9e9eb8', marginTop: '0.25rem' }}>{stat.title}</p>
                                    {stat.change && (
                                        <p style={{
                                            fontSize: '0.7rem', marginTop: '0.5rem',
                                            color: stat.change === 'Needs attention' ? '#f59e0b' : '#22c55e',
                                        }}>
                                            ↗ {stat.change}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{ borderRadius: '1rem', background: '#ffffff', border: '1px solid #f0ece4', overflow: 'hidden' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0ece4' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a23' }}>Recent Orders</h2>
                    <Link href="/admin/orders" style={{ fontSize: '0.8rem', color: '#00b4d8', textDecoration: 'none', fontWeight: 500 }}>View All →</Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(245,240,232,0.5)' }}>
                                {['Customer', 'Total', 'Status', 'Date'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentOrders.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f0ece4' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#0a0a23' }}>{order.customer}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23' }}>{order.total}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                            background: statusColors[order.status]?.bg || '#f0f0f0',
                                            color: statusColors[order.status]?.text || '#666',
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#9e9eb8' }}>{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}

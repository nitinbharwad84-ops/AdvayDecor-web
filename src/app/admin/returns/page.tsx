'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    RotateCcw, XCircle, CheckCircle, Clock, Package, AlertCircle,
    Loader2, ChevronDown, ChevronUp, User, Mail, Phone
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ReturnRequest {
    id: string;
    order_id: string;
    user_id: string | null;
    reason: string;
    refund_method: string;
    refund_details: any;
    status: string;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    order?: {
        id: string;
        total_amount: number;
        status: string;
        shipping_address: any;
        payment_method: string;
        created_at: string;
    };
}

interface CancellationRequest {
    id: string;
    order_id: string;
    user_id: string | null;
    reason: string;
    refund_method: string;
    refund_details: any;
    status: string;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    order?: {
        id: string;
        total_amount: number;
        status: string;
        payment_method: string;
        created_at: string;
    };
}

type Tab = 'returns' | 'cancellations';

export default function AdminReturnsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('returns');
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const supabase = createClient();

            const [{ data: returnsData }, { data: cancellationsData }] = await Promise.all([
                supabase.from('return_requests').select('*, order:orders(id, total_amount, status, shipping_address, payment_method, created_at)').order('created_at', { ascending: false }),
                supabase.from('cancellation_requests').select('*, order:orders(id, total_amount, status, payment_method, created_at)').order('created_at', { ascending: false }),
            ]);

            setReturns((returnsData as any) || []);
            setCancellations((cancellationsData as any) || []);
        } catch (err) {
            console.error('Fetch returns error:', err);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (type: 'return' | 'cancellation', id: string, newStatus: string) => {
        try {
            const supabase = createClient();
            const table = type === 'return' ? 'return_requests' : 'cancellation_requests';

            await supabase
                .from(table)
                .update({
                    status: newStatus,
                    admin_notes: adminNotes || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            toast.success(`Request ${newStatus.toLowerCase()}`);
            setAdminNotes('');
            fetchData();
        } catch {
            toast.error('Failed to update request');
        }
    };

    const statusBadge = (status: string) => {
        const config: Record<string, { color: string; bg: string }> = {
            'Pending': { color: '#d97706', bg: '#fef3c7' },
            'Approved': { color: '#166534', bg: '#dcfce7' },
            'Rejected': { color: '#b91c1c', bg: '#fee2e2' },
            'Completed': { color: '#0369a1', bg: '#e0f2fe' },
            'Refunded': { color: '#166534', bg: '#dcfce7' },
        };
        const s = config[status] || { color: '#64748b', bg: '#f1f5f9' };
        return (
            <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '2rem',
                fontSize: '0.75rem', fontWeight: 700,
                background: s.bg, color: s.color,
            }}>
                {status}
            </span>
        );
    };

    const cardStyle: React.CSSProperties = {
        background: '#fff', borderRadius: '1rem', padding: '1.25rem',
        border: '1px solid #f0ece4', marginBottom: '1rem',
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#00b4d8' }} />
            </div>
        );
    }

    const currentData = activeTab === 'returns' ? returns : cancellations;
    const pendingReturns = returns.filter(r => r.status === 'Pending').length;
    const pendingCancellations = cancellations.filter(r => r.status === 'Pending').length;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #ea580c, #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <RotateCcw size={20} />
                        </div>
                        Returns & Cancellations
                    </h1>
                    <p style={{ color: '#64648b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Manage customer return requests and order cancellations
                    </p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {([
                    { key: 'returns' as Tab, label: 'Returns', icon: <RotateCcw size={14} />, count: pendingReturns },
                    { key: 'cancellations' as Tab, label: 'Cancellations', icon: <XCircle size={14} />, count: pendingCancellations },
                ]).map(({ key, label, icon, count }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
                            border: activeTab === key ? '2px solid #00b4d8' : '1px solid #e8e4dc',
                            background: activeTab === key ? 'rgba(0,180,216,0.05)' : '#fff',
                            color: activeTab === key ? '#0369a1' : '#64648b',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                        }}
                    >
                        {icon} {label}
                        {count > 0 && (
                            <span style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: '#ef4444', color: '#fff', fontSize: '0.65rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                            }}>
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            {currentData.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '3rem 1.5rem',
                    background: '#fff', borderRadius: '1rem', border: '1px solid #f0ece4',
                }}>
                    <Package size={48} style={{ color: '#e8e4dc', margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 600, color: '#0a0a23' }}>No {activeTab} yet</p>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {activeTab === 'returns' ? 'Return requests will appear here' : 'Cancellation requests will appear here'}
                    </p>
                </div>
            ) : (
                currentData.map((item: any) => {
                    const isExpanded = expandedId === item.id;
                    const type = activeTab === 'returns' ? 'return' : 'cancellation';

                    return (
                        <motion.div
                            key={item.id}
                            layout
                            style={cardStyle}
                        >
                            {/* Header Row */}
                            <div
                                onClick={() => {
                                    setExpandedId(isExpanded ? null : item.id);
                                    setAdminNotes(item.admin_notes || '');
                                }}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '0.75rem' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: type === 'return' ? '#fff7ed' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {type === 'return' ? <RotateCcw size={16} style={{ color: '#ea580c' }} /> : <XCircle size={16} style={{ color: '#ef4444' }} />}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, color: '#0a0a23', fontSize: '0.9rem' }}>
                                            Order #{item.order_id?.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {item.order && (
                                        <span style={{ fontWeight: 700, color: '#0a0a23', fontSize: '0.9rem' }}>
                                            {formatCurrency(item.order.total_amount)}
                                        </span>
                                    )}
                                    {statusBadge(item.status)}
                                    {isExpanded ? <ChevronUp size={16} style={{ color: '#94a3b8' }} /> : <ChevronDown size={16} style={{ color: '#94a3b8' }} />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{ borderTop: '1px solid #f0ece4', marginTop: '1rem', paddingTop: '1rem', overflow: 'hidden' }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Reason</p>
                                            <p style={{ fontSize: '0.85rem', color: '#0a0a23' }}>{item.reason}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Refund Method</p>
                                            <p style={{ fontSize: '0.85rem', color: '#0a0a23' }}>{item.refund_method === 'original' ? 'Original payment method' : item.refund_method === 'upi' ? 'UPI' : 'Bank Transfer'}</p>
                                        </div>
                                        {item.order && (
                                            <>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Payment Method</p>
                                                    <p style={{ fontSize: '0.85rem', color: '#0a0a23' }}>{item.order.payment_method}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order Status</p>
                                                    <p style={{ fontSize: '0.85rem', color: '#0a0a23' }}>{item.order.status}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Admin Notes Input */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                            Admin Notes
                                        </label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            rows={2}
                                            placeholder="Optional notes about this request..."
                                            style={{
                                                width: '100%', padding: '0.625rem', borderRadius: '0.5rem',
                                                border: '1px solid #e5e7eb', fontSize: '0.85rem', resize: 'vertical',
                                                outline: 'none', fontFamily: 'inherit', background: '#fdfbf7',
                                            }}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    {item.status === 'Pending' && (
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => updateRequestStatus(type, item.id, 'Approved')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                    padding: '0.625rem 1rem', borderRadius: '0.5rem',
                                                    border: 'none', background: '#166534', color: '#fff',
                                                    fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                                                }}
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => updateRequestStatus(type, item.id, 'Rejected')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                    padding: '0.625rem 1rem', borderRadius: '0.5rem',
                                                    border: '1px solid #fecaca', background: '#fff', color: '#ef4444',
                                                    fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                                                }}
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                            {type === 'return' && (
                                                <button
                                                    onClick={() => updateRequestStatus(type, item.id, 'Completed')}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                        padding: '0.625rem 1rem', borderRadius: '0.5rem',
                                                        border: '1px solid #e8e4dc', background: '#fff', color: '#0369a1',
                                                        fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                                                    }}
                                                >
                                                    <Package size={14} /> Mark Completed
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })
            )}
        </div>
    );
}

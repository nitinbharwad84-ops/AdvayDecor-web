'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'flat' | 'percentage';
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    is_active: boolean;
    expires_at: string | null;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    // Form state
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
    const [discountValue, setDiscountValue] = useState('');
    const [minOrder, setMinOrder] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [expiresAt, setExpiresAt] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/coupons');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch coupons');
            setCoupons(data);
        } catch (error: any) {
            console.error('Error fetching coupons:', error);
            if (error.message.includes('relation "coupons" does not exist') || error.message.includes('missing')) {
                toast.error('Coupons table missing. Please run the SQL migration.', { duration: 5000 });
            } else {
                toast.error('Failed to load coupons');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (coupon?: Coupon) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setCode(coupon.code);
            setDiscountType(coupon.discount_type);
            setDiscountValue(coupon.discount_value.toString());
            setMinOrder(coupon.min_order_amount.toString());
            setMaxDiscount(coupon.max_discount_amount ? coupon.max_discount_amount.toString() : '');
            setIsActive(coupon.is_active);
            setExpiresAt(coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '');
        } else {
            setEditingCoupon(null);
            setCode('');
            setDiscountType('flat');
            setDiscountValue('');
            setMinOrder('0');
            setMaxDiscount('');
            setIsActive(true);
            setExpiresAt('');
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                code,
                discount_type: discountType,
                discount_value: parseFloat(discountValue),
                min_order_amount: parseFloat(minOrder) || 0,
                max_discount_amount: maxDiscount ? parseFloat(maxDiscount) : null,
                is_active: isActive,
                expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
            };

            const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons';
            const method = editingCoupon ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save coupon');

            toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created');
            setIsModalOpen(false);
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete coupon');
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23', display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-display)' }}>
                        <Tag style={{ color: '#00b4d8' }} />
                        Coupons
                    </h1>
                    <p style={{ color: '#64648b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Manage discount codes for the store
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        padding: '0.75rem 1.5rem', background: '#0a0a23', color: '#fff',
                        border: 'none', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'background 0.2s',
                    }}
                >
                    <Plus size={18} /> Add Coupon
                </button>
            </div>

            {/* Coupons List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64648b' }}>Loading coupons...</div>
            ) : coupons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
                    <Tag size={32} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>No coupons created yet</h3>
                    <p style={{ color: '#64648b' }}>Click &quot;Add Coupon&quot; to create your first discount code.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {coupons.map((coupon) => (
                        <div key={coupon.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e5e7eb', padding: '1.5rem', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00b4d8', letterSpacing: '1px' }}>
                                        {coupon.code}
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem', background: coupon.is_active ? '#dcfce7' : '#f1f5f9', color: coupon.is_active ? '#166534' : '#64748b', display: 'inline-block', marginTop: '0.5rem' }}>
                                        {coupon.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleOpenModal(coupon)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(coupon.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#64748b' }}>Discount:</span>
                                    <span style={{ fontWeight: 600, color: '#0a0a23' }}>
                                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#64748b' }}>Min Order:</span>
                                    <span style={{ fontWeight: 500, color: '#0a0a23' }}>₹{coupon.min_order_amount}</span>
                                </div>
                                {coupon.discount_type === 'percentage' && coupon.max_discount_amount && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#64748b' }}>Max Discount:</span>
                                        <span style={{ fontWeight: 500, color: '#0a0a23' }}>₹{coupon.max_discount_amount}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#64748b' }}>Expires:</span>
                                    <span style={{ fontWeight: 500, color: coupon.expires_at && new Date(coupon.expires_at) < new Date() ? '#ef4444' : '#0a0a23' }}>
                                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,35,0.5)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: '500px', position: 'relative', zIndex: 101, maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0a23' }}>
                                    {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64648b' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Coupon Code</label>
                                    <input
                                        type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. WELCOME10"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.9rem', textTransform: 'uppercase' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Discount Type</label>
                                        <select
                                            value={discountType} onChange={(e) => setDiscountType(e.target.value as 'flat' | 'percentage')}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.9rem', background: '#fff' }}
                                        >
                                            <option value="flat">Flat Amount (₹)</option>
                                            <option value="percentage">Percentage (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Discount Value</label>
                                        <input
                                            type="number" required min="0" step="0.01" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                                            placeholder={discountType === 'flat' ? 'Amount in ₹' : 'Percentage %'}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Min Order Amount (₹)</label>
                                        <input
                                            type="number" min="0" value={minOrder} onChange={(e) => setMinOrder(e.target.value)}
                                            placeholder="0 for no minimum"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                            Max Discount (₹) {discountType !== 'percentage' && '(Optional)'}
                                        </label>
                                        <input
                                            type="number" min="0" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)}
                                            placeholder="No limit"
                                            disabled={discountType === 'flat'}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.9rem', background: discountType === 'flat' ? '#f1f5f9' : '#fff' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Expiry Date (Optional)</label>
                                    <input
                                        type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: '#00b4d8' }}
                                    />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Coupon is active</span>
                                </label>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '1rem', width: '100%', padding: '0.875rem', background: '#00b4d8', color: '#fff',
                                        border: 'none', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem',
                                        cursor: 'pointer', transition: 'background 0.2s',
                                    }}
                                >
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

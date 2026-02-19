'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, UserPlus, Shield, Truck, Image, Store, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
    border: '1px solid #d4d0c8', background: '#ffffff', fontSize: '0.875rem',
    outline: 'none', color: '#0a0a23', transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.875rem', fontWeight: 500,
    color: '#0a0a23', marginBottom: '0.375rem',
};

const cardStyle: React.CSSProperties = {
    padding: '1.5rem', borderRadius: '1rem', background: '#ffffff', border: '1px solid #f0ece4',
};

export default function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Settings state
    const [shippingFee, setShippingFee] = useState('50');
    const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
    const [codEnabled, setCodEnabled] = useState(true);
    const [heroBannerUrl, setHeroBannerUrl] = useState('');

    // Admin creation state
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
    const [adminCreated, setAdminCreated] = useState(false);

    // Fetch current settings from Supabase
    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    if (data.global_shipping_fee) setShippingFee(data.global_shipping_fee);
                    if (data.free_shipping_threshold) setFreeShippingThreshold(data.free_shipping_threshold);
                    if (data.cod_enabled !== undefined) setCodEnabled(data.cod_enabled === 'true');
                    if (data.hero_banner_url) setHeroBannerUrl(data.hero_banner_url);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    global_shipping_fee: shippingFee,
                    free_shipping_threshold: freeShippingThreshold,
                    cod_enabled: codEnabled ? 'true' : 'false',
                    hero_banner_url: heroBannerUrl,
                }),
            });

            if (res.ok) {
                toast.success('Settings saved successfully!');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save');
            }
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newAdminEmail || !newAdminPassword) {
            toast.error('Please fill in both email and password');
            return;
        }

        if (newAdminPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsCreatingAdmin(true);
        setAdminCreated(false);

        try {
            const res = await fetch('/api/admin/create-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newAdminEmail,
                    password: newAdminPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Failed to create admin');
                return;
            }

            toast.success(`Admin user ${newAdminEmail} created!`);
            setAdminCreated(true);
            setNewAdminEmail('');
            setNewAdminPassword('');

            setTimeout(() => setAdminCreated(false), 3000);
        } catch {
            toast.error('Failed to create admin user');
        } finally {
            setIsCreatingAdmin(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23' }}>Settings</h1>
                    <p style={{ fontSize: '0.875rem', color: '#9e9eb8', marginTop: '0.25rem' }}>Configure your store settings</p>
                </div>
                <motion.button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.625rem 1.25rem', background: '#00b4d8', color: '#fff',
                        borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
                        border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px rgba(0,180,216,0.25)',
                        opacity: isSaving ? 0.7 : 1,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Shipping Settings */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Truck size={18} style={{ color: '#fff' }} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23' }}>Shipping</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Shipping Fee (₹)</label>
                            <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Free Shipping Above (₹)</label>
                            <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                </motion.div>

                {/* Payment Settings */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #22c55e, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Store size={18} style={{ color: '#fff' }} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23' }}>Payment</h2>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0a0a23' }}>Cash on Delivery (COD)</span>
                            <p style={{ fontSize: '0.75rem', color: '#9e9eb8', marginTop: '0.125rem' }}>Allow customers to pay when the order is delivered</p>
                        </div>
                        <div
                            style={{
                                width: '44px', height: '24px', borderRadius: '12px',
                                background: codEnabled ? '#00b4d8' : '#e8e4dc',
                                transition: 'background 0.2s ease', position: 'relative', cursor: 'pointer', flexShrink: 0,
                            }}
                            onClick={() => setCodEnabled(!codEnabled)}
                        >
                            <div style={{
                                position: 'absolute', top: '2px', left: codEnabled ? '22px' : '2px',
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s ease',
                            }} />
                        </div>
                    </label>
                </motion.div>

                {/* Hero Banner URL */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image size={18} style={{ color: '#fff' }} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23' }}>Hero Banner</h2>
                    </div>
                    <div>
                        <label style={labelStyle}>Banner Image URL</label>
                        <input type="url" value={heroBannerUrl} onChange={(e) => setHeroBannerUrl(e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem' }} placeholder="https://images.unsplash.com/photo-..." />
                    </div>
                    {heroBannerUrl && (
                        <div style={{ marginTop: '1rem', borderRadius: '0.75rem', overflow: 'hidden', height: '120px', background: '#f5f0e8' }}>
                            <img src={heroBannerUrl} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                </motion.div>

                {/* Add Admin User */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserPlus size={18} style={{ color: '#fff' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23' }}>Add Admin User</h2>
                            <p style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>This creates a new user in Supabase with admin privileges.</p>
                        </div>
                    </div>
                    <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} style={inputStyle} placeholder="admin@example.com" />
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} style={inputStyle} placeholder="Min 6 characters" />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={isCreatingAdmin}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                padding: '0.625rem 1.25rem',
                                background: adminCreated ? '#22c55e' : '#0a0a23',
                                color: '#fff', borderRadius: '0.75rem', fontWeight: 600,
                                fontSize: '0.875rem', border: 'none',
                                cursor: isCreatingAdmin ? 'not-allowed' : 'pointer',
                                opacity: isCreatingAdmin ? 0.7 : 1,
                                transition: 'background 0.3s',
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            {isCreatingAdmin ? (
                                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</>
                            ) : adminCreated ? (
                                <><Shield size={16} /> Admin Created!</>
                            ) : (
                                <><UserPlus size={16} /> Create Admin</>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

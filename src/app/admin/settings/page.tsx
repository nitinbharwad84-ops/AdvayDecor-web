'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Save, UserPlus, Shield, Truck, Image as ImageIcon, Store, Loader2, CreditCard, Smartphone, Building2, Wallet, CalendarClock, Upload, X, ChevronRight, Globe
} from 'lucide-react';
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

// Reusable toggle switch
function ToggleSwitch({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
    return (
        <div
            style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: disabled ? '#e0e0e0' : (enabled ? '#00b4d8' : '#e8e4dc'),
                transition: 'background 0.2s ease', position: 'relative',
                cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0,
                opacity: disabled ? 0.5 : 1,
            }}
            onClick={() => !disabled && onToggle()}
        >
            <div style={{
                position: 'absolute', top: '2px', left: enabled ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s ease',
            }} />
        </div>
    );
}

// Reusable payment toggle row
function PaymentToggleRow({
    icon: Icon,
    iconGradient,
    label,
    description,
    enabled,
    onToggle,
    disabled,
}: {
    icon: any;
    iconGradient: string;
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    disabled?: boolean;
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1rem', borderRadius: '0.75rem',
            border: '1px solid #f0ece4', background: disabled ? '#fafaf8' : '#ffffff',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '0.5rem',
                    background: iconGradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={15} style={{ color: '#fff' }} />
                </div>
                <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0a0a23' }}>{label}</span>
                    <p style={{ fontSize: '0.7rem', color: '#9e9eb8', marginTop: '0.05rem' }}>{description}</p>
                </div>
            </div>
            <ToggleSwitch enabled={enabled} onToggle={onToggle} disabled={disabled} />
        </div>
    );
}

export default function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Settings state
    const [shippingFee, setShippingFee] = useState('50');
    const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
    const [codEnabled, setCodEnabled] = useState(true);

    // Razorpay payment method toggles
    const [razorpayEnabled, setRazorpayEnabled] = useState(true);
    const [razorpayUpi, setRazorpayUpi] = useState(true);
    const [razorpayCard, setRazorpayCard] = useState(true);
    const [razorpayNetbanking, setRazorpayNetbanking] = useState(true);
    const [razorpayWallet, setRazorpayWallet] = useState(true);
    const [razorpayEmi, setRazorpayEmi] = useState(false);

    // Hero Banner State
    const [heroBannerUrl, setHeroBannerUrl] = useState('');
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // Admin creation state
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
    const [adminCreated, setAdminCreated] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
                    // Razorpay settings
                    if (data.razorpay_enabled !== undefined) setRazorpayEnabled(data.razorpay_enabled === 'true');
                    if (data.razorpay_upi !== undefined) setRazorpayUpi(data.razorpay_upi === 'true');
                    if (data.razorpay_card !== undefined) setRazorpayCard(data.razorpay_card === 'true');
                    if (data.razorpay_netbanking !== undefined) setRazorpayNetbanking(data.razorpay_netbanking === 'true');
                    if (data.razorpay_wallet !== undefined) setRazorpayWallet(data.razorpay_wallet === 'true');
                    if (data.razorpay_emi !== undefined) setRazorpayEmi(data.razorpay_emi === 'true');
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
                    razorpay_enabled: razorpayEnabled ? 'true' : 'false',
                    razorpay_upi: razorpayUpi ? 'true' : 'false',
                    razorpay_card: razorpayCard ? 'true' : 'false',
                    razorpay_netbanking: razorpayNetbanking ? 'true' : 'false',
                    razorpay_wallet: razorpayWallet ? 'true' : 'false',
                    razorpay_emi: razorpayEmi ? 'true' : 'false',
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

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Only JPG, PNG, and WEBP allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be under 5MB');
            return;
        }

        setIsUploadingBanner(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setHeroBannerUrl(data.url);
                toast.success('Banner uploaded! Save changes to apply.');
            } else {
                toast.error(data.error || 'Upload failed');
            }
        } catch {
            toast.error('Failed to upload banner');
        } finally {
            setIsUploadingBanner(false);
            e.target.value = ''; // Reset input
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

    // Count enabled Razorpay methods
    const enabledMethodsCount = [razorpayUpi, razorpayCard, razorpayNetbanking, razorpayWallet, razorpayEmi].filter(Boolean).length;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
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
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23' }}>Payment Methods</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* COD Toggle */}
                        <PaymentToggleRow
                            icon={Store}
                            iconGradient="linear-gradient(135deg, #f59e0b, #f97316)"
                            label="Cash on Delivery (COD)"
                            description="Allow customers to pay when the order is delivered"
                            enabled={codEnabled}
                            onToggle={() => setCodEnabled(!codEnabled)}
                        />

                        {/* Razorpay Master Toggle */}
                        <div style={{
                            padding: '0.875rem 1rem', borderRadius: '0.75rem',
                            border: '1px solid #f0ece4', background: razorpayEnabled ? 'rgba(0,180,216,0.02)' : '#ffffff',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '0.5rem',
                                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <CreditCard size={15} style={{ color: '#fff' }} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23' }}>Razorpay (Online Payments)</span>
                                        <p style={{ fontSize: '0.7rem', color: '#9e9eb8', marginTop: '0.05rem' }}>
                                            {razorpayEnabled ? `${enabledMethodsCount} method${enabledMethodsCount !== 1 ? 's' : ''} active` : 'Disabled — customers cannot pay online'}
                                        </p>
                                    </div>
                                </div>
                                <ToggleSwitch enabled={razorpayEnabled} onToggle={() => setRazorpayEnabled(!razorpayEnabled)} />
                            </div>

                            {/* Sub-methods — only show when Razorpay is enabled */}
                            {razorpayEnabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{
                                        marginTop: '0.875rem', paddingTop: '0.875rem',
                                        borderTop: '1px solid #f0ece4',
                                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                                    }}
                                >
                                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                        Payment Methods
                                    </p>

                                    <PaymentToggleRow
                                        icon={Smartphone}
                                        iconGradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
                                        label="UPI"
                                        description="Google Pay, PhonePe, Paytm, BHIM"
                                        enabled={razorpayUpi}
                                        onToggle={() => setRazorpayUpi(!razorpayUpi)}
                                    />

                                    <PaymentToggleRow
                                        icon={CreditCard}
                                        iconGradient="linear-gradient(135deg, #ec4899, #f43f5e)"
                                        label="Credit / Debit Card"
                                        description="Visa, Mastercard, RuPay, Amex"
                                        enabled={razorpayCard}
                                        onToggle={() => setRazorpayCard(!razorpayCard)}
                                    />

                                    <PaymentToggleRow
                                        icon={Building2}
                                        iconGradient="linear-gradient(135deg, #0ea5e9, #0284c7)"
                                        label="Netbanking"
                                        description="All major Indian banks supported"
                                        enabled={razorpayNetbanking}
                                        onToggle={() => setRazorpayNetbanking(!razorpayNetbanking)}
                                    />

                                    <PaymentToggleRow
                                        icon={Wallet}
                                        iconGradient="linear-gradient(135deg, #14b8a6, #059669)"
                                        label="Wallet"
                                        description="Paytm Wallet, Mobikwik, FreeCharge"
                                        enabled={razorpayWallet}
                                        onToggle={() => setRazorpayWallet(!razorpayWallet)}
                                    />

                                    <PaymentToggleRow
                                        icon={CalendarClock}
                                        iconGradient="linear-gradient(135deg, #a855f7, #7c3aed)"
                                        label="EMI"
                                        description="Card-based EMI installments"
                                        enabled={razorpayEmi}
                                        onToggle={() => setRazorpayEmi(!razorpayEmi)}
                                    />

                                    {enabledMethodsCount === 0 && (
                                        <p style={{
                                            fontSize: '0.75rem', color: '#ef4444', fontWeight: 500,
                                            padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                            background: 'rgba(239,68,68,0.06)', marginTop: '0.25rem',
                                        }}>
                                            ⚠️ No payment methods enabled. Customers won&apos;t be able to pay online.
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Warning if both COD and Razorpay are disabled */}
                        {!codEnabled && !razorpayEnabled && (
                            <p style={{
                                fontSize: '0.8rem', color: '#ef4444', fontWeight: 500,
                                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                            }}>
                                ⚠️ All payment methods are disabled! Customers cannot place orders.
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Hero Banner URL */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={18} style={{ color: '#fff' }} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23' }}>Hero Banner</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={labelStyle}>Banner Image URL</label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <input
                                    type="url"
                                    value={heroBannerUrl}
                                    onChange={(e) => setHeroBannerUrl(e.target.value)}
                                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem', flex: 1 }}
                                    placeholder="https://images.unsplash.com/photo-..."
                                />
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0 1rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                                    borderRadius: '0.75rem', cursor: isUploadingBanner ? 'not-allowed' : 'pointer',
                                    fontSize: '0.8rem', fontWeight: 600, color: '#64748b', transition: 'all 0.2s'
                                }}>
                                    <input type="file" accept="image/*" onChange={handleBannerUpload} disabled={isUploadingBanner} style={{ display: 'none' }} />
                                    {isUploadingBanner ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {isUploadingBanner ? 'Uploading...' : 'Upload'}
                                </label>
                            </div>
                        </div>

                        {heroBannerUrl && (
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    borderRadius: '0.75rem', overflow: 'hidden', height: '200px',
                                    background: '#f8fafc', border: '1px solid #e2e8f0',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <img src={heroBannerUrl} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <button
                                    onClick={() => setHeroBannerUrl('')}
                                    style={{
                                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: 'rgba(239, 68, 68, 0.9)', color: '#fff',
                                        border: 'none', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <X size={14} />
                                </button>
                                <div style={{
                                    position: 'absolute', bottom: '0.5rem', left: '0.5rem',
                                    padding: '0.25rem 0.75rem', background: 'rgba(0,0,0,0.6)',
                                    color: '#fff', borderRadius: '1rem', fontSize: '0.7rem',
                                    backdropFilter: 'blur(4px)'
                                }}>
                                    Desktop Banner Preview (16:9 recommended)
                                </div>
                            </div>
                        )}
                        {!heroBannerUrl && !isUploadingBanner && (
                            <div style={{
                                height: '120px', borderRadius: '0.75rem', border: '2px dashed #e2e8f0',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', color: '#94a3b8', gap: '0.5rem'
                            }}>
                                <ImageIcon size={32} style={{ opacity: 0.3 }} />
                                <span style={{ fontSize: '0.8rem' }}>No banner image selected</span>
                            </div>
                        )}
                    </div>
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

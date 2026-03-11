'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, Globe, BarChart3, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
    border: '1px solid #d4e0d4', background: '#ffffff', fontSize: '0.875rem',
    outline: 'none', color: '#0a1a0a', fontFamily: 'monospace',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600,
    color: '#0a1a0a', marginBottom: '0.375rem',
};

const cardStyle: React.CSSProperties = {
    padding: '1.5rem', borderRadius: '1rem', background: '#ffffff', border: '1px solid #e0e8e0',
};

export default function SeoSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [ga4Id, setGa4Id] = useState('');
    const [gtagId, setGtagId] = useState('');
    const [metaPixelId, setMetaPixelId] = useState('');
    const [googleVerification, setGoogleVerification] = useState('');

    useEffect(() => {
        fetch('/api/seo/settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setGa4Id(data.ga4_measurement_id || '');
                    setGtagId(data.google_tag_id || '');
                    setMetaPixelId(data.meta_pixel_id || '');
                    setGoogleVerification(data.google_verification || '');
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/seo/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ga4_measurement_id: ga4Id,
                    google_tag_id: gtagId,
                    meta_pixel_id: metaPixelId,
                    google_verification: googleVerification,
                }),
            });
            if (res.ok) {
                toast.success('SEO settings saved!');
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

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(34,197,94,0.2)', borderTop: '3px solid #22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Settings size={14} style={{ color: '#64748b' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Settings</span>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a1a0a' }}>SEO Settings</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7c6b', marginTop: '0.25rem' }}>Configure tracking IDs and verification tags.</p>
                </div>
                <motion.button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.625rem 1.25rem', background: '#22c55e', color: '#fff',
                        borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
                        border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px rgba(34,197,94,0.25)',
                        opacity: isSaving ? 0.7 : 1,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </motion.button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #f59e0b20, #f59e0b08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={18} style={{ color: '#f59e0b' }} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a1a0a' }}>Tracking IDs</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Google Analytics 4 Measurement ID</label>
                            <input type="text" value={ga4Id} onChange={(e) => setGa4Id(e.target.value)} style={inputStyle} placeholder="G-XXXXXXXXXX" />
                        </div>
                        <div>
                            <label style={labelStyle}>Google Tag / Ads Conversion ID</label>
                            <input type="text" value={gtagId} onChange={(e) => setGtagId(e.target.value)} style={inputStyle} placeholder="AW-XXXXXXXXXXX" />
                        </div>
                        <div>
                            <label style={labelStyle}>Meta (Facebook) Pixel ID</label>
                            <input type="text" value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} style={inputStyle} placeholder="XXXXXXXXXXXXXXXX" />
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #22c55e20, #22c55e08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={18} style={{ color: '#22c55e' }} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a1a0a' }}>Verification</h2>
                    </div>
                    <div>
                        <label style={labelStyle}>Google Search Console Verification Tag</label>
                        <input type="text" value={googleVerification} onChange={(e) => setGoogleVerification(e.target.value)} style={inputStyle} placeholder="Verification meta tag content" />
                        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.5rem' }}>This is the content value of your Google verification meta tag.</p>
                    </div>
                </motion.div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

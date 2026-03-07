'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Truck, Power, MapPin, Package, Eye, Calculator, ShoppingCart, Save,
    Loader2, CheckCircle, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase';

interface ShiprocketSettings {
    shiprocket_enabled: boolean;
    shiprocket_pincode_check: boolean;
    shiprocket_rate_calculation: boolean;
    shiprocket_auto_order: boolean;
    shiprocket_tracking: boolean;
    shiprocket_pickup_pincode: string;
    shiprocket_default_weight: string;
    shiprocket_fixed_shipping_fee: string;
    shiprocket_free_shipping_threshold: string;
}

const defaultSettings: ShiprocketSettings = {
    shiprocket_enabled: true,
    shiprocket_pincode_check: true,
    shiprocket_rate_calculation: true,
    shiprocket_auto_order: true,
    shiprocket_tracking: true,
    shiprocket_pickup_pincode: '110001',
    shiprocket_default_weight: '0.5',
    shiprocket_fixed_shipping_fee: '50',
    shiprocket_free_shipping_threshold: '999',
};

export default function ShiprocketSettingsPage() {
    const [settings, setSettings] = useState<ShiprocketSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('site_config')
                    .select('key, value')
                    .like('key', 'shiprocket_%');

                if (data) {
                    const settingsObj = { ...defaultSettings };
                    data.forEach((row: { key: string; value: string }) => {
                        const key = row.key as keyof ShiprocketSettings;
                        if (key in settingsObj) {
                            if (typeof defaultSettings[key] === 'boolean') {
                                (settingsObj as any)[key] = row.value !== 'false';
                            } else {
                                (settingsObj as any)[key] = row.value;
                            }
                        }
                    });
                    setSettings(settingsObj);
                }
            } catch (err) {
                console.error('Load settings error:', err);
                toast.error('Failed to load Shiprocket settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const supabase = createClient();

            // Upsert each setting
            const entries = Object.entries(settings).map(([key, value]) => ({
                key,
                value: String(value),
            }));

            for (const entry of entries) {
                await supabase
                    .from('site_config')
                    .upsert({ key: entry.key, value: entry.value }, { onConflict: 'key' });
            }

            toast.success('Shiprocket settings saved successfully');
        } catch (err) {
            console.error('Save settings error:', err);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const cardStyle: React.CSSProperties = {
        background: '#fff',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid #f0ece4',
    };

    const toggleStyle = (enabled: boolean): React.CSSProperties => ({
        width: '48px',
        height: '26px',
        borderRadius: '13px',
        background: enabled ? '#00b4d8' : '#e5e7eb',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s',
        border: 'none',
        padding: 0,
        flexShrink: 0,
    });

    const toggleDotStyle = (enabled: boolean): React.CSSProperties => ({
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: '3px',
        left: enabled ? '25px' : '3px',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    });

    const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: (val: boolean) => void; disabled?: boolean }) => (
        <button
            type="button"
            onClick={() => !disabled && onChange(!checked)}
            style={{ ...toggleStyle(checked && !disabled), opacity: disabled ? 0.5 : 1 }}
        >
            <div style={toggleDotStyle(checked && !disabled)} />
        </button>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#00b4d8' }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #00b4d8, #0096b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <Truck size={20} />
                        </div>
                        Shiprocket Integration
                    </h1>
                    <p style={{ color: '#64648b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Configure shipping integration, feature toggles, and defaults
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #00b4d8, #0096b7)', color: '#fff',
                        borderRadius: '0.75rem', fontWeight: 600, border: 'none',
                        cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
                        boxShadow: '0 4px 16px rgba(0,180,216,0.2)',
                        opacity: saving ? 0.7 : 1,
                    }}
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Master Toggle */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Power size={20} style={{ color: settings.shiprocket_enabled ? '#00b4d8' : '#94a3b8' }} />
                            <div>
                                <p style={{ fontWeight: 700, color: '#0a0a23', fontSize: '1rem' }}>Shiprocket Enabled</p>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                    Master toggle — disabling this will revert all features to fallback mode
                                </p>
                            </div>
                        </div>
                        <Toggle
                            checked={settings.shiprocket_enabled}
                            onChange={(val) => setSettings(prev => ({ ...prev, shiprocket_enabled: val }))}
                        />
                    </div>
                </motion.div>

                {/* Feature Toggles */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={cardStyle}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={18} style={{ color: '#00b4d8' }} /> Feature Toggles
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { key: 'shiprocket_pincode_check' as const, icon: <MapPin size={16} />, label: 'Pincode Serviceability Check', desc: 'Show real delivery estimates on product pages' },
                            { key: 'shiprocket_rate_calculation' as const, icon: <Calculator size={16} />, label: 'Dynamic Shipping Rates', desc: 'Calculate shipping cost based on weight & distance at checkout' },
                            { key: 'shiprocket_auto_order' as const, icon: <ShoppingCart size={16} />, label: 'Auto Order Creation', desc: 'Automatically create Shiprocket orders on payment confirmation' },
                            { key: 'shiprocket_tracking' as const, icon: <Eye size={16} />, label: 'Live Order Tracking', desc: 'Show tracking timeline on customer order detail page' },
                        ].map(({ key, icon, label, desc }) => (
                            <div key={key} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem 0', borderBottom: '1px solid #f8f6f2',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: '#94a3b8' }}>{icon}</span>
                                    <div>
                                        <p style={{ fontWeight: 600, color: '#0a0a23', fontSize: '0.9rem' }}>{label}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{desc}</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={settings[key]}
                                    onChange={(val) => setSettings(prev => ({ ...prev, [key]: val }))}
                                    disabled={!settings.shiprocket_enabled}
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Configuration */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={18} style={{ color: '#00b4d8' }} /> Configuration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                Warehouse / Pickup Pincode
                            </label>
                            <input
                                type="text"
                                value={settings.shiprocket_pickup_pincode}
                                onChange={(e) => setSettings(prev => ({ ...prev, shiprocket_pickup_pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                maxLength={6}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                                    border: '1px solid #e5e7eb', fontSize: '0.9rem',
                                    outline: 'none', background: '#fdfbf7',
                                }}
                            />
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                The pincode where orders are shipped from
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                Default Product Weight (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={settings.shiprocket_default_weight}
                                onChange={(e) => setSettings(prev => ({ ...prev, shiprocket_default_weight: e.target.value }))}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                                    border: '1px solid #e5e7eb', fontSize: '0.9rem',
                                    outline: 'none', background: '#fdfbf7',
                                }}
                            />
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Used when a product does not have a weight set
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                Fixed Shipping Fee (₹)
                            </label>
                            <input
                                type="number"
                                value={settings.shiprocket_fixed_shipping_fee}
                                onChange={(e) => setSettings(prev => ({ ...prev, shiprocket_fixed_shipping_fee: e.target.value }))}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                                    border: '1px solid #e5e7eb', fontSize: '0.9rem',
                                    outline: 'none', background: '#fdfbf7',
                                }}
                            />
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Fallback fee when dynamic rates are disabled
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                Free Shipping Threshold (₹)
                            </label>
                            <input
                                type="number"
                                value={settings.shiprocket_free_shipping_threshold}
                                onChange={(e) => setSettings(prev => ({ ...prev, shiprocket_free_shipping_threshold: e.target.value }))}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                                    border: '1px solid #e5e7eb', fontSize: '0.9rem',
                                    outline: 'none', background: '#fdfbf7',
                                }}
                            />
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Orders above this amount get free shipping
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                        background: 'rgba(0,180,216,0.03)', borderRadius: '1rem',
                        padding: '1.25rem', border: '1px solid rgba(0,180,216,0.1)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <CheckCircle size={18} style={{ color: '#00b4d8', flexShrink: 0, marginTop: '0.125rem' }} />
                        <div style={{ fontSize: '0.8rem', color: '#0369a1', lineHeight: 1.7 }}>
                            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>How it works</p>
                            <p>When <strong>Shiprocket is enabled</strong>, the platform will use Shiprocket APIs for pincode checks, shipping rates, and order tracking.</p>
                            <p>When <strong>disabled</strong>, it falls back to the fixed shipping fee and basic pincode validation.</p>
                            <p style={{ marginTop: '0.5rem' }}>Make sure <code>SHIPROCKET_EMAIL</code> and <code>SHIPROCKET_PASSWORD</code> are set in your environment variables.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { MapPin, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PincodeResult {
    available: boolean;
    message?: string;
    area?: string;
    courier_name?: string;
    estimated_delivery_days?: number;
    etd?: string;
    source?: string;
}

export default function PincodeChecker() {
    const [pincode, setPincode] = useState('');
    const [result, setResult] = useState<PincodeResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const handleCheck = async () => {
        if (pincode.length !== 6) return;
        setIsChecking(true);
        setResult(null);

        try {
            const res = await fetch('/api/shiprocket/check-pincode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pincode }),
            });

            const data = await res.json();

            if (data.available) {
                const deliveryText = data.estimated_delivery_days
                    ? `${data.estimated_delivery_days} business days`
                    : data.etd || '5-7 business days';

                setResult({
                    available: true,
                    message: data.area
                        ? `Delivery available to ${data.area}`
                        : 'Delivery available to this pincode',
                    area: data.area,
                    courier_name: data.courier_name,
                    estimated_delivery_days: data.estimated_delivery_days,
                    etd: deliveryText,
                    source: data.source,
                });
            } else {
                setResult({
                    available: false,
                    message: data.message || 'Delivery not available to this pincode.',
                });
            }
        } catch (error) {
            console.error('Pincode check error:', error);
            setResult({
                available: true,
                message: 'Delivery service available. Estimated delivery in 5-7 business days.',
                etd: '5-7 business days',
            });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23' }}>
                <MapPin size={16} style={{ color: '#00b4d8' }} />
                Check Delivery
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type="text"
                        value={pincode}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setPincode(val);
                            setResult(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && pincode.length === 6) {
                                e.preventDefault();
                                handleCheck();
                            }
                        }}
                        placeholder="Enter 6-digit pincode"
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            fontSize: '0.875rem',
                            color: '#0a0a23',
                            outline: 'none',
                            transition: 'all 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#00b4d8'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                </div>
                <button
                    onClick={handleCheck}
                    disabled={pincode.length !== 6 || isChecking}
                    style={{
                        padding: '0.625rem 1.25rem',
                        background: '#0a0a23',
                        color: '#fff',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: pincode.length !== 6 || isChecking ? 'not-allowed' : 'pointer',
                        opacity: pincode.length !== 6 || isChecking ? 0.5 : 1,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                    }}
                >
                    {isChecking ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    {isChecking ? 'Checking...' : 'Check'}
                </button>
            </div>
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: result.available ? '#10b981' : '#ef4444',
                            overflow: 'hidden',
                        }}
                    >
                        {result.available ? (
                            <CheckCircle size={16} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                        ) : (
                            <XCircle size={16} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                        )}
                        <div>
                            <p style={{ fontWeight: 500 }}>{result.message}</p>
                            {result.available && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.375rem' }}>
                                    {result.etd && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                                            <Truck size={12} />
                                            Estimated delivery: {result.etd}
                                        </div>
                                    )}
                                    {result.courier_name && (
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            Courier: {result.courier_name}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        Free shipping on orders above ₹999
                                    </div>
                                </div>
                            )}
                            {!result.available && (
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                    Please verify your pincode or contact us for delivery to your area.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

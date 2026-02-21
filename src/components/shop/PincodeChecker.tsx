'use client';

import { useState } from 'react';
import { MapPin, Truck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PincodeChecker() {
    const [pincode, setPincode] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const handleCheck = () => {
        if (pincode.length !== 6) return;
        setIsChecking(true);
        // Simulated check
        setTimeout(() => {
            setResult('Delivery available! Estimated delivery in 5-7 business days.');
            setIsChecking(false);
        }, 800);
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
                        placeholder="Enter pincode"
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
                    }}
                >
                    {isChecking ? 'Checking...' : 'Check'}
                </button>
            </div>
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: '#10b981', overflow: 'hidden' }}
                    >
                        <CheckCircle size={16} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                        <div>
                            <p style={{ fontWeight: 500 }}>{result}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                <Truck size={12} />
                                Free shipping on orders above ₹999
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

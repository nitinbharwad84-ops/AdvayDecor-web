'use client';

import { useState } from 'react';
import { MapPin, Truck, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PincodeResult {
    status: 'success' | 'error';
    message: string;
    area?: string;
    deliveryDays?: string;
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
            // Use the free India Post Pincode API
            const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await res.json();

            if (data && data[0]) {
                const apiResult = data[0];

                if (apiResult.Status === 'Success' && apiResult.PostOffice && apiResult.PostOffice.length > 0) {
                    const postOffice = apiResult.PostOffice[0];
                    const area = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`;

                    // Determine delivery estimate based on region
                    let deliveryDays = '5-7 business days';
                    const state = postOffice.State?.toLowerCase() || '';

                    // Metro cities - faster delivery
                    const metroCities = ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad'];
                    const district = postOffice.District?.toLowerCase() || '';
                    if (metroCities.some(city => district.includes(city))) {
                        deliveryDays = '3-5 business days';
                    }
                    // Tier 2 states - moderate delivery
                    else if (['maharashtra', 'karnataka', 'tamil nadu', 'gujarat', 'rajasthan', 'uttar pradesh', 'madhya pradesh', 'telangana'].includes(state)) {
                        deliveryDays = '5-7 business days';
                    }
                    // Remote / NE India - longer delivery
                    else if (['arunachal pradesh', 'assam', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'sikkim', 'tripura', 'jammu and kashmir', 'ladakh', 'andaman and nicobar islands', 'lakshadweep'].includes(state)) {
                        deliveryDays = '7-12 business days';
                    }

                    setResult({
                        status: 'success',
                        message: `Delivery available to ${area}`,
                        area,
                        deliveryDays,
                    });
                } else if (apiResult.Status === 'Error') {
                    setResult({
                        status: 'error',
                        message: 'Invalid pincode. Please check and try again.',
                    });
                } else {
                    setResult({
                        status: 'error',
                        message: 'No delivery information found for this pincode.',
                    });
                }
            } else {
                setResult({
                    status: 'error',
                    message: 'Unable to verify pincode. Please try again.',
                });
            }
        } catch (error) {
            console.error('Pincode check error:', error);
            // Fallback if API is unreachable — still allow checkout
            setResult({
                status: 'success',
                message: 'Delivery service available. Estimated delivery in 5-7 business days.',
                deliveryDays: '5-7 business days',
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
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: result.status === 'success' ? '#10b981' : '#ef4444',
                            overflow: 'hidden',
                        }}
                    >
                        {result.status === 'success' ? (
                            <CheckCircle size={16} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                        ) : (
                            <XCircle size={16} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                        )}
                        <div>
                            <p style={{ fontWeight: 500 }}>{result.message}</p>
                            {result.status === 'success' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.375rem' }}>
                                    {result.deliveryDays && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                                            <Truck size={12} />
                                            Estimated delivery: {result.deliveryDays}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        Free shipping on orders above ₹999
                                    </div>
                                </div>
                            )}
                            {result.status === 'error' && (
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                    Please verify your pincode or contact us for delivery to your area.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

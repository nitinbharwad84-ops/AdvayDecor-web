'use client';

import { useState } from 'react';
import { MapPin, Truck, CheckCircle, XCircle, IndianRupee, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface PincodeCheckerProps {
    productWeight?: number;
}

interface PincodeResult {
    status: 'success' | 'error';
    message: string;
    available?: boolean;
    deliveryEstimate?: string;
    estimatedDeliveryDate?: string;
    shippingCost?: number;
    courierName?: string;
    isFree?: boolean;
    freeThreshold?: number;
    source?: string;
}

export default function PincodeChecker({ productWeight }: PincodeCheckerProps) {
    const [pincode, setPincode] = useState('');
    const [result, setResult] = useState<PincodeResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const handleCheck = async () => {
        if (pincode.length !== 6) return;
        setIsChecking(true);
        setResult(null);

        try {
            const res = await fetch('/api/shipping/check-pincode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    delivery_pincode: pincode,
                    weight: productWeight || 0.5,
                    cod: false,
                }),
            });

            const data = await res.json();

            if (data.available) {
                setResult({
                    status: 'success',
                    message: 'Delivery available to this pincode',
                    available: true,
                    deliveryEstimate: data.delivery_estimate || '5-7 business days',
                    estimatedDeliveryDate: data.estimated_delivery_date || null,
                    shippingCost: data.shipping_cost ?? 0,
                    courierName: data.courier_name || null,
                    source: data.source,
                });
            } else {
                setResult({
                    status: 'error',
                    message: data.message || 'Delivery is not available to this pincode.',
                    available: false,
                });
            }
        } catch (error) {
            console.error('Pincode check error:', error);
            // Fallback if API is unreachable
            setResult({
                status: 'success',
                message: 'Delivery service available. Estimated delivery in 5-7 business days.',
                deliveryEstimate: '5-7 business days',
                available: true,
                source: 'fallback',
            });
        } finally {
            setIsChecking(false);
        }
    };

    // Format delivery date nicely
    const formatDeliveryDate = (dateStr: string | undefined): string | null => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
            });
        } catch {
            return null;
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.5rem' }}>
                                    {/* Delivery estimate */}
                                    {result.deliveryEstimate && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#334155' }}>
                                            <Truck size={13} style={{ color: '#00b4d8' }} />
                                            <span style={{ fontWeight: 600 }}>
                                                {result.estimatedDeliveryDate
                                                    ? `Delivery by ${formatDeliveryDate(result.estimatedDeliveryDate) || result.deliveryEstimate}`
                                                    : `Estimated: ${result.deliveryEstimate}`
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {/* Shipping cost */}
                                    {result.shippingCost !== undefined && result.source !== 'fallback' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#334155' }}>
                                            <IndianRupee size={13} style={{ color: '#00b4d8' }} />
                                            <span>
                                                {result.shippingCost === 0
                                                    ? <span style={{ color: '#16a34a', fontWeight: 600 }}>Free Shipping</span>
                                                    : <>Shipping: <span style={{ fontWeight: 600 }}>{formatCurrency(result.shippingCost)}</span></>
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {/* Courier name */}
                                    {result.courierName && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                            <Clock size={12} />
                                            <span>via {result.courierName}</span>
                                        </div>
                                    )}

                                    {/* Free shipping info */}
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>
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

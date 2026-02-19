'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin, CreditCard, CheckCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import type { ShippingAddress } from '@/types';

type Step = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
    const { items, getSubtotal, clearCart } = useCartStore();
    const [step, setStep] = useState<Step>('shipping');
    const [mounted, setMounted] = useState(false);
    const [shippingFee] = useState(50);
    const [address, setAddress] = useState<ShippingAddress>({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [orderId, setOrderId] = useState('');
    const [isPlacing, setIsPlacing] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                    <div style={{ height: '24rem', borderRadius: '1rem', background: '#f5f0e8' }} />
                </div>
            </div>
        );
    }

    const subtotal = getSubtotal();
    const total = subtotal + shippingFee;

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('payment');
    };

    const handlePlaceOrder = async () => {
        setIsPlacing(true);
        try {
            const orderItems = items.map((item) => ({
                product_id: item.product.id,
                variant_id: item.variant?.id || null,
                product_title: item.product.title,
                variant_name: item.variant?.variant_name || null,
                quantity: item.quantity,
                unit_price: item.variant?.price ?? item.product.base_price,
            }));

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guest_info: {
                        name: address.full_name,
                        email: '',
                        phone: address.phone,
                    },
                    shipping_address: address,
                    items: orderItems,
                    payment_method: 'COD',
                    shipping_fee: shippingFee,
                }),
            });

            const data = await res.json();

            if (res.ok && data.order_id) {
                setOrderId(data.order_id.substring(0, 8).toUpperCase());
                setStep('confirmation');
                clearCart();
            } else {
                alert(data.error || 'Failed to place order. Please try again.');
            }
        } catch {
            alert('Something went wrong. Please try again.');
        } finally {
            setIsPlacing(false);
        }
    };

    if (items.length === 0 && step !== 'confirmation') {
        return (
            <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfbf7' }}>
                <div style={{ textAlign: 'center', padding: '0 1.5rem' }}>
                    <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <ShoppingBag size={32} style={{ color: '#9e9eb8' }} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.75rem' }}>No items to checkout</h2>
                    <Link href="/shop" style={{ color: '#00b4d8', textDecoration: 'none' }}>
                        ← Browse products
                    </Link>
                </div>
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid #e8e4dc',
        background: 'rgba(253,251,247,0.5)',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        color: '#0a0a23',
    };

    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '100vh', background: '#fdfbf7' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
                {/* Breadcrumb */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#9e9eb8', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <Link href="/cart" style={{ color: 'inherit', textDecoration: 'none' }}>Cart</Link>
                    <ChevronRight size={14} />
                    <span style={{ color: step === 'shipping' ? '#0a0a23' : 'inherit', fontWeight: step === 'shipping' ? 500 : 400 }}>Shipping</span>
                    <ChevronRight size={14} />
                    <span style={{ color: step === 'payment' ? '#0a0a23' : 'inherit', fontWeight: step === 'payment' ? 500 : 400 }}>Payment</span>
                    <ChevronRight size={14} />
                    <span style={{ color: step === 'confirmation' ? '#0a0a23' : 'inherit', fontWeight: step === 'confirmation' ? 500 : 400 }}>Confirmation</span>
                </nav>

                {/* Step Indicators */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {[
                        { key: 'shipping', icon: MapPin, label: 'Shipping' },
                        { key: 'payment', icon: CreditCard, label: 'Payment' },
                        { key: 'confirmation', icon: CheckCircle, label: 'Done' },
                    ].map((s, i) => {
                        const steps: Step[] = ['shipping', 'payment', 'confirmation'];
                        const currentIndex = steps.indexOf(step);
                        const stepIndex = steps.indexOf(s.key as Step);
                        const isActive = stepIndex <= currentIndex;

                        return (
                            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                    padding: '0.375rem 0.75rem', borderRadius: '9999px',
                                    fontSize: '0.8rem', fontWeight: 500,
                                    background: isActive ? 'rgba(0,180,216,0.08)' : 'transparent',
                                    color: isActive ? '#00b4d8' : '#9e9eb8',
                                }}>
                                    <s.icon size={14} />
                                    <span className="hidden sm:inline">{s.label}</span>
                                </div>
                                {i < 2 && (
                                    <div style={{
                                        width: '1.5rem', height: '2px', margin: '0 0.25rem',
                                        borderRadius: '9999px',
                                        background: stepIndex < currentIndex ? '#00b4d8' : '#e8e4dc',
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '2rem' }}>
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        {/* Shipping Form */}
                        {step === 'shipping' && (
                            <motion.form
                                onSubmit={handleShippingSubmit}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '1rem', background: '#fff', border: '1px solid #f0ece4' }}
                            >
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0a0a23', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={20} style={{ color: '#00b4d8' }} />
                                    Shipping Address
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23', marginBottom: '0.375rem' }}>Full Name *</label>
                                        <input
                                            required
                                            value={address.full_name}
                                            onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
                                            style={inputStyle}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23', marginBottom: '0.375rem' }}>Phone Number *</label>
                                        <input
                                            required
                                            value={address.phone}
                                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                            style={inputStyle}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23', marginBottom: '0.375rem' }}>Address Line 1 *</label>
                                        <input
                                            required
                                            value={address.address_line1}
                                            onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
                                            style={inputStyle}
                                            placeholder="Street address"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23', marginBottom: '0.375rem' }}>Address Line 2</label>
                                        <input
                                            value={address.address_line2}
                                            onChange={(e) => setAddress({ ...address, address_line2: e.target.value })}
                                            style={inputStyle}
                                            placeholder="Apartment, suite, etc."
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23', marginBottom: '0.375rem' }}>City *</label>
                                        <input
                                            required
                                            value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                            style={inputStyle}
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23', marginBottom: '0.375rem' }}>State *</label>
                                        <input
                                            required
                                            value={address.state}
                                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                            style={inputStyle}
                                            placeholder="State"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23', marginBottom: '0.375rem' }}>Pincode *</label>
                                        <input
                                            required
                                            value={address.pincode}
                                            onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                            style={inputStyle}
                                            placeholder="400001"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '2rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.875rem', background: 'linear-gradient(135deg, #00b4d8, #0096b7)', color: '#fff',
                                        borderRadius: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                                        boxShadow: '0 4px 16px rgba(0,180,216,0.2)', fontSize: '0.9rem',
                                    }}
                                >
                                    Continue to Payment
                                    <ChevronRight size={16} />
                                </button>
                            </motion.form>
                        )}

                        {/* Payment Step */}
                        {step === 'payment' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '1rem', background: '#fff', border: '1px solid #f0ece4' }}
                            >
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0a0a23', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CreditCard size={20} style={{ color: '#00b4d8' }} />
                                    Payment Method
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                                        borderRadius: '0.75rem', border: '2px solid #00b4d8', background: 'rgba(0,180,216,0.03)', cursor: 'pointer',
                                    }}>
                                        <input type="radio" name="payment" defaultChecked style={{ accentColor: '#00b4d8' }} />
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#0a0a23', fontSize: '0.9rem' }}>Cash on Delivery (COD)</p>
                                            <p style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>Pay when your order arrives</p>
                                        </div>
                                    </label>

                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                                        borderRadius: '0.75rem', border: '2px solid #e8e4dc', opacity: 0.5, cursor: 'not-allowed',
                                    }}>
                                        <input type="radio" name="payment" disabled style={{ accentColor: '#00b4d8' }} />
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#0a0a23', fontSize: '0.9rem' }}>Online Payment</p>
                                            <p style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>UPI / Card / Netbanking — Coming Soon</p>
                                        </div>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setStep('shipping')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
                                            borderRadius: '0.75rem', border: '1px solid #e8e4dc', background: 'transparent',
                                            color: '#64648b', cursor: 'pointer', fontSize: '0.875rem',
                                        }}
                                    >
                                        <ArrowLeft size={16} />
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isPlacing}
                                        style={{
                                            flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            padding: '0.875rem', background: 'linear-gradient(135deg, #00b4d8, #0096b7)', color: '#fff',
                                            borderRadius: '0.75rem', fontWeight: 600, border: 'none',
                                            cursor: isPlacing ? 'not-allowed' : 'pointer',
                                            boxShadow: '0 4px 16px rgba(0,180,216,0.2)', fontSize: '0.9rem',
                                            opacity: isPlacing ? 0.7 : 1,
                                        }}
                                    >
                                        {isPlacing ? 'Placing Order...' : `Place Order — ${formatCurrency(total)}`}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Confirmation */}
                        {step === 'confirmation' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ padding: 'clamp(2rem, 5vw, 3rem)', borderRadius: '1rem', background: '#fff', border: '1px solid #f0ece4', textAlign: 'center' }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    style={{
                                        width: '5rem', height: '5rem', margin: '0 auto 1.5rem',
                                        borderRadius: '50%', background: 'rgba(34,197,94,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <CheckCircle size={40} style={{ color: '#22c55e' }} />
                                </motion.div>

                                <h2 className="font-[family-name:var(--font-display)]"
                                    style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 700, color: '#0a0a23', marginBottom: '0.75rem' }}>
                                    Order Placed Successfully!
                                </h2>
                                <p style={{ color: '#64648b', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Your order <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0a0a23' }}>{orderId}</span> has been confirmed.
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#9e9eb8', marginBottom: '2rem' }}>
                                    You&apos;ll receive an email confirmation shortly. Estimated delivery in 5-7 business days.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                                    <Link
                                        href="/shop"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            padding: '0.75rem 1.5rem', background: '#00b4d8', color: '#fff',
                                            borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem',
                                        }}
                                    >
                                        Continue Shopping
                                    </Link>
                                    <Link
                                        href="/"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            padding: '0.75rem 1.5rem', border: '1px solid #e8e4dc',
                                            borderRadius: '0.75rem', color: '#64648b', textDecoration: 'none', fontSize: '0.875rem',
                                        }}
                                    >
                                        Back to Home
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    {step !== 'confirmation' && (
                        <div className="lg:col-span-1">
                            <div style={{
                                position: 'sticky', top: 'calc(var(--nav-height, 80px) + 2rem)',
                                padding: '1.5rem', borderRadius: '1rem', background: '#fff', border: '1px solid #f0ece4',
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '1rem' }}>Order Summary</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '16rem', overflowY: 'auto' }}>
                                    {items.map((item) => {
                                        const price = item.variant?.price ?? item.product.base_price;
                                        return (
                                            <div key={`${item.product.id}-${item.variant?.id}`} style={{ display: 'flex', gap: '0.75rem' }}>
                                                <div style={{
                                                    position: 'relative', width: '3.5rem', height: '3.5rem', minWidth: '3.5rem',
                                                    borderRadius: '0.5rem', overflow: 'hidden', background: '#f5f0e8',
                                                }}>
                                                    <Image
                                                        src={item.image || '/placeholder.jpg'}
                                                        alt={item.product.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="56px"
                                                    />
                                                    <span style={{
                                                        position: 'absolute', top: '-4px', right: '-4px',
                                                        width: '1.25rem', height: '1.25rem', background: '#0a0a23',
                                                        color: '#fff', fontSize: '0.6rem', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                                                    }}>
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.title}</p>
                                                    {item.variant && (
                                                        <p style={{ fontSize: '0.7rem', color: '#9e9eb8' }}>{item.variant.variant_name}</p>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', whiteSpace: 'nowrap' }}>
                                                    {formatCurrency(price * item.quantity)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ borderTop: '1px solid #f0ece4', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                        <span style={{ color: '#64648b' }}>Subtotal</span>
                                        <span style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                        <span style={{ color: '#64648b' }}>Shipping</span>
                                        <span style={{ fontWeight: 500 }}>{formatCurrency(shippingFee)}</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid #f0ece4', paddingTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600, color: '#0a0a23' }}>Total</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0a23' }}>{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

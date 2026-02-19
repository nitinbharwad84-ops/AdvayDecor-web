'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
    const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
    const [mounted, setMounted] = useState(false);

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

    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '100vh', background: '#fdfbf7' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-[family-name:var(--font-display)]"
                    style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#0a0a23', marginBottom: '2rem' }}
                >
                    Shopping Bag
                </motion.h1>

                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '4rem 1rem' }}
                    >
                        <div style={{
                            width: '5rem', height: '5rem', borderRadius: '50%', background: '#f5f0e8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                        }}>
                            <ShoppingBag size={36} style={{ color: '#9e9eb8' }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.75rem' }}>Your bag is empty</h2>
                        <p style={{ color: '#64648b', marginBottom: '2rem', maxWidth: '28rem', margin: '0 auto 2rem', fontSize: '0.9rem' }}>
                            Looks like you haven&apos;t added anything yet. Explore our collection to find something you&apos;ll love.
                        </p>
                        <Link
                            href="/shop"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', background: '#00b4d8', color: '#fff',
                                borderRadius: '9999px', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem',
                            }}
                        >
                            <ArrowLeft size={16} />
                            Continue Shopping
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '2rem' }}>
                        {/* Items List */}
                        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => {
                                    const price = item.variant?.price ?? item.product.base_price;
                                    const itemKey = `${item.product.id}-${item.variant?.id || 'base'}`;

                                    return (
                                        <motion.div
                                            key={itemKey}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            style={{
                                                display: 'flex', gap: '1rem', padding: '1rem',
                                                borderRadius: '1rem', background: '#fff',
                                                border: '1px solid #f0ece4', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                                            }}
                                        >
                                            {/* Image */}
                                            <div style={{
                                                position: 'relative', width: '80px', height: '80px', minWidth: '80px',
                                                borderRadius: '0.75rem', overflow: 'hidden', background: '#f5f0e8',
                                            }}>
                                                <Image
                                                    src={item.image || '/placeholder.jpg'}
                                                    alt={item.product.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ minWidth: 0 }}>
                                                        <Link href={`/product/${item.product.slug}`} style={{ textDecoration: 'none' }}>
                                                            <h3 style={{
                                                                fontWeight: 600, color: '#0a0a23', fontSize: '0.9rem',
                                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                            }}>
                                                                {item.product.title}
                                                            </h3>
                                                        </Link>
                                                        {item.variant && (
                                                            <p style={{ fontSize: '0.75rem', color: '#9e9eb8', marginTop: '0.125rem' }}>
                                                                Variant: {item.variant.variant_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.product.id, item.variant?.id || null)}
                                                        style={{
                                                            padding: '0.375rem', color: '#9e9eb8', background: 'transparent',
                                                            border: 'none', cursor: 'pointer', borderRadius: '0.5rem', flexShrink: 0,
                                                        }}
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                                                    {/* Quantity */}
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                        background: '#f5f0e8', borderRadius: '0.75rem', padding: '0.25rem',
                                                    }}>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.variant?.id || null, item.quantity - 1)}
                                                            style={{
                                                                width: '28px', height: '28px', borderRadius: '0.5rem',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                background: 'transparent', border: 'none', cursor: 'pointer',
                                                            }}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span style={{ width: '2rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.variant?.id || null, item.quantity + 1)}
                                                            style={{
                                                                width: '28px', height: '28px', borderRadius: '0.5rem',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                background: 'transparent', border: 'none', cursor: 'pointer',
                                                            }}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a23' }}>
                                                        {formatCurrency(price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    position: 'sticky', top: 'calc(var(--nav-height, 80px) + 2rem)',
                                    padding: '1.5rem', borderRadius: '1rem', background: '#fff',
                                    border: '1px solid #f0ece4', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                                }}
                            >
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '1.5rem' }}>Order Summary</h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#64648b' }}>Subtotal</span>
                                        <span style={{ fontWeight: 500, color: '#0a0a23' }}>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#64648b' }}>Shipping</span>
                                        <span style={{ color: '#22c55e', fontWeight: 500 }}>Calculated at checkout</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid #f0ece4', paddingTop: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600, color: '#0a0a23' }}>Estimated Total</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0a23' }}>{formatCurrency(subtotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                                        color: '#fff', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none',
                                        boxShadow: '0 4px 16px rgba(0,180,216,0.2)', fontSize: '0.9rem',
                                    }}
                                >
                                    Proceed to Checkout
                                    <ArrowRight size={16} />
                                </Link>

                                <Link
                                    href="/shop"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        width: '100%', marginTop: '0.75rem', padding: '0.75rem',
                                        color: '#64648b', textDecoration: 'none', fontSize: '0.8rem',
                                    }}
                                >
                                    <ArrowLeft size={14} />
                                    Continue Shopping
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

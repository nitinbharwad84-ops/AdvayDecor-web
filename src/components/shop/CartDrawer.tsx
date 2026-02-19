'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function CartDrawer() {
    const { items, isCartOpen, closeCart, updateQuantity, removeItem, getSubtotal } = useCartStore();

    useEffect(() => {
        document.body.style.overflow = isCartOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isCartOpen]);

    const subtotal = getSubtotal();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
                    {/* Backdrop */}
                    <motion.div
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(10,10,35,0.5)',
                            backdropFilter: 'blur(4px)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                    />

                    {/* Drawer — full width on tiny screens, max-w on larger */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            height: '100%',
                            width: '100%',
                            maxWidth: '400px',
                            background: '#fdfbf7',
                            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '1rem 1.25rem', borderBottom: '1px solid #f0ece4',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <ShoppingBag size={18} style={{ color: '#0a0a23' }} />
                                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a23' }}>Shopping Bag</h2>
                                <span style={{ fontSize: '0.8rem', color: '#9e9eb8' }}>({items.length})</span>
                            </div>
                            <button
                                onClick={closeCart}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(10,10,35,0.04)', border: 'none', cursor: 'pointer', color: '#0a0a23',
                                }}
                                aria-label="Close cart"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Items */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {items.length === 0 ? (
                                <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    height: '100%', gap: '1rem', padding: '1.5rem',
                                }}>
                                    <div style={{
                                        width: '5rem', height: '5rem', borderRadius: '50%', background: '#f5f0e8',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <ShoppingBag size={28} style={{ color: '#9e9eb8' }} />
                                    </div>
                                    <p style={{ fontWeight: 500, color: '#64648b' }}>Your bag is empty</p>
                                    <p style={{ fontSize: '0.8rem', color: '#9e9eb8', textAlign: 'center' }}>
                                        Discover our curated collection and add something beautiful to your space.
                                    </p>
                                    <Link
                                        href="/shop"
                                        onClick={closeCart}
                                        style={{
                                            marginTop: '0.5rem', padding: '0.5rem 1.25rem',
                                            background: '#00b4d8', color: '#fff', borderRadius: '9999px',
                                            fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none',
                                        }}
                                    >
                                        Explore Collection
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                                                    exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                                                    style={{
                                                        display: 'flex', gap: '0.75rem', padding: '0.75rem',
                                                        borderRadius: '0.75rem', background: '#fff', border: '1px solid #f0ece4',
                                                    }}
                                                >
                                                    {/* Image */}
                                                    <div style={{
                                                        position: 'relative', width: '64px', height: '64px', minWidth: '64px',
                                                        borderRadius: '0.5rem', overflow: 'hidden', background: '#f5f0e8',
                                                    }}>
                                                        <Image
                                                            src={item.image || '/placeholder.jpg'}
                                                            alt={item.product.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="64px"
                                                        />
                                                    </div>

                                                    {/* Details */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h4 style={{
                                                            fontSize: '0.8rem', fontWeight: 500, color: '#0a0a23',
                                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                        }}>
                                                            {item.product.title}
                                                        </h4>
                                                        {item.variant && (
                                                            <p style={{ fontSize: '0.7rem', color: '#9e9eb8', marginTop: '0.125rem' }}>
                                                                {item.variant.variant_name}
                                                            </p>
                                                        )}
                                                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginTop: '0.25rem' }}>
                                                            {formatCurrency(price)}
                                                        </p>

                                                        {/* Quantity Controls */}
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                                            <div style={{
                                                                display: 'flex', alignItems: 'center', gap: '0.125rem',
                                                                background: '#f5f0e8', borderRadius: '9999px', padding: '0.125rem',
                                                            }}>
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, item.variant?.id || null, item.quantity - 1)}
                                                                    style={{
                                                                        width: '24px', height: '24px', borderRadius: '50%',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    <Minus size={10} />
                                                                </button>
                                                                <span style={{ width: '1.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, item.variant?.id || null, item.quantity + 1)}
                                                                    style={{
                                                                        width: '24px', height: '24px', borderRadius: '50%',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    <Plus size={10} />
                                                                </button>
                                                            </div>

                                                            <button
                                                                onClick={() => removeItem(item.product.id, item.variant?.id || null)}
                                                                style={{
                                                                    padding: '0.375rem', color: '#9e9eb8', background: 'transparent',
                                                                    border: 'none', cursor: 'pointer',
                                                                }}
                                                                aria-label="Remove item"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div style={{
                                borderTop: '1px solid #f0ece4', padding: '1.25rem',
                                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64648b' }}>Subtotal</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23' }}>
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#9e9eb8' }}>
                                    Shipping & taxes calculated at checkout
                                </p>
                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        width: '100%', padding: '0.875rem',
                                        background: 'linear-gradient(135deg, #00b4d8, #0096b7)', color: '#fff',
                                        borderRadius: '9999px', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem',
                                        boxShadow: '0 4px 16px rgba(0,180,216,0.2)',
                                    }}
                                >
                                    Checkout
                                    <ArrowRight size={16} />
                                </Link>
                                <button
                                    onClick={closeCart}
                                    style={{
                                        width: '100%', textAlign: 'center', fontSize: '0.8rem',
                                        color: '#64648b', padding: '0.5rem', background: 'transparent',
                                        border: 'none', cursor: 'pointer',
                                    }}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

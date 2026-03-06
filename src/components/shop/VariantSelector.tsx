'use client';

import { motion } from 'framer-motion';
import type { ProductVariant } from '@/types';

interface VariantSelectorProps {
    variants: ProductVariant[];
    selectedVariant: ProductVariant | null;
    onSelect: (variant: ProductVariant) => void;
}

export default function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
    if (variants.length === 0) return null;

    return (
        <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.75rem' }}>
                Select Variant
                {selectedVariant && (
                    <span style={{ fontWeight: 400, color: '#64748b', marginLeft: '0.5rem' }}>
                        — {selectedVariant.variant_name}
                    </span>
                )}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = variant.stock_quantity <= 0;

                    return (
                        <motion.button
                            key={variant.id}
                            onClick={() => !isOutOfStock && onSelect(variant)}
                            disabled={isOutOfStock}
                            style={{
                                position: 'relative',
                                padding: '0.5rem 1.25rem',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                border: `2px solid ${isSelected ? '#0a0a23' : isOutOfStock ? '#e5e7eb' : '#e5e7eb'}`,
                                background: isSelected ? '#0a0a23' : isOutOfStock ? '#f8fafc' : '#fff',
                                color: isSelected ? '#fff' : isOutOfStock ? '#94a3b8' : '#0a0a23',
                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                opacity: isOutOfStock ? 0.6 : 1,
                                textDecoration: isOutOfStock ? 'line-through' : 'none',
                                transition: 'all 0.2s ease',
                                outline: 'none',
                            }}
                            whileHover={!isOutOfStock && !isSelected ? { borderColor: '#cbd5e1' } : undefined}
                            whileTap={!isOutOfStock ? { scale: 0.97 } : undefined}
                        >
                            {variant.variant_name}
                            {isSelected && (
                                <motion.div
                                    style={{
                                        position: 'absolute', top: '-0.3rem', right: '-0.3rem', width: '1rem', height: '1rem',
                                        background: '#00b4d8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 0 0 2px #fff'
                                    }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                >
                                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

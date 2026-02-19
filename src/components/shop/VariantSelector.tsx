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
        <div>
            <label className="block text-sm font-medium text-navy mb-3">
                Select Variant
                {selectedVariant && (
                    <span className="text-text-muted font-normal ml-2">
                        — {selectedVariant.variant_name}
                    </span>
                )}
            </label>
            <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = variant.stock_quantity <= 0;

                    return (
                        <motion.button
                            key={variant.id}
                            onClick={() => !isOutOfStock && onSelect(variant)}
                            disabled={isOutOfStock}
                            className={`
                relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border-2
                ${isSelected
                                    ? 'bg-navy text-white border-navy shadow-md'
                                    : isOutOfStock
                                        ? 'bg-cream-dark text-text-muted border-border cursor-not-allowed opacity-50 line-through'
                                        : 'bg-white text-navy border-border hover:border-navy/30 hover:shadow-sm'
                                }
              `}
                            whileHover={!isOutOfStock ? { scale: 1.03 } : undefined}
                            whileTap={!isOutOfStock ? { scale: 0.97 } : undefined}
                        >
                            {variant.variant_name}
                            {isSelected && (
                                <motion.div
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-cyan rounded-full flex items-center justify-center"
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

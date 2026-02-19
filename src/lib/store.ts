'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/types';

interface CartStore {
    items: CartItem[];
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    addItem: (product: Product, variant: ProductVariant | null, image: string) => void;
    removeItem: (productId: string, variantId: string | null) => void;
    updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
    clearCart: () => void;
    getItemCount: () => number;
    getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isCartOpen: false,

            openCart: () => set({ isCartOpen: true }),
            closeCart: () => set({ isCartOpen: false }),
            toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

            addItem: (product, variant, image) => {
                const items = get().items;
                const existingIndex = items.findIndex(
                    (item) =>
                        item.product.id === product.id &&
                        (item.variant?.id || null) === (variant?.id || null)
                );

                if (existingIndex > -1) {
                    const newItems = [...items];
                    newItems[existingIndex].quantity += 1;
                    set({ items: newItems, isCartOpen: true });
                } else {
                    set({
                        items: [...items, { product, variant, quantity: 1, image }],
                        isCartOpen: true,
                    });
                }
            },

            removeItem: (productId, variantId) => {
                set({
                    items: get().items.filter(
                        (item) =>
                            !(item.product.id === productId &&
                                (item.variant?.id || null) === (variantId || null))
                    ),
                });
            },

            updateQuantity: (productId, variantId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId, variantId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.product.id === productId &&
                            (item.variant?.id || null) === (variantId || null)
                            ? { ...item, quantity }
                            : item
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            getItemCount: () => {
                return get().items.reduce((acc, item) => acc + item.quantity, 0);
            },

            getSubtotal: () => {
                return get().items.reduce((acc, item) => {
                    const price = item.variant?.price ?? item.product.base_price;
                    return acc + price * item.quantity;
                }, 0);
            },
        }),
        {
            name: 'advaydecor-cart',
            partialize: (state) => ({ items: state.items }),
        }
    )
);

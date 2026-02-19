'use client';

import { motion } from 'framer-motion';

interface StockIndicatorProps {
    quantity: number;
}

export default function StockIndicator({ quantity }: StockIndicatorProps) {
    if (quantity <= 0) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-sm font-medium text-danger">Out of Stock</span>
            </div>
        );
    }

    if (quantity < 5) {
        return (
            <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="w-2 h-2 rounded-full bg-danger animate-pulse-stock" />
                <span className="text-sm font-medium text-danger">
                    Only {quantity} left!
                </span>
            </motion.div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm font-medium text-success">In Stock</span>
        </div>
    );
}

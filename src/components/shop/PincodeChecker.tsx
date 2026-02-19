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
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-navy">
                <MapPin size={16} className="text-cyan" />
                Check Delivery
            </div>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={pincode}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setPincode(val);
                            setResult(null);
                        }}
                        placeholder="Enter pincode"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-navy placeholder:text-text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/10 transition-all"
                    />
                </div>
                <button
                    onClick={handleCheck}
                    disabled={pincode.length !== 6 || isChecking}
                    className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
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
                        className="flex items-start gap-2 text-sm text-success"
                    >
                        <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">{result}</p>
                            <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
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

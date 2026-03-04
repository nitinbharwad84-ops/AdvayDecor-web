'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-[#fdfbf7]">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="relative inline-block">
                        <span className="text-[120px] font-bold text-[#00b4d8] leading-none opacity-10">404</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Search className="w-16 h-16 text-[#00b4d8]" />
                        </div>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl font-bold text-[#0a0a23] mb-4"
                >
                    Lost in the Decor?
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-[#64648b] mb-10 leading-relaxed"
                >
                    The page you are looking for seems to have moved or doesn't exist.
                    Let's find your way back to something beautiful.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#00b4d8] text-white rounded-full font-semibold hover:bg-[#0077b6] transition-all shadow-lg hover:shadow-[#00b4d8]/20"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-[#0a0a23] border border-[#e8e4dc] rounded-full font-semibold hover:bg-[#fdfbf7] transition-all"
                    >
                        <ArrowLeft size={18} />
                        Explore Shop
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 pt-8 border-t border-[#f0ece4] text-sm text-[#9e9eb8]"
                >
                    If you believe this is a technical error,
                    please contact us at <span className="text-[#00b4d8]">hello@advaydecor.com</span>
                </motion.div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserAuthStore } from '@/lib/auth-store';

const defaultFaqs = [
    {
        question: 'How long does shipping normally take?',
        answer: 'Standard shipping within India generally takes 5-7 business days. Express options are available at checkout taking 2-3 business days. Please refer to our Shipping Policy for international shipments and full details.',
    },
    {
        question: 'Do you offer cash on delivery (COD)?',
        answer: 'Yes, we offer Cash on Delivery (COD) for most pin codes across India for orders below ₹10,000.',
    },
    {
        question: 'Can I return an item if I change my mind?',
        answer: 'Absolutely. We offer a 5-day return window from the day of delivery. As long as the item is unused and in its original packaging, we will gladly accept the return. Custom items are excluded.',
    },
    {
        question: 'Are the product colors accurate to the photos?',
        answer: 'We try our best to ensure accurate photography. However, due to varying screen calibrations and lighting conditions, the actual product color might differ slightly from what you see on your screen.',
    },
    {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you will receive a tracking link via email. You can also log into your Advay Decor user profile dashboard to track your live order status.',
    },
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUserAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/faq/question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    question: formData.message,
                    user_id: user?.id || null
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit question');

            toast.success('Question submitted! Our team will reply shortly. Check your profile for answers.');
            setFormData({ name: '', email: '', message: '' });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error submitting question. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '100vh', background: '#fdfbf7' }}>
            {/* Page Header */}
            <section style={{
                position: 'relative',
                background: 'linear-gradient(145deg, #0a0a23, #1a1a3e)',
                padding: '4rem 0 5rem',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                }} />

                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: '#00b4d8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}
                    >
                        Learn More
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#fff', marginTop: '0.75rem', marginBottom: '1rem' }}
                    >
                        Frequently Asked Questions
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}
                    >
                        Everything you need to know about our home decor products, orders, shipping, and returns.
                    </motion.p>
                </div>
            </section>

            {/* Accordion List */}
            <section style={{ padding: '4rem 0 3rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {defaultFaqs.map((faq, index) => (
                            <div
                                key={index}
                                style={{
                                    background: '#fff',
                                    borderRadius: '1rem',
                                    border: '1px solid #f0ece4',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                }}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                >
                                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a23' }}>
                                        {faq.question}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown size={20} style={{ color: '#00b4d8' }} />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: '0 1.5rem 1.5rem', fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, borderTop: '1px solid #f9f8f6', paddingTop: '1rem' }}>
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Ask a Question Form */}
            <section style={{ padding: '1rem 0 6rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>

                    <div style={{
                        background: '#fff',
                        borderRadius: '1.5rem',
                        padding: '3rem',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                        border: '1px solid #f0ece4',
                    }}>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,180,216,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                            }}>
                                <MessageCircle size={24} style={{ color: '#00b4d8' }} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem' }}>Still have questions?</h2>
                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Ask us directly and we'll reply to your profile dashboard.</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Your name"
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                            border: '1px solid #e8e4dc', background: '#fdfbf7', fontSize: '0.875rem', outline: 'none',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#00b4d8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e8e4dc'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="you@example.com"
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                            border: '1px solid #e8e4dc', background: '#fdfbf7', fontSize: '0.875rem', outline: 'none',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#00b4d8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e8e4dc'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                    Your Custom Question *
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    rows={4}
                                    placeholder="Type your question here..."
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                        border: '1px solid #e8e4dc', background: '#fdfbf7', fontSize: '0.875rem',
                                        outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#00b4d8'}
                                    onBlur={(e) => e.target.style.borderColor = '#e8e4dc'}
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    padding: '0.875rem', background: '#0a0a23', color: '#fff', borderRadius: '0.75rem',
                                    fontWeight: 600, fontSize: '0.9rem', border: 'none', marginTop: '0.5rem',
                                    cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1,
                                }}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                {isLoading ? 'Submitting...' : 'Submit Question'}
                                {!isLoading && <Send size={16} />}
                            </motion.button>
                        </form>

                    </div>
                </div>
            </section>
        </div>
    );
}

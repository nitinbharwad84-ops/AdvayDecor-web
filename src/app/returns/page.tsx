'use client';

import { motion } from 'framer-motion';
import { RotateCcw, PackageCheck, Banknote, HelpCircle, Mail, AlertTriangle } from 'lucide-react';

export default function ReturnsPolicyPage() {
    const sections = [
        {
            icon: RotateCcw,
            title: '5-Day Return Policy',
            content: 'We offer a hassle-free 5-day return policy. If you are not completely satisfied with your purchase, you can request a return within 5 days of receiving your item. The item must be unused, in its original condition, and with all tags and original packaging intact.',
        },
        {
            icon: PackageCheck,
            title: 'How to Initiate a Return',
            content: 'To start a return, simply contact us at hello@advaydecor.com with your order number and the reason for your return. We will provide you with a return authorization and instructions on how and where to send your package.',
        },
        {
            icon: AlertTriangle,
            title: 'Damaged or Defective Items',
            content: 'Please inspect your order upon reception. If the item is defective, damaged, or if you received the wrong item, contact us immediately so we can evaluate the issue and make it right. Such cases are eligible for an immediate replacement or full refund.',
        },
        {
            icon: Banknote,
            title: 'Refunds Processing',
            content: 'Once we receive and inspect your return, we will let you know if the refund was approved. If approved, you\'ll be automatically refunded on your original payment method within 3-5 business days. Please remember it can take some time for your bank or credit card company to process and post the refund.',
        },
        {
            icon: HelpCircle,
            title: 'Non-Returnable Items',
            content: 'Certain types of items cannot be returned, like custom-made or personalized products, as well as items marked as "Final Sale". Please get in touch if you have questions or concerns about your specific item.',
        },
        {
            icon: Mail,
            title: 'Product Exchanges',
            content: 'The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item. Contact our support team to help expedite this process.',
        },
    ];

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
                        Policies
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#fff', marginTop: '0.75rem', marginBottom: '1rem' }}
                    >
                        Returns & Exchanges
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}
                    >
                        We stand behind our products. Here is our straightforward guide on returns, exchanges, and refunds.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section style={{ padding: '4rem 0 6rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>

                    <div style={{
                        background: '#fff',
                        borderRadius: '1.5rem',
                        padding: '3rem',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                        border: '1px solid #f0ece4',
                    }}>

                        <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.8, marginBottom: '3rem' }}>
                            Your satisfaction is our priority at Advay Decor. If you're not completely in love with your purchase, we're here to help you return or exchange it smoothly. Please review our policies below to understand how the process works.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {sections.map((section, idx) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,180,216,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <section.icon size={18} style={{ color: '#00b4d8' }} />
                                        </div>
                                        {section.title}
                                    </h3>
                                    <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, paddingLeft: '3.5rem' }}>
                                        {section.content}
                                    </p>

                                    {idx !== sections.length - 1 && (
                                        <div style={{ height: '1px', background: '#f0ece4', marginTop: '3rem', marginLeft: '3.5rem' }} />
                                    )}
                                </motion.div>
                            ))}
                        </div>

                    </div>

                    {/* Support Contact Prompt */}
                    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                            Need help initiating a return?
                        </p>
                        <a href="/contact" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem', background: '#e0f2fe', color: '#0284c7',
                            fontWeight: 600, fontSize: '0.9rem', borderRadius: '2rem', textDecoration: 'none',
                        }}>
                            Contact Customer Support
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

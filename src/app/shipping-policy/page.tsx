'use client';

import { motion } from 'framer-motion';
import { Truck, Clock, ShieldCheck, MapPin, Inbox, AlertCircle } from 'lucide-react';

export default function ShippingPolicyPage() {
    const sections = [
        {
            icon: Truck,
            title: 'Shipping Methods & Timelines',
            content: 'We offer standard and express shipping options. Standard shipping generally takes 5-7 business days within India. Express shipping is delivered within 2-3 business days. Delivery times are calculated from the moment your order is dispatched from our warehouse.',
        },
        {
            icon: MapPin,
            title: 'Shipping Destinations',
            content: 'We currently ship anywhere within India. For our international customers, please contact us directly at hello@advaydecor.com for special shipping arrangements and custom duty calculations.',
        },
        {
            icon: Clock,
            title: 'Order Processing',
            content: 'All orders are processed and shipped within 1-2 business days (excluding weekends and holidays). You will receive another notification when your order has shipped, complete with a tracking number.',
        },
        {
            icon: ShieldCheck,
            title: 'Secure Packaging',
            content: 'Every item is carefully verified and packaged securely to withstand transportation. We use eco-friendly and sturdy materials to ensure your fragile decor pieces arrive safely at your doorstep without any damage.',
        },
        {
            icon: Inbox,
            title: 'Tracking Your Order',
            content: 'Once your order has been dispatched, we will send you a confirmation email with a unique tracking ID. You can track your package directly on our logistics partner\'s website or through your Advay Decor user profile dashboard.',
        },
        {
            icon: AlertCircle,
            title: 'Delays & Issues',
            content: 'While we strive to meet all delivery timelines, please note that shipping might occasionally be delayed due to unforeseen circumstances like extreme weather conditions or regional logistical constraints. If your order shows a significant delay, our support team will actively assist you.',
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
                        Shipping Policy
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}
                    >
                        Everything you need to know about our shipping methods, timelines, and guarantees for your beautiful decor pieces.
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
                            At Advay Decor, we want your shopping experience to be as seamless and delightful as the products we craft. Below, you will find detailed information on how we process, handle, and ship your orders to ensure they reach you securely and swiftly.
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
                            Still have questions about your delivery?
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

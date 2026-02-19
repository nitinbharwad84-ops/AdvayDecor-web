'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        toast.success('Message sent! We\'ll get back to you within 24 hours.');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setIsLoading(false);
    };

    const contactInfo = [
        { icon: Mail, label: 'hello@advaydecor.com', sub: 'We reply within 24 hours' },
        { icon: Phone, label: '+91 98765 43210', sub: 'Mon-Sat, 10am–7pm IST' },
        { icon: MapPin, label: 'Mumbai, Maharashtra', sub: 'India' },
        { icon: Clock, label: 'Mon - Sat', sub: '10:00 AM - 7:00 PM IST' },
    ];

    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)' }}>
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
                        Get in Touch
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#fff', marginTop: '0.75rem', marginBottom: '1rem' }}
                    >
                        Contact Us
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}
                    >
                        We&apos;d love to hear from you. Drop us a message and we&apos;ll respond within 24 hours.
                    </motion.p>
                </div>
            </section>

            {/* Contact Content */}
            <section style={{ padding: '4rem 0 5rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: '3rem' }}>
                        {/* Left - Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <h2
                                className="font-[family-name:var(--font-display)]"
                                style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem' }}
                            >
                                Let&apos;s Connect
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: '#64648b', lineHeight: 1.7, marginBottom: '2rem' }}>
                                Whether you have a question about our products, need help with an order, or just want to say hello — we&apos;re here for you.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {contactInfo.map((item) => (
                                    <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, rgba(0,180,216,0.08), rgba(0,180,216,0.03))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <item.icon size={18} style={{ color: '#00b4d8' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23' }}>{item.label}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right - Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-3"
                        >
                            <form onSubmit={handleSubmit} style={{
                                padding: '2rem',
                                borderRadius: '1.25rem',
                                background: '#ffffff',
                                border: '1px solid #f0ece4',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                            }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0a0a23', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Send size={18} style={{ color: '#00b4d8' }} />
                                    Send a Message
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
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
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.75rem',
                                                border: '1px solid #e8e4dc',
                                                background: '#fdfbf7',
                                                fontSize: '0.875rem',
                                                outline: 'none',
                                                transition: 'all 0.2s',
                                            }}
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
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.75rem',
                                                border: '1px solid #e8e4dc',
                                                background: '#fdfbf7',
                                                fontSize: '0.875rem',
                                                outline: 'none',
                                                transition: 'all 0.2s',
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.75rem',
                                            border: '1px solid #e8e4dc',
                                            background: '#fdfbf7',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                        Message *
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        rows={5}
                                        placeholder="Tell us how we can help..."
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.75rem',
                                            border: '1px solid #e8e4dc',
                                            background: '#fdfbf7',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            resize: 'vertical',
                                            transition: 'all 0.2s',
                                            fontFamily: 'inherit',
                                        }}
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group"
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.875rem',
                                        background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                                        color: '#fff',
                                        borderRadius: '0.75rem',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        border: 'none',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.7 : 1,
                                        boxShadow: '0 4px 16px rgba(0,180,216,0.25)',
                                        transition: 'all 0.3s ease',
                                    }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    {isLoading ? (
                                        <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    ) : (
                                        <>
                                            Send Message
                                            <Send size={16} />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}

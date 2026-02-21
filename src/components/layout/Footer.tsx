'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, Heart } from 'lucide-react';

const footerLinks = {
    shop: [
        { name: 'Cushions', href: '/shop' },
        { name: 'New Arrivals', href: '/shop' },
        { name: 'Best Sellers', href: '/shop' },
    ],
    company: [
        { name: 'Our Story', href: '/story' },
        { name: 'Contact Us', href: '/contact' },
    ],
    support: [
        { name: 'Shipping Policy', href: '/pages/shipping-policy' },
        { name: 'Returns & Exchanges', href: '/pages/returns-exchanges' },
        { name: 'FAQ', href: '/pages/faq' },
    ],
};

const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
];

export default function Footer() {
    return (
        <footer style={{ background: 'linear-gradient(180deg, #0a0a23, #070718)', color: 'rgba(255,255,255,0.8)' }}>
            {/* Main Footer */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '3rem' }}>
                    {/* Brand Column */}
                    <div>
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', textDecoration: 'none' }}>
                            <Image
                                src="/logo.png"
                                alt="Advay Decor"
                                width={36}
                                height={36}
                                style={{ objectFit: 'contain' }}
                            />
                            <span className="font-[family-name:var(--font-display)]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                <span style={{ color: '#fff' }}>Advay</span>
                                <span style={{ color: '#00b4d8' }}>Decor</span>
                            </span>
                        </Link>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                            Elevate your space with elegance & style. Curated home decor that brings warmth and personality to every corner.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'rgba(255,255,255,0.4)',
                                        transition: 'all 0.3s ease',
                                    }}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={social.label}
                                >
                                    <social.icon size={16} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Shop</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {footerLinks.shop.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s', textDecoration: 'none' }}>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company + Support Links */}
                    <div>
                        <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s', textDecoration: 'none' }}>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2rem', marginBottom: '1.25rem' }}>Support</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s', textDecoration: 'none' }}>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Get in Touch</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <MapPin size={16} style={{ color: '#00b4d8', marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Mumbai, Maharashtra, India</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Phone size={16} style={{ color: '#00b4d8', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>+91 98765 43210</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Mail size={16} style={{ color: '#00b4d8', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>hello@advaydecor.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                }}>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                        © 2026 AdvayDecor. All rights reserved.
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Made with <Heart size={10} style={{ color: '#ef4444', fill: '#ef4444' }} /> in India
                    </p>
                </div>
            </div>
        </footer>
    );
}

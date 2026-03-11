'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FileText,
    BarChart3,
    Search,
    Map,
    Settings,
    ArrowRight,
    Globe,
    TrendingUp,
    Loader2,
} from 'lucide-react';

const quickLinks = [
    { name: 'Page Metadata', href: '/seo/metadata', icon: FileText, color: '#22c55e', desc: 'Manage titles, descriptions & keywords' },
    { name: 'Analytics', href: '/seo/analytics', icon: BarChart3, color: '#3b82f6', desc: 'Google Analytics & tracking' },
    { name: 'Search Console', href: '/seo/search-console', icon: Search, color: '#f59e0b', desc: 'Indexing & search performance' },
    { name: 'Sitemap', href: '/seo/sitemap-view', icon: Map, color: '#8b5cf6', desc: 'View sitemap URLs' },
    { name: 'Settings', href: '/seo/settings', icon: Settings, color: '#64748b', desc: 'Tracking IDs & configuration' },
];

interface SeoStats {
    pagesConfigured: number;
    totalKeywords: number;
    lastUpdated: string | null;
}

export default function SeoDashboardPage() {
    const [stats, setStats] = useState<SeoStats>({ pagesConfigured: 0, totalKeywords: 0, lastUpdated: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/seo/metadata')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    const pages = data.pages || [];
                    const totalKw = pages.reduce((sum: number, p: any) =>
                        sum + (p.keywords ? p.keywords.split(',').filter(Boolean).length : 0), 0);
                    const lastDate = pages
                        .map((p: any) => p.updated_at)
                        .filter(Boolean)
                        .sort()
                        .pop();
                    setStats({
                        pagesConfigured: pages.length,
                        totalKeywords: totalKw,
                        lastUpdated: lastDate || null,
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const cardStyle: React.CSSProperties = {
        padding: '1.5rem', borderRadius: '1rem', background: '#ffffff', border: '1px solid #e0e8e0',
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Globe size={14} style={{ color: '#22c55e' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>SEO Dashboard</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a1a0a' }}>Overview</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7c6b', marginTop: '0.25rem' }}>Manage your site&apos;s SEO, analytics, and search presence.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Pages Configured', value: loading ? '...' : stats.pagesConfigured, icon: FileText, color: '#22c55e' },
                    { label: 'Total Keywords', value: loading ? '...' : stats.totalKeywords, icon: TrendingUp, color: '#3b82f6' },
                    { label: 'Last Updated', value: loading ? '...' : (stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Never'), icon: Globe, color: '#f59e0b' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={cardStyle}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '0.5rem',
                                background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}08)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <stat.icon size={18} style={{ color: stat.color }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#6b7c6b', fontWeight: 500 }}>{stat.label}</span>
                        </div>
                        <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a1a0a' }}>
                            {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : stat.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Links */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a1a0a', marginBottom: '1rem' }}>Quick Access</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {quickLinks.map((link, i) => (
                    <motion.div
                        key={link.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.06 }}
                    >
                        <Link href={link.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                ...cardStyle,
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                transition: 'all 0.2s ease', cursor: 'pointer',
                            }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '0.75rem',
                                    background: `linear-gradient(135deg, ${link.color}20, ${link.color}08)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <link.icon size={20} style={{ color: link.color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a1a0a' }}>{link.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#6b7c6b', marginTop: '0.15rem' }}>{link.desc}</p>
                                </div>
                                <ArrowRight size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

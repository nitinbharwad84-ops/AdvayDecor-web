'use client';

import { motion } from 'framer-motion';
import { Search, ExternalLink, CheckCircle, Globe, Link2, FileText } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://advaydecor.vercel.app';
const GOOGLE_VERIFICATION = 'GVNgZZ_0bSD0QJuRyvEBEbGuNuX1xgZ296vLruj4_JY';

export default function SeoSearchConsolePage() {
    const cardStyle: React.CSSProperties = {
        padding: '1.5rem', borderRadius: '1rem', background: '#ffffff', border: '1px solid #e0e8e0',
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Search size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Search Console</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a1a0a' }}>Google Search Console</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7c6b', marginTop: '0.25rem' }}>Monitor your site&apos;s indexing status and search performance.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Verification Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #22c55e20, #22c55e08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={18} style={{ color: '#22c55e' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a1a0a' }}>Site Verification</h2>
                            <p style={{ fontSize: '0.75rem', color: '#6b7c6b' }}>Google Search Console ownership verification</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e0e8e0', background: '#f8faf8' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b7c6b' }}>Verification Meta Tag</p>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0a1a0a', fontFamily: 'monospace', wordBreak: 'break-all' }}>{GOOGLE_VERIFICATION}</p>
                        </div>
                        <CheckCircle size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
                        This verification tag is configured in the root layout metadata.
                    </p>
                </motion.div>

                {/* Sitemap Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #8b5cf620, #8b5cf608)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={18} style={{ color: '#8b5cf6' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a1a0a' }}>Sitemap</h2>
                            <p style={{ fontSize: '0.75rem', color: '#6b7c6b' }}>Submit your sitemap to Google for faster indexing</p>
                        </div>
                    </div>

                    <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e0e8e0', background: '#f8faf8', marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b7c6b' }}>Sitemap URL</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <Link2 size={14} style={{ color: '#3b82f6' }} />
                            <a href={`${SITE_URL}/sitemap.xml`} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace', textDecoration: 'none' }}>
                                {SITE_URL}/sitemap.xml
                            </a>
                        </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
                        After making SEO changes, resubmit your sitemap in Google Search Console to request faster re-crawling.
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <a
                            href="https://search.google.com/search-console"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.625rem 1.25rem', background: '#f59e0b', color: '#fff',
                                borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.85rem',
                                textDecoration: 'none', boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
                            }}
                        >
                            Open Search Console <ExternalLink size={14} />
                        </a>
                        <a
                            href={`${SITE_URL}/sitemap.xml`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.625rem 1.25rem', background: '#f8faf8', color: '#475569',
                                borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.85rem',
                                textDecoration: 'none', border: '1px solid #e0e8e0',
                            }}
                        >
                            View Sitemap <ExternalLink size={14} />
                        </a>
                    </div>
                </motion.div>

                {/* Quick Tips */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #3b82f620, #3b82f608)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={18} style={{ color: '#3b82f6' }} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a1a0a' }}>Quick Tips</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            'Resubmit the sitemap after adding new products or pages',
                            'Check "Coverage" in Search Console for indexing errors',
                            'Use "URL Inspection" to request indexing of specific pages',
                            'Monitor "Core Web Vitals" for page speed issues',
                            'Check "Search Results" for click-through rate optimization',
                        ].map((tip, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0' }}>
                                <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>•</span>
                                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>{tip}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

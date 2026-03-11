'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, ExternalLink, Loader2, Globe, Link2 } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://advaydecor.vercel.app';

interface SitemapUrl {
    url: string;
    lastmod?: string;
    changefreq?: string;
    priority?: number;
}

export default function SeoSitemapPage() {
    const [urls, setUrls] = useState<SitemapUrl[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/sitemap.xml')
            .then(res => res.text())
            .then(xml => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(xml, 'text/xml');
                const urlElements = doc.querySelectorAll('url');
                const parsed: SitemapUrl[] = [];
                urlElements.forEach(el => {
                    parsed.push({
                        url: el.querySelector('loc')?.textContent || '',
                        lastmod: el.querySelector('lastmod')?.textContent || undefined,
                        changefreq: el.querySelector('changefreq')?.textContent || undefined,
                        priority: el.querySelector('priority')?.textContent
                            ? parseFloat(el.querySelector('priority')!.textContent!)
                            : undefined,
                    });
                });
                setUrls(parsed);
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Map size={14} style={{ color: '#8b5cf6' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sitemap</span>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a1a0a' }}>Sitemap URLs</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7c6b', marginTop: '0.25rem' }}>
                        All URLs currently in your XML sitemap ({urls.length} total)
                    </p>
                </div>
                <a
                    href={`${SITE_URL}/sitemap.xml`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.625rem 1.25rem', background: '#8b5cf6', color: '#fff',
                        borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.85rem',
                        textDecoration: 'none', boxShadow: '0 2px 8px rgba(139,92,246,0.25)',
                    }}
                >
                    View Raw XML <ExternalLink size={14} />
                </a>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                    <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e0e8e0' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#0a1a0a', fontSize: '0.8rem' }}>URL</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#0a1a0a', fontSize: '0.8rem' }}>Priority</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#0a1a0a', fontSize: '0.8rem' }}>Frequency</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#0a1a0a', fontSize: '0.8rem' }}>Last Modified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urls.map((entry, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f0f5f0' }}>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Link2 size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />
                                                <a
                                                    href={entry.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: '#3b82f6', textDecoration: 'none',
                                                        fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all',
                                                    }}
                                                >
                                                    {entry.url.replace(SITE_URL, '') || '/'}
                                                </a>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            {entry.priority !== undefined && (
                                                <span style={{
                                                    fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '9999px',
                                                    background: entry.priority >= 0.8 ? '#dcfce7' : entry.priority >= 0.6 ? '#fef3c7' : '#f0f5f0',
                                                    color: entry.priority >= 0.8 ? '#166534' : entry.priority >= 0.6 ? '#92400e' : '#6b7c6b',
                                                    fontWeight: 600,
                                                }}>
                                                    {entry.priority}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#6b7c6b', fontSize: '0.8rem' }}>
                                            {entry.changefreq || '—'}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#6b7c6b', fontSize: '0.8rem' }}>
                                            {entry.lastmod ? new Date(entry.lastmod).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {urls.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                            <Globe size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                            <p style={{ fontSize: '0.9rem' }}>
                                No sitemap URLs found. Deploy your project to generate the sitemap.
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

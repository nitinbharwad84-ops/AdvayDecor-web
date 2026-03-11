'use client';

import { motion } from 'framer-motion';
import { BarChart3, ExternalLink, CheckCircle, Globe } from 'lucide-react';

const GA4_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const GTAG_ID = 'AW-17990232628';

export default function SeoAnalyticsPage() {
    const cardStyle: React.CSSProperties = {
        padding: '1.5rem', borderRadius: '1rem', background: '#ffffff', border: '1px solid #e0e8e0',
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <BarChart3 size={14} style={{ color: '#3b82f6' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Analytics</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a1a0a' }}>Google Analytics & Tracking</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7c6b', marginTop: '0.25rem' }}>View your tracking configurations and access Analytics dashboards.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Google Analytics 4 */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #f59e0b20, #f59e0b08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={18} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a1a0a' }}>Google Analytics 4</h2>
                            <p style={{ fontSize: '0.75rem', color: '#6b7c6b' }}>Website traffic and user behavior analytics</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e0e8e0', background: '#f8faf8' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b7c6b' }}>Measurement ID</p>
                                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a1a0a', fontFamily: 'monospace' }}>{GA4_ID || 'Not configured'}</p>
                            </div>
                            {GA4_ID ? (
                                <CheckCircle size={18} style={{ color: '#22c55e' }} />
                            ) : (
                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>Not Set</span>
                            )}
                        </div>

                        <a
                            href="https://analytics.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.625rem 1.25rem', background: '#3b82f6', color: '#fff',
                                borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.85rem',
                                textDecoration: 'none', boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
                                alignSelf: 'flex-start',
                            }}
                        >
                            Open Google Analytics <ExternalLink size={14} />
                        </a>
                    </div>
                </motion.div>

                {/* Google Tag (Ads) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #22c55e20, #22c55e08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={18} style={{ color: '#22c55e' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a1a0a' }}>Google Tag (Ads Conversion)</h2>
                            <p style={{ fontSize: '0.75rem', color: '#6b7c6b' }}>Conversion tracking for Google Ads campaigns</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e0e8e0', background: '#f8faf8' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b7c6b' }}>Tag ID</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a1a0a', fontFamily: 'monospace' }}>{GTAG_ID}</p>
                        </div>
                        <CheckCircle size={18} style={{ color: '#22c55e' }} />
                    </div>

                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
                        This tag is manually installed in the root layout. To change it, update Settings → Google Tag ID.
                    </p>
                </motion.div>

                {/* Tracking Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={cardStyle}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a1a0a', marginBottom: '1rem' }}>Tracking Scripts Status</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { name: 'Google Analytics 4', status: !!GA4_ID, id: GA4_ID },
                            { name: 'Google Tag (Ads)', status: true, id: GTAG_ID },
                            { name: 'Meta Pixel', status: !!process.env.NEXT_PUBLIC_META_PIXEL_ID, id: process.env.NEXT_PUBLIC_META_PIXEL_ID },
                        ].map((script) => (
                            <div key={script.name} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                border: '1px solid #e0e8e0',
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0a1a0a' }}>{script.name}</p>
                                    {script.id && <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>{script.id}</p>}
                                </div>
                                {script.status ? (
                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#dcfce7', color: '#166534', fontWeight: 600 }}>Active</span>
                                ) : (
                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>Not Set</span>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

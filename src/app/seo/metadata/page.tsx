'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Loader2, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

interface PageMeta {
    page_key: string;
    title: string;
    description: string;
    keywords: string;
    og_title: string;
    og_description: string;
    updated_at: string | null;
}

const PAGE_LABELS: Record<string, { label: string; color: string }> = {
    home: { label: 'Home Page', color: '#22c55e' },
    shop: { label: 'Shop Page', color: '#3b82f6' },
    story: { label: 'Our Story', color: '#8b5cf6' },
    contact: { label: 'Contact Page', color: '#f59e0b' },
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
    border: '1px solid #d4e0d4', background: '#ffffff', fontSize: '0.875rem',
    outline: 'none', color: '#0a1a0a', transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600,
    color: '#0a1a0a', marginBottom: '0.375rem',
};

export default function SeoMetadataPage() {
    const [pages, setPages] = useState<PageMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [expandedPage, setExpandedPage] = useState<string | null>('home');

    useEffect(() => {
        fetch('/api/seo/metadata')
            .then(res => res.json())
            .then(data => {
                if (data?.pages) {
                    setPages(data.pages);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const updateField = (pageKey: string, field: keyof PageMeta, value: string) => {
        setPages(prev => prev.map(p =>
            p.page_key === pageKey ? { ...p, [field]: value } : p
        ));
    };

    const handleSave = async (pageKey: string) => {
        const page = pages.find(p => p.page_key === pageKey);
        if (!page) return;

        setSavingKey(pageKey);
        try {
            const res = await fetch('/api/seo/metadata', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(page),
            });

            if (res.ok) {
                toast.success(`${PAGE_LABELS[pageKey]?.label || pageKey} metadata saved!`);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save');
            }
        } catch {
            toast.error('Failed to save metadata');
        } finally {
            setSavingKey(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(34,197,94,0.2)', borderTop: '3px solid #22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <FileText size={14} style={{ color: '#22c55e' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Page Metadata</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a1a0a' }}>SEO Metadata Manager</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7c6b', marginTop: '0.25rem' }}>Edit titles, descriptions, and keywords for each page. Changes apply immediately.</p>
            </div>

            {/* Page Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pages.map((page, i) => {
                    const config = PAGE_LABELS[page.page_key] || { label: page.page_key, color: '#64748b' };
                    const isExpanded = expandedPage === page.page_key;
                    const isSaving = savingKey === page.page_key;

                    return (
                        <motion.div
                            key={page.page_key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            style={{
                                borderRadius: '1rem', background: '#ffffff', border: '1px solid #e0e8e0',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Collapsible Header */}
                            <button
                                onClick={() => setExpandedPage(isExpanded ? null : page.page_key)}
                                style={{
                                    display: 'flex', alignItems: 'center', width: '100%',
                                    padding: '1.25rem 1.5rem', background: 'none', border: 'none',
                                    cursor: 'pointer', gap: '0.75rem',
                                }}
                            >
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '0.5rem',
                                    background: `linear-gradient(135deg, ${config.color}20, ${config.color}08)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Globe size={18} style={{ color: config.color }} />
                                </div>
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a1a0a' }}>{config.label}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#6b7c6b', marginTop: '0.1rem' }}>
                                        /{page.page_key === 'home' ? '' : page.page_key}
                                        {page.updated_at && ` • Updated ${new Date(page.updated_at).toLocaleDateString()}`}
                                    </p>
                                </div>
                                {isExpanded ? <ChevronUp size={18} style={{ color: '#9ca3af' }} /> : <ChevronDown size={18} style={{ color: '#9ca3af' }} />}
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #f0f5f0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.25rem' }}>
                                        <div>
                                            <label style={labelStyle}>Page Title</label>
                                            <input
                                                type="text"
                                                value={page.title || ''}
                                                onChange={(e) => updateField(page.page_key, 'title', e.target.value)}
                                                style={inputStyle}
                                                placeholder="Enter page title..."
                                            />
                                            <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                                {(page.title || '').length}/60 characters (recommended)
                                            </p>
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Meta Description</label>
                                            <textarea
                                                value={page.description || ''}
                                                onChange={(e) => updateField(page.page_key, 'description', e.target.value)}
                                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                                placeholder="Enter meta description..."
                                            />
                                            <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                                {(page.description || '').length}/160 characters (recommended)
                                            </p>
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Keywords (comma-separated)</label>
                                            <textarea
                                                value={page.keywords || ''}
                                                onChange={(e) => updateField(page.page_key, 'keywords', e.target.value)}
                                                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                                                placeholder="keyword 1, keyword 2, keyword 3..."
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={labelStyle}>OG Title (Social Share)</label>
                                                <input
                                                    type="text"
                                                    value={page.og_title || ''}
                                                    onChange={(e) => updateField(page.page_key, 'og_title', e.target.value)}
                                                    style={inputStyle}
                                                    placeholder="Leave blank to use page title"
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>OG Description</label>
                                                <input
                                                    type="text"
                                                    value={page.og_description || ''}
                                                    onChange={(e) => updateField(page.page_key, 'og_description', e.target.value)}
                                                    style={inputStyle}
                                                    placeholder="Leave blank to use meta desc"
                                                />
                                            </div>
                                        </div>

                                        <motion.button
                                            onClick={() => handleSave(page.page_key)}
                                            disabled={isSaving}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                padding: '0.625rem 1.25rem', background: '#22c55e', color: '#fff',
                                                borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
                                                border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                                                boxShadow: '0 2px 8px rgba(34,197,94,0.25)',
                                                opacity: isSaving ? 0.7 : 1, alignSelf: 'flex-end',
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

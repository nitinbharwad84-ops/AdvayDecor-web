'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PageContent {
    slug: string;
    title: string;
    content: string;
    updated_at: string;
}

export default function AdminPages() {
    const [pages, setPages] = useState<PageContent[]>([]);
    const [selectedSlug, setSelectedSlug] = useState<string>('');
    const [editedContent, setEditedContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch('/api/admin/pages');
            const data = await res.json();

            if (!res.ok) {
                // Check if connection or table miss
                if (data.error?.includes('relation "page_content" does not exist')) {
                    throw new Error('Database Setup Required');
                }
                throw new Error(data.error || 'Failed to load pages');
            }

            setPages(data);
            if (data.length > 0 && !selectedSlug) {
                setSelectedSlug(data[0].slug);
                setEditedContent(data[0].content);
            }
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (slug: string) => {
        const page = pages.find(p => p.slug === slug);
        if (page) {
            setSelectedSlug(slug);
            setEditedContent(page.content);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/pages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: selectedSlug, content: editedContent }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to save');
            }

            toast.success('Page updated successfully!');
            fetchPages();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{
                    width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (errorMsg === 'Database Setup Required') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', margin: '4rem auto'
                }}
            >
                <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>Database Table Missing</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    The <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>page_content</code> table has not been created yet. Please execute the latest commands in your <b>supabase/schema.sql</b> file using the Supabase SQL Editor to manage pages here.
                </p>
            </motion.div>
        );
    }

    if (errorMsg) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                <p>{errorMsg}</p>
                <button onClick={fetchPages} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#0a0a23', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', border: 'none' }}>
                    Retry
                </button>
            </div>
        );
    }

    const selectedPage = pages.find(p => p.slug === selectedSlug);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: '2rem', flexDirection: 'column', maxWidth: '1000px', margin: '0 auto' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={28} style={{ color: '#00b4d8' }} />
                    Page Management
                </h1>

                <button
                    onClick={fetchPages}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.625rem 1.25rem', background: '#fff', color: '#0a0a23',
                        border: '1px solid #e5e7eb', borderRadius: '0.75rem',
                        fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', padding: '2rem', borderRadius: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0ece4' }}>

                {/* Selector */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>
                        Select Page to Edit
                    </label>
                    <select
                        value={selectedSlug}
                        onChange={(e) => handleSelect(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                            border: '1px solid #e5e7eb', background: '#f8fafc',
                            fontSize: '0.9rem', color: '#0a0a23', outline: 'none',
                        }}
                    >
                        {pages.map(p => (
                            <option key={p.slug} value={p.slug}>{p.title}</option>
                        ))}
                    </select>
                </div>

                {/* Editor */}
                {selectedPage && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.25rem' }}>
                                    Content Editor
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    Last saved: {new Date(selectedPage.updated_at).toLocaleString()}
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem 1.5rem', background: '#0a0a23', color: '#fff',
                                    border: 'none', borderRadius: '0.75rem',
                                    fontSize: '0.875rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(10,10,35,0.15)'
                                }}
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            style={{
                                width: '100%', minHeight: '400px', padding: '1.5rem',
                                borderRadius: '0.75rem', border: '1px solid #e5e7eb',
                                background: '#f8fafc', fontSize: '0.95rem',
                                color: '#334155', lineHeight: 1.8, resize: 'vertical',
                                outline: 'none', fontFamily: 'inherit'
                            }}
                            placeholder="Type page content here..."
                            onFocus={(e) => e.target.style.borderColor = '#00b4d8'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

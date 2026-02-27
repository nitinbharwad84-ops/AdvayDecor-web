'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit2, Trash2, Tag, Loader2, X, AlertCircle, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Category } from '@/types';

// Theming matching the rest of the generic admin style
const colors = {
    primary: '#00b4d8', secondary: '#0a0a23',
    background: '#f0eff5', card: '#ffffff',
    text: '#0a0a23', textMuted: '#64648b',
    border: '#e8e4dc', error: '#ef4444',
    success: '#10b981', warning: '#f59e0b'
};

const inputStyle = {
    width: '100%', padding: '0.625rem 1rem', borderRadius: '0.75rem',
    border: `1px solid ${colors.border}`, fontSize: '0.875rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
    display: 'block', fontSize: '0.875rem', fontWeight: 500,
    color: colors.text, marginBottom: '0.375rem',
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '', slug: '', description: '', is_active: true
    });

    // Generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Only auto-update slug if it was empty or matched the old name's slug
        setFormData(prev => ({ ...prev, name, slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ? slug : prev.slug }));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            } else {
                toast.error('Failed to load categories');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (category: Category | null = null) => {
        if (category) {
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                is_active: category.is_active
            });
            setSelectedCategory(category);
        } else {
            setFormData({ name: '', slug: '', description: '', is_active: true });
            setSelectedCategory(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.slug.trim()) {
            toast.error('Name and slug are required');
            return;
        }

        setIsSaving(true);
        try {
            const url = selectedCategory
                ? `/api/admin/categories/${selectedCategory.id}`
                : '/api/admin/categories';

            const method = selectedCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(selectedCategory ? 'Category updated' : 'Category created');
                fetchCategories();
                setIsModalOpen(false);
            } else {
                toast.error(data.error || 'Operation failed');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? This might affect products that are assigned to it.')) return;

        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Category deleted');
                setCategories(categories.filter(c => c.id !== id));
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to delete');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const toggleStatus = async (category: Category) => {
        try {
            const res = await fetch(`/api/admin/categories/${category.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...category, is_active: !category.is_active })
            });

            if (res.ok) {
                toast.success(`Category ${!category.is_active ? 'activated' : 'deactivated'}`);
                setCategories(categories.map(c =>
                    c.id === category.id ? { ...c, is_active: !c.is_active } : c
                ));
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: colors.text }}>Categories</h1>
                    <p style={{ color: colors.textMuted, marginTop: '0.25rem' }}>Organize your products into categories</p>
                </div>
                <button
                    onClick={() => openModal()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.25rem', background: colors.primary, color: '#fff',
                        borderRadius: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 180, 216, 0.2)', transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            {/* Main Content */}
            <div style={{ background: colors.card, borderRadius: '1rem', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                {/* Search Bar */}
                <div style={{ padding: '1.25rem', borderBottom: `1px solid ${colors.border}`, display: 'flex', gap: '1rem', background: '#f8fafc' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '2.5rem', background: '#fff' }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slug</th>
                                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center' }}>
                                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary, margin: '0 auto' }} />
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
                                        <div style={{ background: '#f1f5f9', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                            <Tag size={24} color="#94a3b8" />
                                        </div>
                                        <p style={{ fontSize: '1rem', fontWeight: 500, color: colors.text }}>No categories found</p>
                                        <p style={{ fontSize: '0.875rem' }}>Try changing your search or create a new one.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <div style={{ fontWeight: 600, color: colors.text }}>{category.name}</div>
                                            {category.description && (
                                                <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.25rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {category.description}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.625rem', background: '#f1f5f9', borderRadius: '0.375rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#475569' }}>
                                                {category.slug}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <button
                                                onClick={() => toggleStatus(category)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                                    padding: '0.375rem 0.75rem', borderRadius: '2rem',
                                                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                                                    background: category.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 100, 139, 0.1)',
                                                    color: category.is_active ? colors.success : colors.textMuted,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: category.is_active ? colors.success : colors.textMuted }} />
                                                {category.is_active ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => openModal(category)}
                                                    style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: '#f8fafc', border: `1px solid ${colors.border}`, color: colors.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: colors.error, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(10, 10, 35, 0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                width: '100%', maxWidth: '500px', background: '#fff', borderRadius: '1.25rem',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 101, overflow: 'hidden'
                            }}
                        >
                            <div style={{ padding: '1.5rem', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.text }}>
                                    {selectedCategory ? 'Edit Category' : 'Create Category'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', display: 'flex', padding: '0.25rem' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={labelStyle}>Category Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={handleNameChange}
                                            placeholder="e.g., Pillows"
                                            style={inputStyle}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>URL Slug *</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                                            placeholder="pillows"
                                            style={{ ...inputStyle, fontFamily: 'monospace', background: '#f8fafc' }}
                                            required
                                        />
                                        <p style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.375rem' }}>
                                            The URL-friendly version of the name. Must be unique.
                                        </p>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Description (Optional)</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Brief description of this category..."
                                            style={{ ...inputStyle, resize: 'none', height: '80px' }}
                                        />
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem', border: `1px solid ${colors.border}` }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            style={{ width: '18px', height: '18px', accentColor: colors.primary }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 500, color: colors.text, fontSize: '0.875rem' }}>Active Status</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>If disabled, products might still exist but category won't show</div>
                                        </div>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        style={{ flex: 1, padding: '0.75rem', background: 'none', border: `1px solid ${colors.border}`, color: colors.text, borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        style={{ flex: 1, padding: '0.75rem', background: colors.primary, border: 'none', color: '#fff', borderRadius: '0.75rem', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isSaving ? 0.7 : 1 }}
                                    >
                                        {isSaving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                                        {selectedCategory ? 'Save Changes' : 'Create Category'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

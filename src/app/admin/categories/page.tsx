'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, PenLine, Trash2, Tag, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch categories');
            setCategories(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory.name || !editingCategory.slug) {
            toast.error('Name and slug are required');
            return;
        }

        setIsSaving(true);
        try {
            const isUpdate = !!editingCategory.id;
            const url = isUpdate ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
            const method = isUpdate ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCategory),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save category');

            toast.success(`Category ${isUpdate ? 'updated' : 'added'} successfully`);
            setIsModalOpen(false);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;

        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete category');

            toast.success('Category deleted');
            fetchCategories();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (name: string) => {
        if (!editingCategory.id) {
            // Only auto-generate for new categories
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setEditingCategory(prev => ({ ...prev, name, slug }));
        } else {
            setEditingCategory(prev => ({ ...prev, name }));
        }
    };

    // Pagination & Filtering
    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Tag size={28} style={{ color: '#00b4d8' }} />
                        Categories Management
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Organize your store's product categories</p>
                </div>

                <button
                    onClick={() => {
                        setEditingCategory({ name: '', slug: '', description: '' });
                        setIsModalOpen(true);
                    }}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: '#0a0a23', color: '#fff',
                        fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem'
                            }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slug</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#00b4d8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    </td>
                                </tr>
                            ) : paginatedCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                        {searchQuery ? 'No categories found matching your search.' : 'No categories created yet.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedCategories.map((cat) => (
                                    <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#0a0a23' }}>{cat.name}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontFamily: 'monospace' }}>{cat.slug}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {cat.description || '-'}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                                                    style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#f1f5f9', color: '#0a0a23', border: 'none', cursor: 'pointer' }}
                                                    title="Edit"
                                                >
                                                    <PenLine size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', color: currentPage === 1 ? '#cbd5e1' : '#0a0a23', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', color: currentPage === totalPages ? '#cbd5e1' : '#0a0a23', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(10,10,35,0.6)', backdropFilter: 'blur(4px)',
                            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: '#fff', borderRadius: '1.5rem', padding: '2rem',
                                width: '100%', maxWidth: '500px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                            }}
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.5rem' }}>
                                {editingCategory.id ? 'Edit Category' : 'Create New Category'}
                            </h2>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Category Name *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g., Living Room Chairs"
                                        value={editingCategory.name || ''}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>URL Slug *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="living-room-chairs"
                                        value={editingCategory.slug || ''}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', fontFamily: 'monospace' }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Used in URLs. Must be unique.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Description (Optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="A brief description of this category..."
                                        value={editingCategory.description || ''}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', background: 'transparent', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', border: 'none', background: '#0a0a23', color: '#fff', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Category'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

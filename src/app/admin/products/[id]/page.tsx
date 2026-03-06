'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, Trash2, Upload, ImageIcon, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
    border: '1px solid #d4d0c8', background: '#ffffff', fontSize: '0.875rem',
    outline: 'none', color: '#0a0a23', transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.875rem', fontWeight: 500,
    color: '#0a0a23', marginBottom: '0.375rem',
};

const cardStyle: React.CSSProperties = {
    padding: '1.5rem', borderRadius: '1rem', background: '#ffffff', border: '1px solid #f0ece4',
};

export default function AdminProductEditPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;
    const isNew = productId === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: '', slug: '', description: '', base_price: '',
        category: '', has_variants: false, is_active: true,
    });

    const [variants, setVariants] = useState<{ id: string; variant_name: string; sku: string; price: string; stock_quantity: string }[]>([]);
    const [existingImages, setExistingImages] = useState<{ id: string; image_url: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

    // Fetch categories from database
    useEffect(() => {
        fetch('/api/admin/categories')
            .then(res => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setCategories(data);
                    // If creating new product and no category selected, default to the first
                    if (isNew && data.length > 0) {
                        setForm(prev => ({ ...prev, category: data[0].name }));
                    }
                }
            })
            .catch(() => {/* ignore */ });
    }, [isNew]);

    // Fetch existing product data
    useEffect(() => {
        if (isNew) return;

        fetch('/api/admin/products')
            .then(res => res.json())
            .then((products: Product[]) => {
                const product = products.find((p: Product) => p.id === productId);
                if (product) {
                    setForm({
                        title: product.title,
                        slug: product.slug,
                        description: product.description || '',
                        base_price: product.base_price.toString(),
                        category: product.category,
                        has_variants: product.has_variants,
                        is_active: product.is_active,
                    });
                    setVariants(
                        (product.variants || []).map(v => ({
                            id: v.id,
                            variant_name: v.variant_name,
                            sku: v.sku || '',
                            price: v.price.toString(),
                            stock_quantity: v.stock_quantity.toString(),
                        }))
                    );
                    setExistingImages(
                        (product.images || []).map(img => ({ id: img.id, image_url: img.image_url }))
                    );
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [productId, isNew]);

    const handleSave = async () => {
        if (!form.title || !form.slug || !form.base_price) {
            toast.error('Please fill in title, slug, and price');
            return;
        }

        setSaving(true);
        try {
            const body = {
                ...(isNew ? {} : { id: productId }),
                title: form.title,
                slug: form.slug,
                description: form.description,
                base_price: parseFloat(form.base_price),
                category: form.category,
                has_variants: form.has_variants,
                is_active: form.is_active,
                variants: form.has_variants
                    ? variants.map(v => ({
                        variant_name: v.variant_name,
                        sku: v.sku,
                        price: parseFloat(v.price) || 0,
                        stock_quantity: parseInt(v.stock_quantity) || 0,
                    }))
                    : [],
                images: existingImages.map((img) => ({ image_url: img.image_url })),
            };

            const res = await fetch('/api/admin/products', {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(isNew ? 'Product created!' : 'Product saved!');
                if (isNew) router.push('/admin/products');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save');
            }
        } catch {
            toast.error('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this product? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/admin/products?id=${productId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Product deleted');
                router.push('/admin/products');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to delete');
            }
        } catch {
            toast.error('Failed to delete product');
        }
    };

    const addVariant = () => {
        setVariants([...variants, {
            id: `v-new-${Date.now()}`, variant_name: '', sku: '',
            price: form.base_price, stock_quantity: '0',
        }]);
    };

    const removeVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const uploadFile = async (file: File) => {
        if (!file) return;

        // Basic client-side validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Only JPG, PNG, and WEBP are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB limit');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setExistingImages(prev => [...prev, { id: `new-${Date.now()}`, image_url: data.url }]);
                toast.success('Image uploaded temporarily. Save product to apply changes.');
            } else {
                toast.error(data.error || 'Failed to upload image');
            }
        } catch {
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadFile(file);
            e.target.value = ''; // Reset input
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await uploadFile(file);
        }
    };

    const removeImage = (id: string) => {
        setExistingImages(existingImages.filter(img => img.id !== id));
    };

    const onImageDragStart = (index: number) => {
        setDraggedImageIndex(index);
    };

    const onImageDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedImageIndex === null || draggedImageIndex === index) return;

        const newImages = [...existingImages];
        const draggedItem = newImages[draggedImageIndex];
        newImages.splice(draggedImageIndex, 1);
        newImages.splice(index, 0, draggedItem);

        setDraggedImageIndex(index);
        setExistingImages(newImages);
    };

    const onImageDragEnd = () => {
        setDraggedImageIndex(null);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/admin/products" style={{ padding: '0.5rem', borderRadius: '0.75rem', border: '1px solid #e8e4dc', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#0a0a23' }}>
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23' }}>
                            {isNew ? 'Add Product' : 'Edit Product'}
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#9e9eb8', marginTop: '0.125rem' }}>
                            {isNew ? 'Create a new product' : `Editing: ${form.title}`}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Status Toggle */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.5rem 1rem', background: '#fff',
                        border: '1px solid #e8e4dc', borderRadius: '0.75rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64648b' }}>Status:</span>
                        <div
                            style={{
                                position: 'relative', width: '40px', height: '22px',
                                borderRadius: '11px', background: form.is_active ? '#00b4d8' : '#e8e4dc',
                                cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onClick={() => setForm({ ...form, is_active: !form.is_active })}
                        >
                            <div style={{
                                position: 'absolute', top: '2px', left: form.is_active ? '20px' : '2px',
                                width: '18px', height: '18px', borderRadius: '50%',
                                background: '#fff', transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: form.is_active ? '#00b4d8' : '#9e9eb8', minWidth: '50px' }}>
                            {form.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Delete Button */}
                    {!isNew && (
                        <button
                            onClick={handleDelete}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.625rem 1rem', color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)',
                                borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                    )}

                    <motion.button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.625rem 1.25rem', background: '#00b4d8', color: '#fff',
                            borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
                            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 8px rgba(0,180,216,0.25)',
                            opacity: saving ? 0.7 : 1,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Product'}
                    </motion.button>
                </div>
            </div>

            <div className="admin-product-grid">
                {/* Main Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Basic Info */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '1.25rem' }}>Basic Information</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Product Title *</label>
                                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="e.g., Multicolor Flower Cushion" />
                            </div>
                            <div>
                                <label style={labelStyle}>URL Slug *</label>
                                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="multicolor-flower-cushion" />
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: 'none' }} placeholder="Describe the product..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Base Price (₹) *</label>
                                    <input type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} style={inputStyle} placeholder="999" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                                        {categories.length === 0 ? (
                                            <option value="">Loading categories...</option>
                                        ) : (
                                            categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '1.25rem' }}>Media</h2>
                        <label
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${isDragging ? '#00b4d8' : '#d4d0c8'}`,
                                borderRadius: '1rem',
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                display: 'block',
                                background: isUploading || isDragging ? '#f8fafc' : 'transparent',
                                transition: 'all 0.2s',
                                opacity: isUploading ? 0.7 : 1,
                                transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                            }}
                        >
                            <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={isUploading} style={{ display: 'none' }} />
                            {isUploading ? (
                                <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: '#00b4d8', marginBottom: '1rem' }} />
                            ) : (
                                <Upload size={48} style={{ margin: '0 auto', color: '#9e9eb8', marginBottom: '1rem' }} />
                            )}
                            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>
                                {isUploading ? 'Uploading...' : 'Drop images here or click to upload'}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#9e9eb8' }}>PNG, JPG, WEBP up to 5MB each</p>
                        </label>
                        {existingImages.length > 0 && (
                            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                {existingImages.map((img, idx) => (
                                    <div
                                        key={img.id}
                                        draggable
                                        onDragStart={() => onImageDragStart(idx)}
                                        onDragOver={(e) => onImageDragOver(e, idx)}
                                        onDragEnd={onImageDragEnd}
                                        style={{
                                            position: 'relative',
                                            aspectRatio: '1',
                                            borderRadius: '0.75rem',
                                            overflow: 'hidden',
                                            background: '#f5f0e8',
                                            border: '1px solid #e5e7eb',
                                            cursor: 'move',
                                            opacity: draggedImageIndex === idx ? 0.5 : 1,
                                            transition: 'transform 0.2s, opacity 0.2s'
                                        }}
                                    >
                                        <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(img.id); }}
                                            style={{
                                                position: 'absolute', top: '0.25rem', right: '0.25rem', width: '24px', height: '24px',
                                                background: '#ef4444', color: '#fff', borderRadius: '50%', border: 'none',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                zIndex: 10
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                        <div style={{
                                            position: 'absolute', bottom: '0.25rem', left: '0.25rem',
                                            background: 'rgba(0,0,0,0.5)', color: '#fff',
                                            fontSize: '10px', padding: '2px 6px', borderRadius: '4px'
                                        }}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Variants */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23' }}>Variants</h2>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.has_variants} onChange={(e) => setForm({ ...form, has_variants: e.target.checked })} style={{ accentColor: '#00b4d8', width: '16px', height: '16px' }} />
                                <span style={{ fontSize: '0.875rem', color: '#64648b' }}>Enable variants</span>
                            </label>
                        </div>

                        {form.has_variants && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {variants.map((variant, idx) => (
                                    <motion.div key={variant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ padding: '1rem', borderRadius: '0.75rem', background: '#fafaf8', border: '1px solid #f0ece4' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0a0a23' }}>Variant {idx + 1}</span>
                                            <button onClick={() => removeVariant(variant.id)} style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9e9eb8', display: 'flex' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="admin-variant-grid">
                                            <input value={variant.variant_name} onChange={(e) => { const u = [...variants]; u[idx].variant_name = e.target.value; setVariants(u); }} placeholder="Name" style={{ ...inputStyle, background: '#fff' }} />
                                            <input value={variant.sku} onChange={(e) => { const u = [...variants]; u[idx].sku = e.target.value; setVariants(u); }} placeholder="SKU" style={{ ...inputStyle, background: '#fff', fontFamily: 'monospace' }} />
                                            <input type="number" value={variant.price} onChange={(e) => { const u = [...variants]; u[idx].price = e.target.value; setVariants(u); }} placeholder="Price" style={{ ...inputStyle, background: '#fff' }} />
                                            <input type="number" value={variant.stock_quantity} onChange={(e) => { const u = [...variants]; u[idx].stock_quantity = e.target.value; setVariants(u); }} placeholder="Stock" style={{ ...inputStyle, background: '#fff' }} />
                                        </div>
                                    </motion.div>
                                ))}
                                <button onClick={addVariant} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', borderRadius: '0.75rem', border: '2px dashed #d4d0c8', background: 'none', color: '#64648b', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                                    <Plus size={16} /> Add Variant
                                </button>
                            </div>
                        )}

                        {!form.has_variants && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.75rem', background: '#fafaf8', color: '#9e9eb8', fontSize: '0.875rem' }}>
                                <ImageIcon size={18} />
                                Enable variants to add color, size, or other options.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .admin-product-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start; max-width: 100%; }
                .admin-variant-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                @media (min-width: 768px) { .admin-variant-grid { grid-template-columns: 1fr 1fr 1fr 1fr; } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

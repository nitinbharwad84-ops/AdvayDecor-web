'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, MoreHorizontal, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

export default function AdminProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = () => {
        setLoading(true);
        fetch('/api/admin/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAllProducts(data);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Product deleted');
                setAllProducts(prev => prev.filter(p => p.id !== id));
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to delete');
            }
        } catch {
            toast.error('Failed to delete product');
        }
    };

    const products = allProducts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23' }}>Products</h1>
                    <p style={{ fontSize: '0.875rem', color: '#9e9eb8', marginTop: '0.25rem' }}>Manage your product catalog ({allProducts.length} products)</p>
                </div>
                <Link href="/admin/products/new">
                    <motion.button
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.625rem 1.25rem', background: '#00b4d8', color: '#fff',
                            borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
                            border: 'none', cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,180,216,0.25)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus size={16} />
                        Add Product
                    </motion.button>
                </Link>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', maxWidth: '360px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9eb8' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        style={{
                            width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem',
                            paddingTop: '0.625rem', paddingBottom: '0.625rem',
                            borderRadius: '0.75rem', border: '1px solid #e8e4dc',
                            background: '#ffffff', fontSize: '0.875rem',
                            outline: 'none', color: '#0a0a23',
                        }}
                    />
                </div>
            </div>

            {/* Product Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    borderRadius: '1rem', background: '#ffffff',
                    border: '1px solid #f0ece4', overflow: 'hidden',
                }}
            >
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(245,240,232,0.5)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variants</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#9e9eb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #f0ece4', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '0.75rem',
                                                background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, overflow: 'hidden',
                                            }}>
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0].image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Package size={18} style={{ color: '#9e9eb8' }} />
                                                )}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#9e9eb8', fontFamily: 'monospace' }}>{product.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#f5f0e8', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, color: '#64648b' }}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0a0a23' }}>
                                        {formatCurrency(product.base_price)}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                                        {product.has_variants ? (
                                            <span style={{ color: '#00b4d8', fontWeight: 500 }}>{product.variants?.length || 0} variants</span>
                                        ) : (
                                            <span style={{ color: '#9e9eb8' }}>None</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                            background: product.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: product.is_active ? '#16a34a' : '#dc2626',
                                        }}>
                                            {product.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Link href={`/admin/products/${product.id}`} style={{ padding: '0.5rem', borderRadius: '0.5rem', color: '#9e9eb8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Edit2 size={14} />
                                            </Link>
                                            <button onClick={() => handleDelete(product.id, product.title)} style={{ padding: '0.5rem', borderRadius: '0.5rem', color: '#9e9eb8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <Package size={40} style={{ margin: '0 auto', color: '#9e9eb8', marginBottom: '1rem' }} />
                        <p style={{ color: '#64648b' }}>No products found</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

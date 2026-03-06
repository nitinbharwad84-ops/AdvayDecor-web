'use client';

import { Package, Thermometer, Ruler } from 'lucide-react';
import type { Product } from '@/types';

interface TechnicalDetailsProps {
    product: Product;
}

export default function TechnicalDetails({ product }: TechnicalDetailsProps) {
    if (!product.weight && !product.length && !product.hsn_code && !product.shipping_info) {
        return null;
    }

    return (
        <div style={{
            padding: '1rem',
            background: 'rgba(245,240,232,0.4)',
            borderRadius: '1rem',
            border: '1px solid #e8e4dc',
            fontSize: '0.85rem'
        }}>
            <h4 style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
            }}>
                <Package size={14} /> Shipping Specifications
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {product.weight && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Thermometer size={14} style={{ color: '#94a3b8' }} />
                        <span style={{ color: '#475569' }}>Weight: <strong>{product.weight} kg</strong></span>
                    </div>
                )}
                {product.length && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Ruler size={14} style={{ color: '#94a3b8' }} />
                        <span style={{ color: '#475569' }}>Size: <strong>{product.length}x{product.width}x{product.height} cm</strong></span>
                    </div>
                )}
                {product.hsn_code && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '14px', height: '14px', border: '1px solid #94a3b8', borderRadius: '3px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>#</div>
                        <span style={{ color: '#475569' }}>HSN: <strong>{product.hsn_code}</strong></span>
                    </div>
                )}
            </div>

            {product.shipping_info && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #e8e4dc', color: '#64748b', fontStyle: 'italic', fontSize: '0.75rem' }}>
                    {product.shipping_info}
                </div>
            )}
        </div>
    );
}

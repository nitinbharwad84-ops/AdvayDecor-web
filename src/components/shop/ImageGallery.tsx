'use client';

import { useState, useRef, useCallback } from 'react';
import type { ProductImage } from '@/types';
import Lightbox from './Lightbox';

interface ImageGalleryProps {
    images: ProductImage[];
    activeIndex?: number;
    onIndexChange?: (index: number) => void;
    showThumbnails?: boolean;
}

const PLACEHOLDER: ProductImage = {
    id: 'placeholder',
    image_url: 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80',
    display_order: 0,
    product_id: '',
    variant_id: null,
};

export default function ImageGallery({
    images,
    activeIndex,
    onIndexChange,
    showThumbnails = true,
}: ImageGalleryProps) {
    const [internalIndex, setInternalIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Live drag offset (0 when idle, ±px while dragging)
    const [dragOffset, setDragOffset] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartX = useRef<number | null>(null);
    const isDragging = useRef(false);
    const currentDragOffset = useRef(0);

    const displayImages = images.length > 0 ? images : [PLACEHOLDER];
    const selectedIndex = activeIndex !== undefined ? activeIndex : internalIndex;

    const navigateTo = useCallback((index: number) => {
        if (index < 0 || index >= displayImages.length || index === selectedIndex) return;
        setIsTransitioning(true);
        if (onIndexChange) onIndexChange(index);
        else setInternalIndex(index);
        // End transition after animation completes
        setTimeout(() => setIsTransitioning(false), 380);
    }, [selectedIndex, displayImages.length, onIndexChange]);

    const next = useCallback(() => navigateTo(selectedIndex + 1), [selectedIndex, navigateTo]);
    const prev = useCallback(() => navigateTo(selectedIndex - 1), [selectedIndex, navigateTo]);

    // ─── Drag helpers ────────────────────────────────────────────────────────
    const startDrag = (clientX: number) => {
        if (isTransitioning) return;
        dragStartX.current = clientX;
        currentDragOffset.current = 0;
        isDragging.current = true;
    };

    const moveDrag = (clientX: number) => {
        if (!isDragging.current || dragStartX.current === null) return;
        const delta = clientX - dragStartX.current;
        // Clamp: can't go past first/last image
        const clamped = selectedIndex === 0
            ? Math.min(delta, 80)
            : selectedIndex === displayImages.length - 1
                ? Math.max(delta, -80)
                : delta;
        currentDragOffset.current = clamped;
        setDragOffset(clamped);
    };

    const endDrag = (isClick: boolean) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const delta = currentDragOffset.current;
        setDragOffset(0);
        currentDragOffset.current = 0;
        dragStartX.current = null;

        if (isClick && Math.abs(delta) < 8) {
            setIsLightboxOpen(true);
        } else if (delta < -60) {
            next();
        } else if (delta > 60) {
            prev();
        }
    };

    // ─── Touch ────────────────────────────────────────────────────────────────
    const onTouchStart = (e: React.TouchEvent) => startDrag(e.touches[0].clientX);
    const onTouchMove = (e: React.TouchEvent) => moveDrag(e.touches[0].clientX);
    const onTouchEnd = () => endDrag(false);

    // ─── Mouse ────────────────────────────────────────────────────────────────
    const onMouseDown = (e: React.MouseEvent) => { e.preventDefault(); startDrag(e.clientX); };
    const onMouseMove = (e: React.MouseEvent) => moveDrag(e.clientX);
    const onMouseUp = (e: React.MouseEvent) => { e.preventDefault(); endDrag(true); };
    const onMouseLeave = () => { if (isDragging.current) { isDragging.current = false; const d = currentDragOffset.current; setDragOffset(0); currentDragOffset.current = 0; if (d < -60) next(); else if (d > 60) prev(); } };

    // ─── Strip transform ──────────────────────────────────────────────────────
    // The strip is (N * 100%) wide, and we shift it so the active image is visible.
    const translateX = `calc(${-selectedIndex * 100}% + ${dragOffset}px)`;
    const transition = isDragging.current ? 'none' : 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    return (
        <>
            <div className="flex flex-col-reverse md:flex-row gap-4">
                {/* Thumbnails */}
                {showThumbnails && (
                    <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pb-2 md:pb-0 md:pr-2">
                        {displayImages.map((img, index) => (
                            <button
                                key={img.id}
                                onClick={() => navigateTo(index)}
                                className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                    selectedIndex === index
                                        ? 'border-cyan shadow-md shadow-cyan/20'
                                        : 'border-border-light hover:border-navy/20'
                                }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.image_url}
                                    alt={`View ${index + 1}`}
                                    style={{ position: 'absolute', width: '100%', height: '100%', inset: 0, objectFit: 'cover' }}
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* ─── Main image strip ────────────────────────────────────── */}
                <div
                    ref={containerRef}
                    className="flex-1 relative rounded-2xl overflow-hidden bg-cream-dark select-none"
                    style={{ aspectRatio: '1/1', touchAction: 'pan-y', cursor: isDragging.current ? 'grabbing' : 'grab' }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseLeave}
                >
                    {/* Horizontal strip — all images side by side */}
                    <div
                        style={{
                            display: 'flex',
                            width: `${displayImages.length * 100}%`,
                            height: '100%',
                            transform: `translateX(${translateX})`,
                            transition,
                            willChange: 'transform',
                        }}
                    >
                        {displayImages.map((img, i) => (
                            <div
                                key={img.id}
                                style={{
                                    width: `${100 / displayImages.length}%`,
                                    flexShrink: 0,
                                    position: 'relative',
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.image_url}
                                    alt={`Product image ${i + 1}`}
                                    draggable={false}
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        inset: 0,
                                        objectFit: 'cover',
                                        userSelect: 'none',
                                        pointerEvents: 'none',
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Prev / Next arrows */}
                    {displayImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prev(); }}
                                aria-label="Previous image"
                                style={{
                                    position: 'absolute', left: '0.75rem', top: '50%',
                                    transform: 'translateY(-50%)', zIndex: 10,
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
                                    border: 'none', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
                                    opacity: selectedIndex === 0 ? 0.25 : 1,
                                    transition: 'opacity 0.2s',
                                    pointerEvents: selectedIndex === 0 ? 'none' : 'auto',
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a23" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); next(); }}
                                aria-label="Next image"
                                style={{
                                    position: 'absolute', right: '0.75rem', top: '50%',
                                    transform: 'translateY(-50%)', zIndex: 10,
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
                                    border: 'none', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
                                    opacity: selectedIndex === displayImages.length - 1 ? 0.25 : 1,
                                    transition: 'opacity 0.2s',
                                    pointerEvents: selectedIndex === displayImages.length - 1 ? 'none' : 'auto',
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a23" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Dot indicators */}
                    {displayImages.length > 1 && (
                        <div style={{
                            position: 'absolute', bottom: '0.75rem', left: '50%',
                            transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10,
                        }}>
                            {displayImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); navigateTo(i); }}
                                    aria-label={`Go to image ${i + 1}`}
                                    style={{
                                        width: i === selectedIndex ? '20px' : '8px',
                                        height: '8px',
                                        borderRadius: '9999px',
                                        background: i === selectedIndex ? '#00b4d8' : 'rgba(255,255,255,0.7)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Zoom hint */}
                    <div style={{
                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                        padding: '4px 10px', borderRadius: '9999px',
                        background: 'rgba(10,10,35,0.55)', backdropFilter: 'blur(6px)',
                        color: '#fff', fontSize: '0.7rem', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        pointerEvents: 'none', zIndex: 10,
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                        Zoom
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            <Lightbox
                images={displayImages}
                initialIndex={selectedIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
            />
        </>
    );
}

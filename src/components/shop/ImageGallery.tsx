'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductImage } from '@/types';

interface ImageGalleryProps {
    images: ProductImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const displayImages = images.length > 0
        ? images
        : [{ id: 'placeholder', image_url: 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80', display_order: 0, product_id: '', variant_id: null }];

    const currentImage = displayImages[selectedIndex] || displayImages[0];

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pb-2 md:pb-0 md:pr-2">
                {displayImages.map((img, index) => (
                    <button
                        key={img.id}
                        onClick={() => setSelectedIndex(index)}
                        className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedIndex === index
                                ? 'border-cyan shadow-md shadow-cyan/20'
                                : 'border-border-light hover:border-navy/20'
                            }`}
                    >
                        <Image
                            src={img.image_url}
                            alt={`View ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative aspect-square rounded-2xl overflow-hidden bg-cream-dark">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImage.id}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={currentImage.image_url}
                            alt="Product image"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Image counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-navy/60 backdrop-blur-sm text-white text-xs font-medium">
                    {selectedIndex + 1} / {displayImages.length}
                </div>
            </div>
        </div>
    );
}

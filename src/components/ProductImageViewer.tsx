'use client'

import { useState, useRef, useCallback } from 'react'
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImageViewerProps {
    /** All images: primary first, then secondary_images */
    images: string[]
    productName: string
}

export default function ProductImageViewer({ images, productName }: ProductImageViewerProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isZooming, setIsZooming] = useState(false)
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 }) // percent

    // --- Touch / swipe ---
    const touchStartX = useRef<number | null>(null)

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return
        const delta = e.changedTouches[0].clientX - touchStartX.current
        touchStartX.current = null
        if (Math.abs(delta) < 40) return // ignore micro-swipes
        if (delta < 0) goNext()
        else goPrev()
    }

    // --- Keyboard nav ---
    const goNext = useCallback(() => setActiveIndex(i => (i + 1) % images.length), [images.length])
    const goPrev = useCallback(() => setActiveIndex(i => (i - 1 + images.length) % images.length), [images.length])

    // --- Zoom ---
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setZoomPos({ x, y })
    }, [])

    if (images.length === 0) {
        return (
            <div className="w-full aspect-square rounded-2xl bg-gray-100 flex items-center justify-center">
                <ShoppingBag size={64} className="text-gray-300" />
            </div>
        )
    }

    const currentImage = images[activeIndex]
    const showThumbs = images.length > 1

    return (
        <div className="flex flex-col gap-4 select-none">
            {/* ── Main image area ── */}
            <div
                className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in border border-gray-200 shadow-sm"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    key={currentImage}
                    src={currentImage}
                    alt={`${productName}${images.length > 1 ? ` — imagen ${activeIndex + 1}` : ''}`}
                    draggable={false}
                    style={
                        isZooming
                            ? {
                                transform: 'scale(2.2)',
                                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                transition: 'transform 0.1s ease-out',
                            }
                            : {
                                transform: 'scale(1)',
                                transition: 'transform 0.3s ease-out',
                            }
                    }
                    className="w-full h-full object-contain"
                />

                {/* Indicators overlay when zooming */}
                {isZooming && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                        🔍 Zoom activo
                    </div>
                )}

                {/* Arrow nav buttons (only shown when multiple images) */}
                {showThumbs && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); goPrev() }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full w-9 h-9 flex items-center justify-center text-gray-700 hover:text-[#742384] transition-all hover:scale-110 z-10"
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); goNext() }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full w-9 h-9 flex items-center justify-center text-gray-700 hover:text-[#742384] transition-all hover:scale-110 z-10"
                            aria-label="Imagen siguiente"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Dot indicators for mobile */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'bg-[#742384] scale-125' : 'bg-white/70'}`}
                                    aria-label={`Ir a imagen ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Thumbnail strip (desktop) ── */}
            {showThumbs && (
                <div className="hidden md:flex gap-3 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all hover:opacity-100 ${i === activeIndex
                                    ? 'border-[#742384] opacity-100 shadow-lg shadow-purple-200'
                                    : 'border-transparent opacity-60 hover:border-gray-300'
                                }`}
                            aria-label={`Ver imagen ${i + 1}`}
                        >
                            <img
                                src={img}
                                alt={`Miniatura ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

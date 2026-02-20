'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProductWithConfig } from '@/types/purchase-stepper'
import { PurchaseStepperProvider } from '@/contexts/PurchaseStepperContext'
import PurchaseWizard from '@/components/PurchaseWizard'
import ProductImageViewer from '@/components/ProductImageViewer'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Tag } from 'lucide-react'

// Normalize image paths to always be absolute
const normalizeImagePath = (path: string | null): string => {
    if (!path) return '';
    if (path.startsWith('/') || path.startsWith('http')) return path;
    return `/${path}`;
};

export default function ProductPageClient() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const [product, setProduct] = useState<ProductWithConfig | null>(null)
    const [loading, setLoading] = useState(true)

    // ── Mode: 'vitrina' (default) | 'checkout' ──
    const isCheckout = searchParams.get('mode') === 'checkout'

    useEffect(() => {
        async function fetchProduct() {
            if (!params.id) return
            const supabase = createClient()
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id as string)
                .single()

            if (data) {
                const rawData = data as any;
                const productWithConfig: ProductWithConfig = {
                    ...rawData,
                    price_config: rawData.price_config || {
                        tiers: [
                            { quantity: 1000, market_price: 95, bulk_price: rawData.base_price_1k || 59, full_payment_bonus: 2 },
                            { quantity: 2000, market_price: 190, bulk_price: rawData.base_price_2k || 110, full_payment_bonus: 2 },
                            { quantity: 3000, market_price: 285, bulk_price: rawData.base_price_3k || 160, full_payment_bonus: 3 },
                            { quantity: 4000, market_price: 380, bulk_price: 210, full_payment_bonus: 3 },
                            { quantity: 5000, market_price: 475, bulk_price: 260, full_payment_bonus: 3 },
                            { quantity: 6000, market_price: 570, bulk_price: 310, full_payment_bonus: 3 },
                            { quantity: 7000, market_price: 665, bulk_price: 360, full_payment_bonus: 3 },
                            { quantity: 8000, market_price: 760, bulk_price: 410, full_payment_bonus: 3 },
                            { quantity: 9000, market_price: 855, bulk_price: 460, full_payment_bonus: 3 },
                            { quantity: 10000, market_price: 950, bulk_price: 510, full_payment_bonus: 3 }
                        ],
                        cash_discount_percent: 10,
                        deposit_percent: 60
                    }
                }
                setProduct(productWithConfig)
            } else {
                console.error('Error fetching product', error)
            }
            setLoading(false)
        }
        fetchProduct()
    }, [params.id])

    // Scroll to top when switching to checkout mode
    useEffect(() => {
        if (isCheckout) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isCheckout])

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#742384] mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando producto...</p>
                </div>
            </div>
        )
    }

    // ── Not found ──
    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-500 mb-4">Producto no encontrado</p>
                    <Link href="/" className="text-[#742384] underline">Volver al inicio</Link>
                </div>
            </div>
        )
    }

    // Helper values
    const allImages = [
        product.image_url ? normalizeImagePath(product.image_url) : null,
        ...(product.secondary_images ?? []).map(normalizeImagePath),
    ].filter((url): url is string => Boolean(url))

    const basePrice = product.price_config?.tiers?.[0]?.bulk_price ?? 0

    // ── Sticky top nav (shared between both modes) ──
    const TopNav = (
        <div className="bg-white border-b sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-gray-600 hover:text-[#742384] transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="font-medium text-sm">Volver</span>
                </Link>

                {/* In vitrina: show CTA to go checkout; in checkout: show back-to-vitrina */}
                {isCheckout ? (
                    <button
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="text-sm text-gray-500 hover:text-[#742384] transition-colors underline-offset-2 hover:underline"
                    >
                        ← Ver detalles del producto
                    </button>
                ) : (
                    <Link
                        href={`/product/${product.id}?mode=checkout`}
                        className="flex items-center gap-2 px-4 py-2 bg-[#742384] text-white text-sm font-bold rounded-xl hover:bg-[#5a1b66] transition-all shadow hover:shadow-lg"
                    >
                        <ShoppingCart size={15} />
                        Realizar Pedido
                    </Link>
                )}
            </div>
        </div>
    )

    // ══════════════════════════════════════════
    // MODO VITRINA SEO
    // ══════════════════════════════════════════
    if (!isCheckout) {
        return (
            <div className="min-h-screen bg-gray-50">
                {TopNav}

                {/* Main product showcase */}
                <div className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 py-10">
                        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
                            {/* Image viewer */}
                            <div className="w-full md:w-1/2 lg:w-2/5">
                                <ProductImageViewer images={allImages} productName={product.name} />
                            </div>

                            {/* Info panel */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                                        {product.name}
                                    </h1>
                                    {basePrice > 0 && (
                                        <div className="flex items-center gap-2 mt-3">
                                            <Tag size={16} className="text-[#742384]" />
                                            <p className="text-sm text-gray-500">Desde</p>
                                            <p className="text-2xl font-black text-[#742384]">
                                                S/ {basePrice.toFixed(2)}
                                            </p>
                                            <span className="text-sm text-gray-400">/ millar</span>
                                        </div>
                                    )}
                                </div>

                                {product.description && (
                                    <div className="prose prose-gray max-w-none">
                                        <p className="text-gray-600 leading-relaxed text-base">
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* CTA block */}
                                <div className="pt-4 border-t border-gray-100">
                                    <Link
                                        href={`/product/${product.id}?mode=checkout`}
                                        className="flex items-center justify-center gap-3 w-full py-4 bg-[#742384] text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-[#5a1b66] hover:shadow-xl transition-all hover:scale-[1.02] active:scale-100"
                                    >
                                        <ShoppingCart size={22} />
                                        Realizar Pedido
                                    </Link>
                                    <p className="text-center text-xs text-gray-400 mt-3">
                                        Sin compromisos · Elige cantidad y método de pago en el siguiente paso
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ══════════════════════════════════════════
    // MODO CHECKOUT LIMPIO
    // ══════════════════════════════════════════
    const thumbImage = product.image_url ? normalizeImagePath(product.image_url) : null

    return (
        <div className="min-h-screen bg-gray-50">
            {TopNav}

            {/* Mini product summary bar */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    {thumbImage && (
                        <img
                            src={thumbImage}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base truncate">{product.name}</p>
                        {basePrice > 0 && (
                            <p className="text-sm text-[#742384] font-semibold">
                                Desde S/ {basePrice.toFixed(2)} / millar
                            </p>
                        )}
                    </div>
                    <div className="hidden sm:block text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-[#742384] text-xs font-bold rounded-full border border-purple-100">
                            <ShoppingCart size={12} />
                            Realizando Pedido
                        </span>
                    </div>
                </div>
            </div>

            {/* Purchase Wizard — full focus */}
            <PurchaseStepperProvider product={product}>
                <PurchaseWizard />
            </PurchaseStepperProvider>
        </div>
    )
}

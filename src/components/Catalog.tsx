'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ShoppingBag, Loader2, ArrowRight, ShoppingCart } from 'lucide-react'

// Helper function to normalize image paths
function normalizeImagePath(path: string | null): string {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('/')) return path
    if (path.startsWith('images/')) return `/${path}`
    return `/images/${path}`
}

interface PriceConfig {
    tiers: Array<{
        quantity: number;
        market_price: number;
        bulk_price: number;
    }>;
    cash_discount_percent: number;
    deposit_percent: number;
}

interface Product {
    id: string
    name: string
    description: string | null
    image_url: string | null
    secondary_images?: string[] | null
    unit_reference_price?: number
    price_config?: PriceConfig
}

export default function Catalog() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true)
            const supabase = createClient()
            try {
                const { data, error } = await supabase.from('products').select('*')
                if (error || !data || data.length === 0) {
                    console.error('Error fetching products:', error)
                } else {
                    setProducts(data)
                }
            } catch (err) {
                console.error('Unexpected error', err)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[#742384]" size={48} />
            </div>
        )
    }

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Nuestros Productos</h2>
                <p className="text-lg text-gray-500">
                    Selecciona el producto ideal para tu negocio. Calidad garantizada y entrega puntual en todo Huancayo.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                    const hoverImage = product.secondary_images?.[0] ?? null
                    const basePrice = product.unit_reference_price && product.unit_reference_price > 0
                        ? product.unit_reference_price
                        : product.price_config?.tiers?.[0]?.bulk_price ?? 0

                    return (
                        <div
                            key={product.id}
                            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full hover:-translate-y-1"
                        >
                            {/* ── Image & Title → Vitrina ── */}
                            <Link href={`/product/${product.id}`} className="block relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                {product.image_url ? (
                                    <>
                                        <img
                                            src={normalizeImagePath(product.image_url)}
                                            alt={product.name}
                                            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500"
                                        />
                                        {hoverImage && (
                                            <img
                                                src={normalizeImagePath(hoverImage)}
                                                alt={`${product.name} — vista alternativa`}
                                                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500 opacity-0 group-hover:opacity-100"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                        <ShoppingBag size={48} className="opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#742384] shadow-sm z-10">
                                    Personalizable
                                </div>
                            </Link>

                            <div className="p-6 flex-1 flex flex-col">
                                {/* Title → Vitrina */}
                                <Link href={`/product/${product.id}`}>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 hover:text-[#742384] transition-colors">
                                        {product.name}
                                    </h3>
                                </Link>
                                <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                                    {product.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-gray-100 flex items-end justify-between gap-3">
                                    {/* Price */}
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Desde x Millar</p>
                                        <p className="text-2xl font-black text-[#742384]">
                                            S/ {basePrice > 0 ? basePrice.toFixed(2) : '—'}
                                        </p>
                                    </div>

                                    {/* CTA → Checkout directo */}
                                    <Link
                                        href={`/product/${product.id}?mode=checkout`}
                                        className="flex items-center gap-2 px-5 py-3 bg-[#742384] text-white rounded-xl text-sm font-bold hover:bg-[#5a1b66] transition-all shadow hover:shadow-lg hover:scale-105 active:scale-95 group/btn"
                                    >
                                        <ShoppingCart size={16} />
                                        Realizar Pedido
                                        <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>

                                {/* Secondary link → ver detalles */}
                                <Link
                                    href={`/product/${product.id}`}
                                    className="mt-3 text-center text-xs text-gray-400 hover:text-[#742384] transition-colors underline-offset-2 hover:underline"
                                >
                                    Ver detalles del producto
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            {products.length === 0 && !loading && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                        🔍
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No encontramos productos</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Parece que aún no hemos cargado productos en el sistema.
                        Por favor revisa la vista <code className="bg-gray-200 px-1 rounded">public_prices</code> en Supabase.
                    </p>
                </div>
            )}
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProductWithConfig } from '@/types/purchase-stepper'
import { PurchaseStepperProvider } from '@/contexts/PurchaseStepperContext'
import PurchaseWizard from '@/components/PurchaseWizard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Utility: Normalize image paths to always be absolute
const normalizeImagePath = (path: string | null): string => {
    if (!path) return '/images/placeholder.png'; // Fallback
    // If already starts with / or http, return as is
    if (path.startsWith('/') || path.startsWith('http')) return path;
    // Otherwise, prepend / to make it absolute from root
    return `/${path}`;
};

export default function ProductPage() {
    const params = useParams()
    const [product, setProduct] = useState<ProductWithConfig | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProduct() {
            if (!params.id) return
            const supabase = createClient()
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single()

            if (data) {
                // Transform product data to include price_config
                // If price_config doesn't exist yet (before migration), create from legacy fields
                const productWithConfig: ProductWithConfig = {
                    ...data,
                    price_config: data.price_config || {
                        tiers: [
                            { quantity: 1000, market_price: 95, bulk_price: data.base_price_1k || 59, full_payment_bonus: 2 },
                            { quantity: 2000, market_price: 190, bulk_price: data.base_price_2k || 110, full_payment_bonus: 2 },
                            { quantity: 3000, market_price: 285, bulk_price: data.base_price_3k || 160, full_payment_bonus: 3 },
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
                console.error("Error fetching product", error)
            }
            setLoading(false)
        }
        fetchProduct()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#742384] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando producto...</p>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-500 mb-4">Producto no encontrado</p>
                    <Link href="/" className="text-[#742384] underline">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Back Button */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-600 hover:text-[#742384] transition-colors w-fit"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Volver</span>
                    </Link>
                </div>
            </div>

            {/* Product Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-6">
                        {product.image_url && (
                            <img
                                src={normalizeImagePath(product.image_url)}
                                alt={product.name}
                                className="w-32 h-32 object-contain bg-gray-50 rounded-lg border"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                            {product.description && (
                                <p className="text-gray-600 mt-2">{product.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Wizard */}
            <PurchaseStepperProvider product={product}>
                <PurchaseWizard />
            </PurchaseStepperProvider>
        </div>
    )
}

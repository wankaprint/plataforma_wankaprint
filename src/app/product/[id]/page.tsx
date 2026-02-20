import { Suspense } from 'react'
import ProductPageClient from './ProductPageClient'

export const runtime = 'edge';

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#742384] mx-auto" />
                <p className="mt-4 text-gray-600">Cargando producto...</p>
            </div>
        </div>
    )
}

export default function ProductPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ProductPageClient />
        </Suspense>
    )
}

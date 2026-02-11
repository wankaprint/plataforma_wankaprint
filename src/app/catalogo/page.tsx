import Catalog from '@/components/Catalog'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Catálogo de Productos | WankaPrint',
    description: 'Explora nuestros productos de imprenta: tarjetas, volantes, banners y más.',
}

export default function CatalogPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Catálogo Completo</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Encuentra todo lo que necesitas para la publicidad impresa de tu empresa.
                        Precios competitivos y calidad A1.
                    </p>
                </div>
                <Catalog />
            </div>
        </div>
    )
}

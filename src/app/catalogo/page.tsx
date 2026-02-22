import Catalog from '@/components/Catalog'
import { Metadata } from 'next'
import * as motion from 'framer-motion/client'

export const metadata: Metadata = {
    title: 'Catálogo de Productos | WankaPrint',
    description: 'Explora nuestros productos de imprenta: tarjetas, volantes, banners y más.',
}

export default function CatalogPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-20 text-center space-y-4"
                >
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                        Impresiones que hacen <br className="hidden md:block" />
                        <span className="text-[#742384]">crecer tu negocio</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                        Todo lo que necesitas para tu publicidad impresa en un solo lugar.
                    </p>
                </motion.div>

                <Catalog />
            </div>
        </div>
    )
}

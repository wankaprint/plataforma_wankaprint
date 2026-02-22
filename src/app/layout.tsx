import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import WhatsAppButton from '@/components/WhatsAppButton'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'WankaPrint - Imprenta Online',
    description: 'Impresiones de calidad en Perú',
    icons: {
        icon: '/images/iconos/logo_circulo.png',
        shortcut: '/images/iconos/logo_circulo.png',
        apple: '/images/iconos/logo_circulo.png',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                        {children}
                    </main>
                    <footer className="bg-gray-900 text-white py-8">
                        <div className="container mx-auto px-4 text-center">
                            <p>© {new Date().getFullYear()} WankaPrint. Todos los derechos reservados.</p>
                        </div>
                    </footer>
                </div>
                <Suspense fallback={null}>
                    <WhatsAppButton />
                </Suspense>
            </body>
        </html>
    )
}

'use client'

import Link from 'next/link'
import { CheckCircle2, MessageCircle } from 'lucide-react'

export default function ThankYou() {
    const whatsappNumber = "51987654321" // Replace with real number

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                <CheckCircle2 size={64} />
            </div>
            <h1 className="text-3xl font-bold">¡Pedido Recibido!</h1>
            <p className="text-gray-600">
                Estamos validando tu pago. Por favor envía el comprobante por WhatsApp para acelerar el proceso.
            </p>

            <div className="space-y-4 w-full">
                <a
                    href={`https://wa.me/${whatsappNumber}?text=Hola, acabo de hacer un pedido en WankaPrint.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    <MessageCircle size={20} />
                    Contactar por WhatsApp
                </a>

                <Link
                    href="/"
                    className="block text-gray-500 hover:text-[#742384] font-medium"
                >
                    Volver al Inicio
                </Link>
            </div>
        </div>
    )
}

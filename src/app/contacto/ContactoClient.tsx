'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, MapPin, Clock, Send, CheckCircle, Loader2, Navigation } from 'lucide-react'

/* ───────────────────────────────────────────────
   Puntos de Entrega — Estructura escalable
   Para añadir un nuevo punto, simplemente agrega
   un nuevo objeto al array.
   ─────────────────────────────────────────────── */

interface PuntoEntrega {
    id: string
    nombre: string
    direccion: string
    horarios: string
    mapEmbedUrl: string // URL completa del iframe embed de Google Maps
}

const PUNTOS_DE_ENTREGA: PuntoEntrega[] = [
    {
        id: 'huancayo-central',
        nombre: 'Punto Central – Huancayo',
        direccion: 'Jr. Lima 1073, Huancayo 12001',
        horarios: 'Lunes a Sábado: 9:00 AM – 7:00 PM',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243.84827548955397!2d-75.21611413840115!3d-12.072913920143037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e965b20d599a7%3A0x738f80d6741cf835!2sJr.%20Lima%201073%2C%20Huancayo%2012001!5e0!3m2!1ses-419!2spe!4v1771615522512!5m2!1ses-419!2spe',
    },
    {
        id: 'huancayo-cusco',
        nombre: 'Punto Cusco – Huancayo',
        direccion: 'Jr. Cusco 437, Huancayo 12001',
        horarios: 'Lunes a Sábado: 9:00 AM – 7:00 PM',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d975.413367524265!2d-75.21219683047694!3d-12.067346987790543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e964f40450221%3A0x2a4fd83a22702572!2sJiron%20Cusco%20437%2C%20Huancayo%2012001!5e0!3m2!1ses-419!2spe!4v1771615821062!5m2!1ses-419!2spe',
    },
    // ← Añade más puntos de entrega aquí fácilmente, por ejemplo:
    // {
    //     id: 'chilca',
    //     nombre: 'Punto Chilca',
    //     direccion: 'Av. Huancavelica 456, Chilca',
    //     horarios: 'Lunes a Viernes: 10:00 AM – 6:00 PM',
    //     mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!...',
    // },
]

export default function ContactoClient() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [selectedPunto, setSelectedPunto] = useState<string>(PUNTOS_DE_ENTREGA[0].id)

    const puntoActivo = PUNTOS_DE_ENTREGA.find((p) => p.id === selectedPunto) ?? PUNTOS_DE_ENTREGA[0]

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            service_type: formData.get('service_type') as string,
            message: formData.get('message') as string,
        }

        try {
            const supabase = createClient()

            // 1. Save to Supabase
            const { error } = await (supabase as any).from('quotes').insert([data])
            if (error) throw error

            setSuccess(true)

            // 2. Redirect to WhatsApp
            const waMessage = `Hola WankaPrint, soy ${data.name}. Quisiera cotizar servicio de: ${data.service_type}. Detalles: ${data.message}`
            const waUrl = `https://wa.me/51954992500?text=${encodeURIComponent(waMessage)}`

            setTimeout(() => {
                window.open(waUrl, '_blank')
                setLoading(false)
            }, 1000)

        } catch (error) {
            console.error('Error submitting quote:', error)
            alert('Hubo un error al enviar tu cotización. Inténtalo de nuevo.')
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cotización Enviada!</h2>
                    <p className="text-gray-500 mb-8">
                        Tus datos se guardaron correctamente. Te estamos redirigiendo a WhatsApp para finalizar la atención...
                    </p>
                    <button onClick={() => window.location.reload()} className="text-[#742384] font-medium hover:underline">
                        Volver al formulario
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Contáctanos</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Estamos listos para hacer realidad tus proyectos de impresión.
                        Visítanos o escríbenos para una cotización inmediata.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* ── Puntos de Entrega + Mapa ── */}
                    <div className="space-y-6">
                        {/* Sección: Puntos de Entrega */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-[#742384] rounded-xl text-white">
                                    <Navigation size={22} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Puntos de Entrega</h3>
                            </div>

                            {/* Mensaje de contexto */}
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                <p className="text-sm text-purple-800 leading-relaxed">
                                    Para mantener nuestros precios bajos y procesos rápidos, operamos mediante
                                    puntos de entrega estratégicos. <strong>Elige el más cercano al realizar tu pedido.</strong>
                                </p>
                            </div>

                            {/* Cards de puntos de entrega */}
                            <div className="space-y-3">
                                {PUNTOS_DE_ENTREGA.map((punto) => {
                                    const isActive = punto.id === selectedPunto
                                    return (
                                        <button
                                            key={punto.id}
                                            type="button"
                                            onClick={() => setSelectedPunto(punto.id)}
                                            className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${isActive
                                                ? 'border-[#742384] bg-purple-50 shadow-md shadow-purple-100'
                                                : 'border-gray-100 bg-gray-50 hover:border-purple-200 hover:bg-purple-50/50'
                                                }`}
                                        >
                                            <p className={`font-bold text-base mb-2 ${isActive ? 'text-[#742384]' : 'text-gray-900'}`}>
                                                {punto.nombre}
                                            </p>

                                            <div className="flex items-center gap-2 mb-1.5">
                                                <MapPin size={15} className={isActive ? 'text-[#742384]' : 'text-gray-400'} />
                                                <span className="text-sm text-gray-600">{punto.direccion}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Clock size={15} className={isActive ? 'text-[#742384]' : 'text-gray-400'} />
                                                <span className="text-sm text-gray-600">{punto.horarios}</span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Contacto general */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl text-green-600">
                                <Phone size={22} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">WhatsApp / Teléfono</p>
                                <a href="https://wa.me/51983555435" target="_blank" rel="noopener noreferrer" className="text-[#742384] font-medium hover:underline">
                                    +51 983 555 435
                                </a>
                            </div>
                        </div>

                        {/* Google Maps iframe */}
                        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <iframe
                                title={`Mapa – ${puntoActivo.nombre}`}
                                src={puntoActivo.mapEmbedUrl}
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full aspect-video"
                            />
                        </div>
                    </div>

                    {/* ── Formulario de Cotización (sin cambios) ── */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicitar Cotización</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Nombre Completo</label>
                                    <input required name="name" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all" placeholder="Juan Pérez" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Teléfono</label>
                                    <input required name="phone" type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all" placeholder="999 999 999" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Correo Electrónico</label>
                                <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all" placeholder="juan@ejemplo.com" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Servicio de Interés</label>
                                <select name="service_type" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white">
                                    <option value="Tarjetas de Presentación">Tarjetas de Presentación</option>
                                    <option value="Volantes / Flyers">Volantes / Flyers</option>
                                    <option value="Gigantografías">Gigantografías</option>
                                    <option value="Merchandising">Merchandising</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Detalles del Proyecto</label>
                                <textarea required name="message" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all" placeholder="Describe cantidad, tamaño, material, etc..."></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#742384] text-white rounded-xl font-bold hover:bg-[#5a1b66] transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} /> Enviar Cotización
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

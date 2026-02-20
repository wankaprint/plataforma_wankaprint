'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Phone, MapPin, Clock, Send, CheckCircle, Loader2,
    Users, Monitor, Truck, ScanSearch
} from 'lucide-react'

/* ───────────────────────────────────────────────
   Puntos de Entrega — Estructura escalable
   ─────────────────────────────────────────────── */

interface PuntoEntrega {
    id: string
    nombre: string
    direccion: string
    horarios: string
    mapEmbedUrl: string
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
        nombre: 'Punto Cusco – Huancayo - Altura de Panda',
        direccion: 'Jr. Cusco 437, Huancayo 12001',
        horarios: 'Lunes a Sábado: 9:00 AM – 7:00 PM',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d975.413367524265!2d-75.21219683047694!3d-12.067346987790543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e964f40450221%3A0x2a4fd83a22702572!2sJiron%20Cusco%20437%2C%20Huancayo%2012001!5e0!3m2!1ses-419!2spe!4v1771615821062!5m2!1ses-419!2spe',
    },
    // ← Añade más puntos aquí
]

/* ───────────────────────────────────────────────
   Propuestas de Valor — 3 columnas
   ─────────────────────────────────────────────── */

const PROPUESTAS_VALOR = [
    {
        icon: Users,
        titulo: 'Atención Humana',
        texto: 'Hablas directamente con expertos gráficos, sin intermediarios.',
    },
    {
        icon: Monitor,
        titulo: 'Proceso Digital',
        texto: 'Desde el envío de archivos hasta la entrega, todo bajo tu control.',
    },
    {
        icon: Truck,
        titulo: 'Recojo Flexible',
        texto: 'Utiliza nuestra red de puntos de entrega estratégicos en la ciudad.',
        href: null,
    },
    {
        icon: ScanSearch,
        titulo: 'Sigue tu Pedido en Vivo',
        texto: 'Verifica el estado de tu pedido con el código asignado al momento de pagar.',
        href: '/rastreo',
    },
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
            const { error } = await (supabase as any).from('quotes').insert([data])
            if (error) throw error

            setSuccess(true)

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
        <div className="min-h-screen bg-gray-50">

            {/* ═══════════════════════════════════════
                HERO — Headline persuasivo
               ═══════════════════════════════════════ */}
            <section className="pt-16 pb-10 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-5">
                        Hablemos de tu próximo<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#742384] to-purple-500">
                            gran proyecto.
                        </span>
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        En WankaPrint no hay procesos lentos. Respondemos más rápido de lo que
                        imaginas porque sabemos que <strong className="text-gray-700">tu negocio no puede esperar.</strong>
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════
                BLOQUE DE VALOR — 3 columnas
               ═══════════════════════════════════════ */}
            <section className="pb-12 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {PROPUESTAS_VALOR.map((prop) => (
                        <div
                            key={prop.titulo}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-200 group"
                        >
                            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#742384] flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-[#742384] group-hover:text-white transition-all duration-200">
                                <prop.icon size={22} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">{prop.titulo}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-3">{prop.texto}</p>
                            {prop.href && (
                                <a
                                    href={prop.href}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#742384] hover:underline"
                                >
                                    Rastrear ahora →
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════
                PUNTOS DE ENTREGA + MAPA INTERACTIVO
               ═══════════════════════════════════════ */}
            <section className="pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Puntos de Entrega</h2>
                        <p className="text-gray-500 text-sm max-w-xl">
                            Para mantener nuestros precios bajos y procesos rápidos, operamos mediante
                            puntos de entrega estratégicos. <strong className="text-gray-600">Elige el más cercano al realizar tu pedido.</strong>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Cards de puntos — 2 columnas en lg */}
                        <div className="lg:col-span-2 space-y-3">
                            {PUNTOS_DE_ENTREGA.map((punto) => {
                                const isActive = punto.id === selectedPunto
                                return (
                                    <button
                                        key={punto.id}
                                        type="button"
                                        onClick={() => setSelectedPunto(punto.id)}
                                        className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${isActive
                                            ? 'border-[#742384] bg-purple-50 shadow-md shadow-purple-100'
                                            : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/50'
                                            }`}
                                    >
                                        <p className={`font-bold text-base mb-2 ${isActive ? 'text-[#742384]' : 'text-gray-900'}`}>
                                            {punto.nombre}
                                        </p>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <MapPin size={14} className={isActive ? 'text-[#742384]' : 'text-gray-400'} />
                                            <span className="text-sm text-gray-600">{punto.direccion}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className={isActive ? 'text-[#742384]' : 'text-gray-400'} />
                                            <span className="text-sm text-gray-500">{punto.horarios}</span>
                                        </div>
                                    </button>
                                )
                            })}

                            {/* WhatsApp rápido */}
                            <a
                                href="https://wa.me/51983555435"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition-all duration-200"
                            >
                                <div className="p-2.5 bg-green-500 rounded-lg text-white">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">¿Dudas? Escríbenos al instante</p>
                                    <p className="text-green-700 text-sm font-medium">+51 983 555 435</p>
                                </div>
                            </a>
                        </div>

                        {/* Mapa — 3 columnas en lg */}
                        <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100 min-h-[350px]">
                            <iframe
                                key={puntoActivo.id}
                                title={`Mapa – ${puntoActivo.nombre}`}
                                src={puntoActivo.mapEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0, minHeight: 400 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
                FORMULARIO DE COTIZACIÓN
               ═══════════════════════════════════════ */}
            <section className="pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Solicitar Cotización</h3>
                        <p className="text-sm text-gray-400 mb-8">Responderemos en menos de 1 hora por WhatsApp.</p>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre</label>
                                    <input required name="name" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm" placeholder="Juan Pérez" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Teléfono</label>
                                    <input required name="phone" type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm" placeholder="999 999 999" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Correo</label>
                                <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm" placeholder="juan@ejemplo.com" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Servicio</label>
                                <select name="service_type" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white text-sm">
                                    <option value="Tarjetas de Presentación">Tarjetas de Presentación</option>
                                    <option value="Volantes / Flyers">Volantes / Flyers</option>
                                    <option value="Gigantografías">Gigantografías</option>
                                    <option value="Merchandising">Merchandising</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Detalles</label>
                                <textarea required name="message" rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm" placeholder="Cantidad, tamaño, material..."></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#742384] text-white rounded-xl font-bold hover:bg-[#5a1b66] transition-all transform active:scale-95 flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} /> Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} /> Enviar Cotización
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Phone, MapPin, Clock, Send, CheckCircle, Loader2,
    Users, Monitor, Truck, ScanSearch,
    User, Package2, AlignLeft, Hash, MessageCircle,
} from 'lucide-react'

/* ───────────────────────────────────────────────
   Puntos de Entrega
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
        mapEmbedUrl:
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243.84827548955397!2d-75.21611413840115!3d-12.072913920143037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e965b20d599a7%3A0x738f80d6741cf835!2sJr.%20Lima%201073%2C%20Huancayo%2012001!5e0!3m2!1ses-419!2spe!4v1771615522512!5m2!1ses-419!2spe',
    },
    {
        id: 'huancayo-cusco',
        nombre: 'Punto Cusco – Huancayo - Altura de Panda',
        direccion: 'Jr. Cusco 437, Huancayo 12001',
        horarios: 'Lunes a Sábado: 9:00 AM – 7:00 PM',
        mapEmbedUrl:
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d975.413367524265!2d-75.21219683047694!3d-12.067346987790543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e964f40450221%3A0x2a4fd83a22702572!2sJiron%20Cusco%20437%2C%20Huancayo%2012001!5e0!3m2!1ses-419!2spe!4v1771615821062!5m2!1ses-419!2spe',
    },
]

/* ───────────────────────────────────────────────
   Value props
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

/* ───────────────────────────────────────────────
   Product type cards
   ─────────────────────────────────────────────── */
interface ProductCard {
    value: string
    label: string
    emoji: string
}

const PRODUCT_TYPES: ProductCard[] = [
    { value: 'Tarjetas de Presentación', label: 'Tarjetas', emoji: '🪪' },
    { value: 'Volantes / Flyers', label: 'Volantes', emoji: '📄' },
    { value: 'Gigantografías', label: 'Gigantografía', emoji: '🖼️' },
    { value: 'Merchandising', label: 'Merchandising', emoji: '🎁' },
    { value: 'Banners', label: 'Banners', emoji: '🏷️' },
    { value: 'Otro', label: 'Otro', emoji: '✏️' },
]

const WA_NUMBER = '51983555435'

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function ContactoClient() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [selectedPunto, setSelectedPunto] = useState<string>(PUNTOS_DE_ENTREGA[0].id)
    const [productType, setProductType] = useState<string>(PRODUCT_TYPES[0].value)
    const [submittedData, setSubmittedData] = useState<{ customer_name: string; product_type: string } | null>(null)

    const puntoActivo = PUNTOS_DE_ENTREGA.find((p) => p.id === selectedPunto) ?? PUNTOS_DE_ENTREGA[0]

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const rawName = formData.get('customer_name')
        const rawWhatsapp = formData.get('whatsapp')
        const rawDesc = formData.get('description')
        const rawQty = formData.get('quantity')

        // Columns must match the `quotes` table exactly
        const payload = {
            customer_name: typeof rawName === 'string' ? rawName.trim() : '',
            whatsapp: typeof rawWhatsapp === 'string' ? rawWhatsapp.trim() : '',
            product_type: productType,
            quantity: rawQty ? parseInt(rawQty as string, 10) : null,
            description: typeof rawDesc === 'string' ? rawDesc.trim() : '',
        }

        // Quick validation
        if (!payload.customer_name || !payload.whatsapp) {
            alert('Por favor completa los campos obligatorios.')
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()

            // Log for debugging if needed (only in dev)
            if (process.env.NODE_ENV === 'development') {
                console.log('Enviando cotización:', payload)
            }

            const { error: insertError } = await (supabase as any).from('quotes').insert([payload])

            if (insertError) {
                console.error('Supabase Error Details:', insertError)
                throw new Error(insertError.message || 'Error desconocido en Supabase')
            }

            setSubmittedData({ customer_name: payload.customer_name, product_type: payload.product_type })
            setSuccess(true)
        } catch (err: any) {
            console.error('Submission Crash:', err)
            alert(`Error al enviar: ${err.message || 'Inténtalo de nuevo'}`)
        } finally {
            setLoading(false)
        }
    }

    /* ── Success screen ── */
    if (success && submittedData) {
        const waMsg = encodeURIComponent(
            `Hola WankaPrint 👋, soy ${submittedData.customer_name}. Acabo de enviar una cotización desde la web para: ${submittedData.product_type}. ¿Me pueden ayudar?`
        )
        const waUrl = `https://wa.me/${WA_NUMBER}?text=${waMsg}`

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">¡Cotización recibida!</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Un asesor te contactará en breve. Si quieres <strong className="text-gray-700">acelerar tu atención</strong>, escríbenos por WhatsApp ahora mismo.
                    </p>

                    {/* WhatsApp CTA — high-visibility */}
                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-black text-base shadow-lg hover:opacity-90 transition-all mb-4"
                        style={{ background: '#25D366' }}
                    >
                        <MessageCircle size={20} />
                        Acelerar pedido por WhatsApp
                    </a>

                    <button
                        onClick={() => { setSuccess(false); setSubmittedData(null) }}
                        className="text-sm text-[#742384] font-medium hover:underline"
                    >
                        Enviar otra cotización
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ═══ HERO ═══ */}
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
                        imaginas porque sabemos que{' '}
                        <strong className="text-gray-700">tu negocio no puede esperar.</strong>
                    </p>
                </div>
            </section>

            {/* ═══ PROPUESTAS DE VALOR ═══ */}
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
                            {'href' in prop && prop.href && (
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

            {/* ═══ PUNTOS DE ENTREGA ═══ */}
            <section className="pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Puntos de Entrega</h2>
                        <p className="text-gray-500 text-sm max-w-xl">
                            Para mantener nuestros precios bajos y procesos rápidos, operamos mediante
                            puntos de entrega estratégicos.{' '}
                            <strong className="text-gray-600">Elige el más cercano al realizar tu pedido.</strong>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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

                            <a
                                href={`https://wa.me/${WA_NUMBER}`}
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

            {/* ═══ FORMULARIO DE COTIZACIÓN ═══ */}
            <section className="pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-black text-gray-900 mb-1">Solicitar Cotización</h3>
                        <p className="text-sm text-gray-400 mb-8">Respondemos en menos de 1 hora por WhatsApp.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Nombre + WhatsApp */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                        <User size={12} className="text-[#742384]" /> Nombre completo
                                    </label>
                                    <input
                                        required
                                        name="customer_name"
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                        <Phone size={12} className="text-[#742384]" /> WhatsApp
                                    </label>
                                    <input
                                        required
                                        name="whatsapp"
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                                        placeholder="999 999 999"
                                    />
                                </div>
                            </div>

                            {/* Product type — visual cards */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                    <Package2 size={12} className="text-[#742384]" /> Tipo de producto
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {PRODUCT_TYPES.map((pt) => (
                                        <button
                                            key={pt.value}
                                            type="button"
                                            onClick={() => setProductType(pt.value)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-bold transition-all duration-150 ${productType === pt.value
                                                ? 'border-[#742384] bg-purple-50 text-[#742384] shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:bg-purple-50/40'
                                                }`}
                                        >
                                            <span className="text-2xl">{pt.emoji}</span>
                                            <span>{pt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                    <Hash size={12} className="text-[#742384]" /> Cantidad (unidades o millares)
                                </label>
                                <input
                                    name="quantity"
                                    type="number"
                                    min={1}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                                    placeholder="Ej: 500"
                                />
                            </div>

                            {/* Descripción */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                    <AlignLeft size={12} className="text-[#742384]" /> Detalles del diseño
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#742384] focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm resize-none"
                                    placeholder="Tamaño, colores, material, si tienes diseño listo o necesitas diseño..."
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#742384] text-white rounded-xl font-black hover:bg-[#5a1b66] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
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

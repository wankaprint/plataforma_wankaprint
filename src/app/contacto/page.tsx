'use client'

export const runtime = 'edge';

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react'

export default function ContactPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

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
            const waUrl = `https://wa.me/51954992500?text=${encodeURIComponent(waMessage)}` // Using placeholder number, should be env var

            // Small delay to show success state before redirect
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
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">Información de Contacto</h3>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg text-[#742384]">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Dirección</p>
                                    <p className="text-gray-600">Av. Giráldez 123, Huancayo, Perú</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg text-[#742384]">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Teléfono / WhatsApp</p>
                                    <p className="text-gray-600">+51 983 555 435</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg text-[#742384]">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Horario de Atención</p>
                                    <p className="text-gray-600">Lunes a Sábado: 9:00 AM - 7:00 PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-gray-200 rounded-2xl aspect-video w-full flex items-center justify-center text-gray-500 font-medium">
                            Mapa de Ubicación (Google Maps)
                        </div>
                    </div>

                    {/* Form */}
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

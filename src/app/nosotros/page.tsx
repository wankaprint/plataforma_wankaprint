'use client'

import { CheckCircle, MapPin, Users, Heart } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-[#742384] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5a1b66] to-[#9c2fae] opacity-90"></div>
                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Más que una Imprenta
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto text-purple-100">
                        Somos el socio estratégico de los emprendedores de Huancayo.
                        Calidad, rapidez y tecnología al servicio de tu marca.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Wrapper for Image */}
                        <div className="lg:w-1/2">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                                <img
                                    src="/images/modern_print_workshop.png"
                                    alt="Equipo WankaPrint"
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <p className="font-bold text-lg">Equipo WankaPrint</p>
                                    <p className="text-sm opacity-80">Huancayo, Perú</p>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="lg:w-1/2 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Nuestra Historia
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Nacimos con una misión clara: **modernizar la industria gráfica en el centro del Perú**.
                                    Sabemos que los negocios hoy necesitan velocidad y calidad sin complicaciones.
                                    Por eso, creamos WankaPrint, una plataforma que elimina las barreras tradicionales
                                    de las imprentas antiguas.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <h3 className="font-bold text-[#742384] flex items-center gap-2 mb-2">
                                        <Users size={20} /> Pasión Local
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Entendemos el mercado de Huancayo y apoyamos a los negocios locales.
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <h3 className="font-bold text-[#742384] flex items-center gap-2 mb-2">
                                        <CheckCircle size={20} /> Calidad Total
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Insumos de primera y maquinaria moderna para acabados impecables.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Link href="/catalogo" className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-[#742384] transition-colors shadow-lg shadow-purple-900/20">
                                    Ver Nuestros Servicios
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Strip */}
            <section className="bg-gray-50 py-16 border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md text-[#742384]">
                                <MapPin size={32} />
                            </div>
                            <h3 className="font-bold text-xl">Ubicación Céntrica</h3>
                            <p className="text-gray-500">Estamos en el corazón de Huancayo para estar cerca de ti.</p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md text-[#742384]">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="font-bold text-xl">Compromiso</h3>
                            <p className="text-gray-500">Cumplimos los plazos de entrega, porque tu tiempo vale oro.</p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md text-[#742384]">
                                <Heart size={32} />
                            </div>
                            <h3 className="font-bold text-xl">Amor por el Diseño</h3>
                            <p className="text-gray-500">Nos encanta ver cómo tus ideas cobran vida en papel.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

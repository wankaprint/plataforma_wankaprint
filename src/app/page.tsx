'use client'

import Catalog from '@/components/Catalog'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Truck, ShieldCheck } from 'lucide-react'
import InfiniteSlider from '@/components/InfiniteSlider'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-[#742384] overflow-hidden">
                {/* Background Pattern/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#5a1b66] to-[#9c2fae] opacity-90"></div>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2 text-white space-y-6">
                            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                                Impresión de Calidad <br />
                                <span className="text-yellow-400">Sin Complicaciones</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 max-w-lg">
                                La plataforma líder en Huancayo para tus necesidades de impresión.
                                Tarjetas, volantes, banners y más, directamente a tu negocio.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <a href="#catalogo" className="px-8 py-4 bg-white text-[#742384] font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                    Ver Productos <ArrowRight size={20} />
                                </a>
                            </div>

                            <div className="pt-8 flex items-center gap-6 text-sm font-medium text-white/80">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-400" /> Calidad Garantizada
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck size={16} className="text-blue-400" /> Envíos locales
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-yellow-400" /> Pago Seguro
                                </div>
                            </div>
                        </div>

                        {/* Hero Image / Illustration */}
                        <div className="md:w-1/2 flex justify-center">
                            <div className="relative w-full max-w-3xl aspect-square">
                                {/* Decor elements */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse delay-700"></div>

                                {/* Hero Image - Visual update */}
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src="/images/productos.png"
                                        alt="Productos WankaPrint"
                                        className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </section>

            {/* Slider Section */}
            <InfiniteSlider />

            {/* Catalog Preview Section */}
            <section id="catalogo" className="bg-gray-50 py-20 flex-1">
                <div className="container mx-auto px-4">
                    <Catalog />
                </div>
            </section>
        </div>
    )
}

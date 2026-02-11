'use client'

import { Palette, Clock, MapPin, Tag, UserCheck } from 'lucide-react'

const benefits = [
    { icon: Palette, text: 'Calidad de Color CMYK Garantizada' },
    { icon: Clock, text: 'Entregas en 24/48 Horas' },
    { icon: MapPin, text: 'Envíos a todo Huancayo' },
    { icon: Tag, text: 'Precios Especiales a partir de 1 Millar' },
    { icon: UserCheck, text: 'Asistencia integral de un Diseñador Gráfico' },
]

export default function InfiniteSlider() {
    return (
        <div className="w-full py-10 bg-white border-b border-gray-100 overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">¿POR QUÉ ELEGIR WANKAPRINT?</p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-infinite-scroll flex whitespace-nowrap gap-16 group-hover:paused">
                    {/* First Loop */}
                    {benefits.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 px-4">
                            <div className="p-3 bg-purple-50 rounded-full text-[#742384]">
                                <item.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm md:text-base font-bold text-gray-800">{item.text}</span>
                        </div>
                    ))}

                    {/* Second Loop (Duplicate for seamless scroll) */}
                    {benefits.map((item, index) => (
                        <div key={`dup-${index}`} className="flex items-center gap-3 px-4">
                            <div className="p-3 bg-purple-50 rounded-full text-[#742384]">
                                <item.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm md:text-base font-bold text-gray-800">{item.text}</span>
                        </div>
                    ))}

                    {/* Third Loop (Extra insurance for wide screens) */}
                    {benefits.map((item, index) => (
                        <div key={`dup2-${index}`} className="flex items-center gap-3 px-4">
                            <div className="p-3 bg-purple-50 rounded-full text-[#742384]">
                                <item.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm md:text-base font-bold text-gray-800">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* Gradients for smooth fade */}
                <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
                <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
            </div>
        </div>
    )
}

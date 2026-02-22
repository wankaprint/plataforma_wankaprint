'use client'

import { motion } from 'framer-motion'

export default function StepsSection() {
    return (
        <section className="bg-white py-24 overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20 space-y-4"
                >
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Tu publicidad lista en 4 pasos simples
                    </h2>
                    <p className="text-xl text-gray-500 font-medium max-w-3xl mx-auto">
                        Sin salir de tu negocio. Sin diseñadores externos. Sin perder tiempo.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Paso 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="group bg-white rounded-2xl p-2 pb-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100"
                    >
                        <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-xl">
                            <img
                                src="/images/como_comprar/1_pedido.jpg"
                                alt="Envía tu idea para impresión en Huancayo"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                            <div className="absolute top-4 left-4 w-10 h-10 bg-[#742384] text-white flex items-center justify-center rounded-full font-black shadow-lg">1</div>
                        </div>
                        <div className="px-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">1. Envía tu idea</h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-center">
                                Elige tu producto en la web y sube tu idea, boceto o foto referencial. Y si no tienes diseño lo coordínas con nuestro equipo de diseño.
                            </p>
                        </div>
                    </motion.div>

                    {/* Paso 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="group bg-white rounded-2xl p-2 pb-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100"
                    >
                        <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-xl">
                            <img
                                src="/images/como_comprar/2_diseno.jpg"
                                alt="Diseño profesional gratuito en WankaPrint"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                            <div className="absolute top-4 left-4 w-10 h-10 bg-[#742384] text-white flex items-center justify-center rounded-full font-black shadow-lg">2</div>
                        </div>
                        <div className="px-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">2. Apruebas tu diseño</h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-center">
                                Nuestro equipo crea tu diseño sin costo adicional y coordinamos todos los cambios por chat.
                            </p>
                        </div>
                    </motion.div>

                    {/* Paso 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="group bg-white rounded-2xl p-2 pb-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100"
                    >
                        <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-xl">
                            <img
                                src="/images/como_comprar/3_impresion.jpg"
                                alt="Impresión de alta calidad en Huancayo"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                            <div className="absolute top-4 left-4 w-10 h-10 bg-[#742384] text-white flex items-center justify-center rounded-full font-black shadow-lg">3</div>
                        </div>
                        <div className="px-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">3. Imprimimos con calidad</h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-center">
                                Con tu aprobación, pasamos a fase de impresion.
                            </p>
                        </div>
                    </motion.div>

                    {/* Paso 4 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="group bg-white rounded-2xl p-2 pb-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100"
                    >
                        <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-xl">
                            <img
                                src="/images/como_comprar/4_entrega.jpg"
                                alt="Entrega a domicilio en Huancayo"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                            <div className="absolute top-4 left-4 w-10 h-10 bg-[#742384] text-white flex items-center justify-center rounded-full font-black shadow-lg">4</div>
                        </div>
                        <div className="px-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">4. Recíbelo en tu puerta</h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-center">
                                Te entregamos el producto terminado directamente en tu negocio en Huancayo, o puedes recogerlo en nuestro local. ¡Así de simple y rápido!
                            </p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-20 text-center"
                >
                    <a
                        href="#catalogo"
                        className="inline-flex items-center justify-center px-12 py-5 bg-[#742384] text-white font-black text-xl rounded-full shadow-lg hover:bg-[#5a1b66] hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    >
                        ¡Empezar mi pedido ahora!
                        <svg className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    )
}

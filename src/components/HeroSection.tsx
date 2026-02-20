'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    useReducedMotion,
} from 'framer-motion'
import { ArrowRight, CheckCircle, Truck, ShieldCheck } from 'lucide-react'

// ── SVG noise filter for film-grain texture ──────────────────────────────────
const NOISE_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
  <filter id='n' x='0' y='0'>
    <feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/>
    <feColorMatrix type='saturate' values='0'/>
  </filter>
  <rect width='300' height='300' filter='url(%23n)' opacity='1'/>
</svg>
`.trim()

const NOISE_DATA_URI = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`

// ── Animation variants ───────────────────────────────────────────────────────
const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
}

const item = {
    hidden: { opacity: 0, y: 28 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: 'easeOut' as const },
    },
}

const imageVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.72, ease: 'easeOut' as const },
    },
}

// ════════════════════════════════════════════════════════════════════════════
export default function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const prefersReducedMotion = useReducedMotion()

    // Mouse parallax values
    const rawX = useMotionValue(0)
    const rawY = useMotionValue(0)

    // Spring-smooth the raw values for a fluid feel
    const smoothX = useSpring(rawX, { stiffness: 60, damping: 20 })
    const smoothY = useSpring(rawY, { stiffness: 60, damping: 20 })

    // Map mouse position [-0.5, 0.5] → rotation / translation
    const rotateY = useTransform(smoothX, [-0.5, 0.5], [-6, 6])
    const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5])
    const translateX = useTransform(smoothX, [-0.5, 0.5], [-12, 12])
    const translateY = useTransform(smoothY, [-0.5, 0.5], [-8, 8])

    useEffect(() => {
        // Disable parallax on touch / small screens
        if (prefersReducedMotion || typeof window === 'undefined') return

        const el = sectionRef.current
        if (!el) return

        const handleMove = (e: MouseEvent) => {
            if (window.innerWidth < 768) return // mobile: skip
            const rect = el.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width - 0.5
            const y = (e.clientY - rect.top) / rect.height - 0.5
            rawX.set(x)
            rawY.set(y)
        }

        const handleLeave = () => {
            rawX.set(0)
            rawY.set(0)
        }

        el.addEventListener('mousemove', handleMove)
        el.addEventListener('mouseleave', handleLeave)
        return () => {
            el.removeEventListener('mousemove', handleMove)
            el.removeEventListener('mouseleave', handleLeave)
        }
    }, [rawX, rawY, prefersReducedMotion])

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden"
            style={{
                background:
                    'radial-gradient(ellipse at 42% 55%, #9c2fae 0%, #5e1a6a 45%, #2d0938 100%)',
            }}
        >
            {/* ── Film grain overlay ── */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 mix-blend-overlay"
                style={{
                    backgroundImage: NOISE_DATA_URI,
                    backgroundRepeat: 'repeat',
                    opacity: 0.045,
                }}
            />

            {/* ── Ambient glow blobs ── */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-25"
                style={{ background: '#b44fc4' }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20"
                style={{ background: '#1a0030' }}
            />

            {/* ── Content ── */}
            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">

                    {/* LEFT — Text block */}
                    <motion.div
                        className="md:w-1/2 text-white space-y-6"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {/* Eyebrow */}
                        <motion.span
                            variants={item}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow-300/80 border border-yellow-400/20 bg-yellow-400/10 px-4 py-1.5 rounded-full"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                            Imprenta Digital en Huancayo
                        </motion.span>

                        {/* H1 */}
                        <motion.h1
                            variants={item}
                            className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight"
                        >
                            Impresión de{' '}
                            <span
                                className="text-yellow-400"
                                style={{
                                    textShadow: '0 0 28px rgba(234,179,8,0.45)',
                                }}
                            >
                                Calidad
                            </span>
                            <br />
                            Sin Complicaciones
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            variants={item}
                            className="text-lg md:text-xl text-white/85 max-w-lg leading-relaxed"
                        >
                            La plataforma líder en Huancayo para tus necesidades de impresión.
                            Tarjetas, volantes, banners y más — directamente a tu negocio.
                        </motion.p>

                        {/* CTA */}
                        <motion.div variants={item} className="flex flex-wrap gap-4 pt-2">
                            <motion.a
                                href="#catalogo"
                                className="px-8 py-4 bg-white text-[#742384] font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                                whileHover={{
                                    scale: 1.04,
                                    boxShadow: '0 0 30px 8px rgba(234,179,8,0.50)',
                                }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                Ver Productos <ArrowRight size={20} />
                            </motion.a>
                        </motion.div>

                        {/* Trust badges */}
                        <motion.div
                            variants={item}
                            className="pt-4 flex flex-wrap items-center gap-5 text-sm font-medium text-white/75"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
                                Calidad Garantizada
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck size={15} className="text-blue-300 flex-shrink-0" />
                                Envíos locales
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={15} className="text-yellow-400 flex-shrink-0" />
                                Pago Seguro
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT — Floating product image */}
                    <div className="md:w-1/2 flex justify-center">
                        <div className="relative w-full max-w-2xl aspect-square">

                            {/* Glow blobs behind image */}
                            <div
                                aria-hidden
                                className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse"
                            />
                            <div
                                aria-hidden
                                className="absolute -bottom-6 -left-6 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-15 animate-pulse"
                                style={{ animationDelay: '700ms' }}
                            />

                            {/* Parallax image wrapper */}
                            <motion.div
                                className="relative w-full h-full flex items-center justify-center"
                                variants={imageVariant}
                                initial="hidden"
                                animate="show"
                                style={
                                    prefersReducedMotion
                                        ? {}
                                        : {
                                            rotateX,
                                            rotateY,
                                            x: translateX,
                                            y: translateY,
                                            transformStyle: 'preserve-3d',
                                        }
                                }
                            >
                                <img
                                    src="/images/productos.png"
                                    alt="Productos WankaPrint"
                                    className="w-full h-auto object-contain select-none"
                                    style={{
                                        filter:
                                            'drop-shadow(0 32px 48px rgba(0,0,0,0.55)) drop-shadow(0 8px 20px rgba(116,35,132,0.45))',
                                    }}
                                    draggable={false}
                                />
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

'use client'

import { useEffect, useState } from 'react'

const WA_NUMBER = '51983554435'
const WA_MESSAGE = encodeURIComponent(
    '¡Hola WankaPrint! 👋 Vengo de la web y me gustaría realizar un pedido o recibir asesoría con un proyecto de impresión. ¿Me podrían ayudar?'
)
const WA_HREF = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`

export default function WhatsAppButton() {
    const [visible, setVisible] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)

    // Fade-in after mount, tooltip after 3 s
    useEffect(() => {
        const visTimer = setTimeout(() => setVisible(true), 300)
        const tipTimer = setTimeout(() => setShowTooltip(true), 3000)
        // Auto-hide tooltip after 6 s so it's not intrusive
        const hideTimer = setTimeout(() => setShowTooltip(false), 8000)
        return () => {
            clearTimeout(visTimer)
            clearTimeout(tipTimer)
            clearTimeout(hideTimer)
        }
    }, [])

    return (
        <div
            className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2"
            style={{ pointerEvents: visible ? 'auto' : 'none' }}
        >
            {/* Tooltip bubble */}
            <div
                className={`
                    transition-all duration-500
                    ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                `}
            >
                <div className="flex items-center gap-2 bg-white text-gray-800 text-sm font-medium px-4 py-2.5 rounded-2xl shadow-lg border border-gray-100 max-w-[220px] leading-snug">
                    <span className="text-base flex-shrink-0">💬</span>
                    ¿Dudas con tu pedido? ¡Escríbenos!
                    {/* Tail pointing down-right */}
                    <span
                        className="absolute -bottom-2 right-6 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45"
                        aria-hidden
                    />
                </div>
            </div>

            {/* WhatsApp button */}
            <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`
                    group relative flex items-center justify-center
                    w-14 h-14 rounded-full shadow-lg
                    transition-all duration-500 hover:scale-110 hover:shadow-xl
                    ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                `}
                style={{ backgroundColor: '#25D366' }}
            >
                {/* Pulse ring */}
                <span
                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: '#25D366', animationDuration: '2.5s' }}
                    aria-hidden
                />

                {/* WhatsApp SVG icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                    className="w-7 h-7 fill-white relative z-10"
                    aria-hidden
                >
                    <path d="M16 0C7.164 0 0 7.163 0 16c0 2.82.736 5.461 2.025 7.757L0 32l8.479-2.001A15.928 15.928 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0Zm0 29.333a13.26 13.26 0 0 1-6.756-1.844l-.485-.289-5.03 1.186 1.272-4.782-.317-.493A13.227 13.227 0 0 1 2.667 16C2.667 8.648 8.648 2.667 16 2.667S29.333 8.648 29.333 16 23.352 29.333 16 29.333Zm7.27-9.865c-.398-.199-2.354-1.162-2.72-1.294-.365-.133-.631-.199-.896.199-.266.398-1.03 1.294-1.263 1.56-.232.265-.465.298-.863.1-.398-.2-1.681-.619-3.202-1.976-1.183-1.056-1.982-2.36-2.213-2.758-.232-.398-.025-.614.174-.812.178-.178.398-.465.597-.697.2-.233.266-.398.398-.664.133-.265.066-.497-.033-.697-.1-.199-.896-2.162-1.228-2.958-.323-.778-.65-.672-.896-.685l-.764-.013c-.265 0-.697.1-1.063.497-.365.398-1.395 1.362-1.395 3.324s1.428 3.854 1.627 4.12c.2.265 2.81 4.29 6.808 6.018.951.41 1.693.656 2.272.839.954.303 1.823.26 2.51.158.765-.114 2.354-.962 2.686-1.892.333-.93.333-1.727.233-1.892-.099-.166-.365-.265-.763-.464Z" />
                </svg>
            </a>
        </div>
    )
}

import Link from 'next/link'
import Image from 'next/image'
import {
    CarFront,
    Laptop,
    ArrowRight,
    ShieldCheck,
    Gem,
    Clock,
    ArrowUpRight,
} from 'lucide-react'


// ── Feature item for Mission block ──────────────────────────────────────────
function MissionFeature({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#742384]">
                {icon}
            </div>
            <div>
                <p className="font-bold text-gray-900 mb-1">{title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

// ── Quality card for Block 3 ─────────────────────────────────────────────────
function QualityCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="group flex flex-col items-start gap-4 p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-[#742384] group-hover:bg-[#742384] group-hover:text-white transition-colors duration-300">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
            </div>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">

            {/* ══════════════════════════════════════
                BLOQUE 1 — HÉROE (Split Screen)
            ══════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-white">
                {/* Subtle top accent */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#742384] via-pink-400 to-purple-300" />

                <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                        {/* LEFT — Text */}
                        <div className="space-y-8">
                            {/* Eyebrow label */}
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#742384] bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#742384] animate-pulse" />
                                Quiénes somos
                            </span>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
                                Reinventamos la imprenta en el{' '}
                                <span className="text-[#742384]">corazón del Perú</span>{' '}
                                para que tu tiempo vuelva a ser tuyo.
                            </h1>

                            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                                Somos el socio estratégico de los emprendedores de Huancayo.
                                Tecnología, calidad y atención humana en un solo lugar — sin que salgas de tu oficina o casa.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <Link
                                    href="/#catalogo"
                                    className="inline-flex items-center gap-2 px-7 py-4 bg-[#742384] text-white font-bold rounded-2xl shadow-lg shadow-purple-300/40 hover:bg-[#5a1b66] hover:shadow-xl transition-all hover:scale-105 active:scale-100"
                                >
                                    Ver Productos <ArrowUpRight size={18} />
                                </Link>
                                <Link
                                    href="/contacto"
                                    className="inline-flex items-center gap-2 px-7 py-4 bg-white text-gray-800 font-bold rounded-2xl border-2 border-gray-200 hover:border-[#742384] hover:text-[#742384] transition-all"
                                >
                                    Contáctanos
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT — Hero image */}
                        <div className="relative">
                            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
                                <Image
                                    src="/images/nosotros/Quienes_somos.jpg"
                                    alt="Equipo WankaPrint — quiénes somos"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </div>
                            {/* Decorative blobs */}
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-70 -z-10" />
                            <div className="absolute -top-6 -left-6 w-24 h-24 bg-pink-100 rounded-full blur-2xl opacity-60 -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                BLOQUE 2 — MISIÓN (Split Screen invertido)
            ══════════════════════════════════════ */}
            <section className="bg-gray-50 py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                        {/* LEFT — Mission image */}
                        <div className="relative order-2 md:order-1">
                            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
                                <Image
                                    src="/images/nosotros/nuestra_mision.jpg"
                                    alt="Nuestra misión — gestión digital WankaPrint"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#742384]/10 rounded-full blur-2xl -z-10" />
                        </div>

                        {/* RIGHT — Text + features */}
                        <div className="space-y-8 order-1 md:order-2">
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#742384] bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">
                                Nuestra Misión
                            </span>

                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                                Adiós a la imprenta de antes
                            </h2>

                            <p className="text-gray-500 leading-relaxed">
                                Nacimos con una obsesión: modernizar la industria gráfica en el centro del país.
                                Entendemos que, para un emprendedor en Huancayo, el tiempo no es solo dinero —{' '}
                                <span className="font-semibold text-gray-700">es vida</span>.
                                Por eso, hemos eliminado las barreras de las imprentas tradicionales:
                            </p>

                            <div className="space-y-6">
                                <MissionFeature
                                    icon={<CarFront size={22} />}
                                    title="Sin viajes innecesarios"
                                    description="Olvídate de ir y volver de la imprenta para coordinar detalles. Tu pedido parte desde donde estás."
                                />
                                <MissionFeature
                                    icon={<Laptop size={22} />}
                                    title="Gestión 100% Online"
                                    description="Desde nuestra plataforma controlas tu pedido, envías tus archivos y coordinas todo sin moverte de tu casa u oficina."
                                />
                                <MissionFeature
                                    icon={<ArrowRight size={22} />}
                                    title="Cero complicaciones"
                                    description="Transformamos un proceso que antes era tedioso en una experiencia digital fluida y eficiente."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                BLOQUE 3 — TRANQUILIDAD (Grid 3 cols)
            ══════════════════════════════════════ */}
            <section className="bg-white py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Central header */}
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#742384] bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">
                            Nuestra Promesa
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                            Tu tranquilidad es nuestro estándar
                        </h2>
                        <p className="text-gray-500 leading-relaxed text-lg">
                            Sabemos lo que significa confiar tu marca a alguien más. En WankaPrint,{' '}
                            <span className="font-semibold text-gray-700">"digital" no significa distante</span>;
                            significa precisión.
                        </p>
                    </div>

                    {/* 3-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QualityCard
                            icon={<ShieldCheck size={26} />}
                            title="En buenas manos"
                            description="Tu proyecto es supervisado por expertos que cuidan cada detalle técnico, desde el archivo hasta el acabado final."
                        />
                        <QualityCard
                            icon={<Gem size={26} />}
                            title="Calidad sin sorpresas"
                            description="Recibes exactamente lo que esperas (o mejor), con la seguridad de que la tecnología de vanguardia respalda cada impresión."
                        />
                        <QualityCard
                            icon={<Clock size={26} />}
                            title="Más tiempo para ti"
                            description="Mientras nosotros nos encargamos de que tus trabajos queden perfectos, tú puedes enfocarte en hacer crecer tu negocio — o simplemente disfrutar tu día."
                        />
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-16 text-center">
                        <Link
                            href="/#catalogo"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gray-900 text-white font-bold text-lg rounded-2xl hover:bg-[#742384] transition-all shadow-lg hover:shadow-purple-300/40 hover:scale-105 active:scale-100"
                        >
                            Empezar mi pedido <ArrowUpRight size={20} />
                        </Link>
                        <p className="text-sm text-gray-400 mt-4">
                            Sin registros complicados · Pedido en minutos
                        </p>
                    </div>
                </div>
            </section>

        </div>
    )
}

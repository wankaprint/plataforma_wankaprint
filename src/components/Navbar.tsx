'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, ShoppingBag, Home, Users, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const navLinks = [
        { href: '/', label: 'Inicio', icon: Home },
        { href: '/catalogo', label: 'Catálogo', icon: ShoppingBag },
        { href: '/nosotros', label: 'Nosotros', icon: Users },
        { href: '/contacto', label: 'Contacto', icon: Phone },
    ]

    const isActive = (path: string) => pathname === path

    return (
        <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <img src="/images/logo.png" onError={(e) => e.currentTarget.style.display = 'none'} alt="WankaPrint Logo" className="h-16 w-auto object-contain" />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-bold transition-colors flex items-center gap-2",
                                isActive(link.href) ? "text-[#742384]" : "text-gray-500 hover:text-[#742384]"
                            )}
                        >
                            <link.icon size={16} className={cn(isActive(link.href) ? "opacity-100" : "opacity-50 group-hover:opacity-100")} />
                            {link.label}
                        </Link>
                    ))}

                    {/* Tracking Link - Ghost Button Style */}
                    <Link
                        href="/rastreo"
                        className="px-3 py-1.5 text-sm font-medium text-[#742384] border-2 border-[#742384]/30 rounded-full hover:bg-purple-50 hover:border-[#742384] transition-all flex items-center gap-1.5 shadow-sm"
                    >

                        🔍 Estado de mi Pedido
                    </Link>

                    <Link href="/contacto" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-[#742384] transition-colors shadow-lg shadow-purple-900/20">
                        Pedir Cotización
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-gray-600 hover:text-[#742384] transition-colors"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b shadow-xl px-4 py-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl transition-colors",
                                isActive(link.href) ? "bg-purple-50 text-[#742384]" : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <link.icon size={20} />
                            <span className="font-bold text-lg">{link.label}</span>
                        </Link>
                    ))}

                    {/* Mobile Tracking Link */}
                    <Link
                        href="/rastreo"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#742384]/30 text-[#742384] hover:bg-purple-50 transition-colors"
                    >
                        <Search size={20} />
                        <span className="font-bold text-lg">🔍 Estado de mi Pedido</span>
                    </Link>

                    <Link href="/contacto" onClick={() => setIsOpen(false)} className="w-full text-center p-4 bg-[#742384] text-white rounded-xl font-bold">
                        Pedir Cotización
                    </Link>
                </div>
            )}
        </header>
    )
}

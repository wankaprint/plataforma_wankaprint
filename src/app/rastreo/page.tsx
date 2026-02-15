'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Package, Clock, Palette, Printer, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface OrderStatus {
    order_code: string;
    status: 'Recibido' | 'En Diseño' | 'Esperando Confirmación' | 'En Prensa' | 'Listo para entrega';
    product_name: string;
    quantity: number;
    customer_name: string;
    created_at: string;
    final_art_url: string | null;
}

const STEPS = [
    { status: 'Recibido', icon: Package, label: 'Pedido Recibido', desc: 'Tu pedido ha ingresado al sistema.' },
    { status: 'En Diseño', icon: Palette, label: 'En Diseño', desc: 'Nuestro equipo está trabajando en tu arte.' },
    { status: 'Esperando Confirmación', icon: Clock, label: 'Revisión', desc: 'Esperando tu visto bueno del diseño.' },
    { status: 'En Prensa', icon: Printer, label: 'En Producción', desc: 'Tu pedido está siendo impreso.' },
    { status: 'Listo para entrega', icon: CheckCircle, label: 'Listo', desc: 'Puedes recoger tu pedido o esperar el envío.' }
];

export default function RastreoPage() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<OrderStatus | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);

        console.log('Searching for code:', code);

        // Normalize code: add WK- if missing and uppercase
        let searchCode = code.toUpperCase().trim();
        if (!searchCode.startsWith('WK-')) {
            // If user enters just numbers (e.g. 1234), add WK-
            searchCode = `WK-${searchCode}`;
        }

        console.log('Normalized search code:', searchCode);

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select('order_code, status, product_name, quantity, customer_name, created_at, final_art_url')
                .eq('order_code', searchCode)
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            if (!data) {
                throw new Error('Pedido no encontrado');
            }

            console.log('Order found:', data);
            setOrder(data as OrderStatus);
        } catch (err: any) {
            console.error('Search error:', err);
            setError('No encontramos un pedido con ese código. Verifica que esté bien escrito (ej. WK-xxxx).');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStepIndex = (status: string) => {
        return STEPS.findIndex(s => s.status === status);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-[#742384] mb-2">
                        Rastrea tu <span className="text-pink-500">Pedido</span>
                    </h1>
                    <p className="text-gray-600">Ingresa tu código de seguimiento para ver el estado de tu compra</p>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-purple-100 relative z-10">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Ej: 1234"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#742384] focus:outline-none transition-all text-lg font-bold uppercase tracking-wider text-gray-800 placeholder:text-gray-400"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#742384] hover:bg-[#5a1b66] text-white font-bold px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Buscar'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2 border border-red-100">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                </div>

                {/* Order Status Result */}
                {order && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Order Header */}
                        <div className="bg-[#742384] p-5 text-white flex justify-between items-start">
                            <div>
                                <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-1">Código de Pedido</p>
                                <h2 className="text-2xl font-black tracking-widest">{order.order_code}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-1">Fecha</p>
                                <p className="font-bold text-sm">
                                    {new Date(order.created_at).toLocaleDateString('es-PE', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-900">{order.product_name}</h3>
                                <p className="text-xs text-gray-500 mt-1">Cliente: {order.customer_name.split(' ')[0]} ***</p>
                            </div>
                            <span className="bg-purple-100 text-[#742384] px-3 py-1 rounded-full text-xs font-bold">
                                {order.quantity.toLocaleString()} unids.
                            </span>
                        </div>

                        {/* Timeline */}
                        <div className="p-6 relative">
                            {/* Vertical line connecting steps */}
                            <div className="absolute left-[43px] top-10 bottom-10 w-0.5 bg-gray-200 z-0"></div>

                            <div className="space-y-8 relative z-10">
                                {STEPS.map((step, idx) => {
                                    const currentIdx = getCurrentStepIndex(order.status);
                                    const isCompleted = idx <= currentIdx;
                                    const isCurrent = idx === currentIdx;
                                    const isPast = idx < currentIdx;

                                    return (
                                        <div key={step.status} className={`flex gap-4 relative transition-all duration-500 ${isCompleted ? 'opacity-100' : 'opacity-40 grayscale'}`}>

                                            {/* Step Circle */}
                                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 border-2 ${isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 scale-110'
                                                    : 'bg-white border-gray-200 text-gray-300'
                                                }`}>
                                                {isPast ? <CheckCircle size={18} /> : <step.icon size={18} />}

                                                {/* Ping animation for current step */}
                                                {isCurrent && (
                                                    <span className="absolute flex h-full w-full">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-30"></span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Text Content */}
                                            <div className="pt-1 flex-1">
                                                <h4 className={`font-bold text-base leading-none mb-1 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </h4>
                                                <p className="text-xs text-gray-500">{step.desc}</p>

                                                {/* Final Art Button */}
                                                {(step.status === 'Esperando Confirmación' || step.status === 'Listo para entrega') &&
                                                    isCurrent && order.final_art_url && (
                                                        <a
                                                            href={order.final_art_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#742384] text-white rounded-lg text-xs font-bold hover:bg-[#5a1b66] transition-colors shadow-md hover:shadow-lg animate-pulse"
                                                        >
                                                            <Palette size={14} />
                                                            Ver Arte Final
                                                        </a>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 p-4 text-center border-t text-xs text-gray-500">
                            ¿Necesitas ayuda? <a href="/#contacto" className="text-[#742384] font-bold hover:underline">Contáctanos</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

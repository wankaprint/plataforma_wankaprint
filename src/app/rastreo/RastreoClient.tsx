'use client';

import { useState } from 'react';
import { Search, Package, Clock, Palette, Printer, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { trackOrder } from '@/app/actions/trackOrder';

interface OrderStatus {
    order_code: string;
    status: 'Pedido Recibido' | 'En Diseño' | 'Revisión' | 'En Producción' | 'Listo';
    product_name: string;
    quantity: number;
    customer_name: string;
    created_at: string;
    final_art_url: string | null;
}

const STEPS = [
    { status: 'Pedido Recibido', icon: Package, label: 'Pedido Recibido', desc: 'Tu pedido ha ingresado al sistema.' },
    { status: 'En Diseño', icon: Palette, label: 'En Diseño', desc: 'Nuestro equipo está trabajando en tu arte.' },
    { status: 'Revisión', icon: Clock, label: 'Revisión', desc: 'Esperando tu visto bueno del diseño.' },
    { status: 'En Producción', icon: Printer, label: 'En Producción', desc: 'Tu pedido está siendo impreso.' },
    { status: 'Listo', icon: CheckCircle, label: 'Listo', desc: 'Puedes recoger tu pedido o esperar el envío.' }
];

export default function RastreoClient() {
    const [inputNumber, setInputNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<OrderStatus | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [validationError, setValidationError] = useState('');

    // TAREA 2 - Capa 1: Prevención (Limpieza en tiempo real)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Solo permitir números, eliminar todo lo demás
        const cleaned = e.target.value.replace(/\D/g, '');
        // Limitar a 4 dígitos
        const limited = cleaned.slice(0, 4);
        setInputNumber(limited);

        // Limpiar errores cuando el usuario empieza a escribir
        if (validationError) setValidationError('');
        if (notFound) setNotFound(false);
    };

    // Interceptar pegado para limpiar "WK-1234" → "1234"
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        // Extraer solo números del texto pegado
        const numbersOnly = pastedText.replace(/\D/g, '').slice(0, 4);
        setInputNumber(numbersOnly);
    };

    // TAREA 3 - Capa 2: Validación del Botón
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputNumber) return;

        setLoading(true);
        setNotFound(false);
        setOrder(null);
        setValidationError('');

        try {
            // Llamamos a la Server Action en lugar de Supabase directo
            const data = await trackOrder(inputNumber);

            if (!data) {
                setNotFound(true);
                setOrder(null);
            } else {
                setOrder(data as OrderStatus);
                setNotFound(false);
            }
        } catch (err: any) {
            console.error('Error en búsqueda:', err);
            setNotFound(true);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStepIndex = (status: string) => {
        return STEPS.findIndex(s => s.status === status);
    };

    // TAREA 3 - Capa 2: Deshabilitar botón si no hay 4 números
    const isButtonDisabled = inputNumber.trim().length < 4 || loading;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-[#742384] mb-2">
                        Verifica el estado de tu <span className="text-pink-500">Pedido</span>
                    </h1>
                    <p className="text-gray-600">Ingresa los 4 números de tu comprobante de pago</p>
                </div>

                {/* TAREA 1: Search Box con Prefijo Fijo */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-purple-100 relative z-10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-2">
                            {/* Input con Prefijo Fijo */}
                            <div className="flex-1 flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#742384] transition-all">
                                {/* Prefijo Fijo (No editable) */}
                                <div className="bg-gray-50 px-4 py-3 border-r border-gray-200">
                                    <span className="text-lg font-black text-gray-700 tracking-wider">WK-</span>
                                </div>

                                {/* Input Editable (Solo números) */}
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    value={inputNumber}
                                    onChange={handleInputChange}
                                    onPaste={handlePaste}
                                    placeholder="Ej: 1234"
                                    maxLength={4}
                                    className="flex-1 px-4 py-3 bg-transparent text-lg font-bold uppercase tracking-widest text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                                />

                                {/* Indicador visual de caracteres */}
                                <div className="mr-4 text-xs text-gray-400 font-medium">
                                    {inputNumber.length}/4
                                </div>
                            </div>

                            {/* Botón de Búsqueda */}
                            <button
                                type="submit"
                                disabled={isButtonDisabled}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-lg ${isButtonDisabled
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                                    : 'bg-[#742384] hover:bg-[#5a1b66] text-white shadow-purple-300'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <Search size={20} />
                                        Buscar
                                    </>
                                )}
                            </button>
                        </div>

                        {/* TAREA 3 - Capa 2: Mensaje de validación */}
                        {validationError && (
                            <div className="flex items-center gap-2 text-sm text-red-600 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                                <AlertCircle size={16} />
                                {validationError}
                            </div>
                        )}

                        {/* Ayuda visual + Debug Visual Temporal */}
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500 text-center">
                                💡 Encuentra el código en tu comprobante de pago Yape/Plin
                            </p>
                            {inputNumber && (
                                <p className="text-[10px] text-purple-400 text-center font-mono opacity-50">
                                    Buscando: WK-{inputNumber.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                {/* TAREA 4 - Capa 3: Empty State (Pedido no encontrado) */}
                {notFound && (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-orange-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="text-orange-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">
                            Pedido no encontrado
                        </h3>
                        <p className="text-gray-600 mb-2">
                            No encontramos ningún pedido con el número <span className="font-mono font-bold text-[#742384]">WK-{inputNumber}</span>
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Por favor, verifica tu comprobante de pago o contáctanos para ayudarte.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setInputNumber('');
                                    setNotFound(false);
                                }}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                            >
                                Intentar de nuevo
                            </button>
                            <a
                                href="https://wa.me/51983555435"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                Contactar por WhatsApp
                            </a>
                        </div>
                    </div>
                )}

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
                                                {(step.status === 'Revisión' || step.status === 'Listo') &&
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

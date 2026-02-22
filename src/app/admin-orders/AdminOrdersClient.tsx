'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LogOut, Package, User, Calendar, CreditCard, Loader2,
    FileText, X, Download, Image as ImageIcon, Eye,
    MessageCircle, ClipboardList,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/* ─────────────────── Interfaces ─────────────────── */
interface Order {
    id: string;
    order_code: string;
    customer_name: string;
    customer_lastname: string;
    customer_phone: string;
    product_name: string;
    quantity: number;
    total_amount: number;
    amount_paid: number;
    payment_method_type: string;
    status: 'Pedido Recibido' | 'En Diseño' | 'Revisión' | 'En Producción' | 'Listo';
    created_at: string;
    design_files: string[];
    payment_proof_files: string[];
}

interface Quote {
    id: string;
    created_at: string;
    customer_name: string;
    whatsapp: string;
    product_type: string;
    quantity: number | null;
    description: string | null;
    status: string;
}

type QuoteStatus = 'Pendiente' | 'Contactado' | 'Cotizado' | 'Cerrado';

const QUOTE_STATUSES: QuoteStatus[] = ['Pendiente', 'Contactado', 'Cotizado', 'Cerrado'];

const QUOTE_STATUS_STYLES: Record<QuoteStatus, string> = {
    'Pendiente': 'bg-yellow-50 border-yellow-300 text-yellow-700',
    'Contactado': 'bg-blue-50 border-blue-300 text-blue-700',
    'Cotizado': 'bg-purple-50 border-purple-300 text-purple-700',
    'Cerrado': 'bg-green-50 border-green-300 text-green-700',
};

const WA_NUMBER = '51983555435';

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function AdminOrdersClient() {
    const router = useRouter();

    // Tab state
    const [activeTab, setActiveTab] = useState<'orders' | 'quotes'>('orders');

    // Orders
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [selectedOrderForFiles, setSelectedOrderForFiles] = useState<Order | null>(null);
    const [downloadingZip, setDownloadingZip] = useState(false);

    // Quotes
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loadingQuotes, setLoadingQuotes] = useState(true);
    const [updatingQuoteStatus, setUpdatingQuoteStatus] = useState<string | null>(null);

    // Shared
    const [userEmail, setUserEmail] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        checkAuth();
        fetchOrders();
        fetchQuotes();
    }, []);

    /* ── Auth ── */
    const checkAuth = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        setUserEmail(user.email || '');
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    /* ── Toast helper ── */
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* ─────────────────── ORDERS ─────────────────── */
    const fetchOrders = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await (supabase as any)
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setOrders(data || []);
        } catch (e) {
            console.error('Error fetching orders:', e);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleStatusChange = async (
        orderId: string,
        newStatus: 'Pedido Recibido' | 'En Diseño' | 'Revisión' | 'En Producción' | 'Listo',
    ) => {
        setUpdatingStatus(orderId);
        try {
            const supabase = createClient();
            const { error } = await (supabase as any).from('orders').update({ status: newStatus }).eq('id', orderId);
            if (error) throw error;
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            showToast('✅ Estado actualizado correctamente', 'success');
        } catch {
            showToast('❌ Error al actualizar el estado', 'error');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleForceDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            showToast('❌ Error al descargar el archivo', 'error');
        }
    };

    const handleDownloadZip = async (orderCode: string, fileUrls: string[]) => {
        setDownloadingZip(true);
        try {
            const zip = new JSZip();
            await Promise.all(fileUrls.map(async (url, index) => {
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const urlParts = url.split('/');
                    const filename = urlParts[urlParts.length - 1] || `archivo_${index + 1}.jpg`;
                    zip.file(filename, blob);
                } catch { /* skip failed file */ }
            }));
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Pedido_${orderCode}.zip`);
            showToast('✅ ZIP descargado exitosamente', 'success');
        } catch {
            showToast('❌ Error al crear el ZIP', 'error');
        } finally {
            setDownloadingZip(false);
        }
    };

    /* ─────────────────── QUOTES ─────────────────── */
    const fetchQuotes = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await (supabase as any)
                .from('quotes')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setQuotes(data || []);
        } catch (e) {
            console.error('Error fetching quotes:', e);
        } finally {
            setLoadingQuotes(false);
        }
    };

    const handleQuoteStatusChange = async (quoteId: string, newStatus: QuoteStatus) => {
        setUpdatingQuoteStatus(quoteId);
        try {
            const supabase = createClient();
            const { error } = await (supabase as any).from('quotes').update({ status: newStatus }).eq('id', quoteId);
            if (error) throw error;
            setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
            showToast('✅ Estado de cotización actualizado', 'success');
        } catch {
            showToast('❌ Error al actualizar la cotización', 'error');
        } finally {
            setUpdatingQuoteStatus(null);
        }
    };

    /* ── Loading state ── */
    if (loadingOrders && loadingQuotes) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#742384]" size={48} />
            </div>
        );
    }

    /* ══════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">
                            Wanka<span className="text-[#E91E63]">Print</span>
                        </h1>
                        <p className="text-xs text-gray-500">Panel de Administración</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{userEmail}</p>
                            <p className="text-xs text-gray-500">Administrador</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                            <LogOut size={16} /> Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-gray-100 pt-0">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'orders'
                            ? 'border-[#742384] text-[#742384]'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        <Package size={16} />
                        Pedidos
                        <span className="bg-gray-100 text-gray-600 text-xs font-black px-2 py-0.5 rounded-full">
                            {orders.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('quotes')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'quotes'
                            ? 'border-[#742384] text-[#742384]'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        <ClipboardList size={16} />
                        Cotizaciones
                        {quotes.filter(q => q.status === 'Pendiente').length > 0 && (
                            <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">
                                {quotes.filter(q => q.status === 'Pendiente').length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ═══ Main Content ═══ */}
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* ── ORDERS TAB ── */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Package className="text-[#742384]" size={20} />
                                <h2 className="text-lg font-black text-gray-900">Pedidos ({orders.length})</h2>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white border-b border-gray-200">
                                        {['Código', 'Cliente', 'Producto', 'Cantidad', 'Total', 'Pagado', 'Método', 'Estado', 'Fecha', 'Archivos'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-bold text-[#742384]">{order.order_code}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-bold text-gray-900">{order.customer_name} {order.customer_lastname}</p>
                                                <p className="text-xs text-gray-500">{order.customer_phone}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-700">{order.product_name}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-sm font-bold text-gray-900">{order.quantity.toLocaleString()}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-sm font-bold text-gray-900">S/ {order.total_amount.toFixed(2)}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-sm font-bold text-green-600">S/ {order.amount_paid.toFixed(2)}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${order.payment_method_type === 'Pago Total'
                                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                                    }`}>
                                                    {order.payment_method_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                                        disabled={updatingStatus === order.id}
                                                        className={`w-full px-3 py-2 text-xs font-bold border-2 rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#742384] ${order.status === 'Listo' ? 'bg-green-50 border-green-300 text-green-700'
                                                            : order.status === 'En Producción' ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                                : order.status === 'Revisión' ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                                                                    : order.status === 'En Diseño' ? 'bg-purple-50 border-purple-300 text-purple-700'
                                                                        : 'bg-gray-50 border-gray-300 text-gray-700'
                                                            } ${updatingStatus === order.id ? 'opacity-50 cursor-wait' : ''}`}
                                                    >
                                                        <option value="Pedido Recibido">📦 Pedido Recibido</option>
                                                        <option value="En Diseño">🎨 En Diseño</option>
                                                        <option value="Revisión">⏳ Revisión</option>
                                                        <option value="En Producción">🖨️ En Producción</option>
                                                        <option value="Listo">✅ Listo</option>
                                                    </select>
                                                    {updatingStatus === order.id && (
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                            <Loader2 className="animate-spin text-[#742384]" size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                                    {new Date(order.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2 justify-center">
                                                    {order.design_files?.length > 0 && (
                                                        <button onClick={() => setSelectedOrderForFiles(order)} className="text-blue-600 hover:text-blue-700 transition-colors" title="Ver archivos de diseño">
                                                            <FileText size={18} />
                                                        </button>
                                                    )}
                                                    {order.payment_proof_files?.length > 0 && (
                                                        <a href={order.payment_proof_files[0]} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 transition-colors" title="Ver comprobante">
                                                            <CreditCard size={18} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── QUOTES TAB ── */}
                {activeTab === 'quotes' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="text-[#742384]" size={20} />
                                <h2 className="text-lg font-black text-gray-900">Cotizaciones ({quotes.length})</h2>
                            </div>
                            <button
                                onClick={fetchQuotes}
                                className="text-xs text-gray-500 hover:text-[#742384] font-bold transition-colors"
                            >
                                ↻ Actualizar
                            </button>
                        </div>

                        {loadingQuotes ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="animate-spin text-[#742384]" size={32} />
                            </div>
                        ) : quotes.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No hay cotizaciones aún.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-200">
                                            {['Fecha', 'Cliente', 'WhatsApp', 'Producto', 'Cantidad', 'Descripción', 'Estado', 'Acción'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {quotes.map((quote) => {
                                            const waMsg = encodeURIComponent(
                                                `Hola ${quote.customer_name} 👋, soy del equipo de WankaPrint. Recibimos tu cotización para ${quote.product_type}${quote.quantity ? ` (${quote.quantity} unidades)` : ''}. ¿Cuándo podemos coordinarlo?`
                                            );
                                            const currentStatus = (QUOTE_STATUSES.includes(quote.status as QuoteStatus) ? quote.status : 'Pendiente') as QuoteStatus;

                                            return (
                                                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(quote.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(quote.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm font-bold text-gray-900">{quote.customer_name}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-gray-700 font-mono">{quote.whatsapp}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#742384] border border-purple-100">
                                                            {quote.product_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="text-sm text-gray-700">
                                                            {quote.quantity ? quote.quantity.toLocaleString() : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 max-w-[250px]">
                                                        {quote.description ? (
                                                            <div className="group relative">
                                                                <p className="text-sm text-gray-600 line-clamp-2 italic leading-snug">
                                                                    "{quote.description}"
                                                                </p>
                                                                {/* Hover magic for long comments */}
                                                                <div className="absolute z-20 hidden group-hover:block bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl -left-2 top-0 w-64 border border-gray-700">
                                                                    <p className="font-bold mb-1 flex items-center gap-1">
                                                                        <MessageCircle size={10} /> Comentario Completo:
                                                                    </p>
                                                                    <p className="leading-relaxed">{quote.description}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-300 italic text-xs">Sin comentarios</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="relative">
                                                            <select
                                                                value={currentStatus}
                                                                onChange={(e) => handleQuoteStatusChange(quote.id, e.target.value as QuoteStatus)}
                                                                disabled={updatingQuoteStatus === quote.id}
                                                                className={`w-full px-3 py-2 text-xs font-bold border-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#742384] transition-all ${QUOTE_STATUS_STYLES[currentStatus]} ${updatingQuoteStatus === quote.id ? 'opacity-50 cursor-wait' : ''}`}
                                                            >
                                                                {QUOTE_STATUSES.map(s => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                            {updatingQuoteStatus === quote.id && (
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                                    <Loader2 className="animate-spin text-[#742384]" size={14} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <a
                                                            href={`https://wa.me/${quote.whatsapp.replace(/\D/g, '')}?text=${waMsg}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                                                        >
                                                            <MessageCircle size={14} />
                                                            WhatsApp
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-2xl border-2 z-50 ${toast.type === 'success'
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                    }`}>
                    <p className="font-bold text-sm">{toast.message}</p>
                </div>
            )}

            {/* File Gallery Modal */}
            {selectedOrderForFiles && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedOrderForFiles(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Archivos del Pedido</h2>
                                <p className="text-sm text-gray-500 font-mono font-bold mt-1">{selectedOrderForFiles.order_code}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedOrderForFiles.design_files?.length > 0 && (
                                    <button
                                        onClick={() => handleDownloadZip(selectedOrderForFiles.order_code, selectedOrderForFiles.design_files)}
                                        disabled={downloadingZip}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-bold transition-colors"
                                    >
                                        {downloadingZip ? <><Loader2 className="animate-spin" size={16} /> Generando ZIP...</> : '📦 Descargar Todo (.zip)'}
                                    </button>
                                )}
                                <button onClick={() => setSelectedOrderForFiles(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {selectedOrderForFiles.design_files?.length > 0 ? (
                                <>
                                    <p className="text-sm text-gray-600 mb-4">📁 {selectedOrderForFiles.design_files.length} archivo(s) de diseño</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedOrderForFiles.design_files.map((fileUrl, index) => (
                                            <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#742384] transition-all group">
                                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                                    <img
                                                        src={fileUrl}
                                                        alt={`Diseño ${index + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                    <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-50">
                                                        <ImageIcon size={48} className="text-gray-300" />
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-white border-t border-gray-200">
                                                    <div className="flex gap-2">
                                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-bold transition-colors">
                                                            <Eye size={14} /> Abrir
                                                        </a>
                                                        <button
                                                            onClick={() => {
                                                                const urlParts = fileUrl.split('/');
                                                                const filename = urlParts[urlParts.length - 1] || `archivo_${index + 1}.jpg`;
                                                                handleForceDownload(fileUrl, filename);
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-xs font-bold transition-colors"
                                                        >
                                                            <Download size={14} /> Guardar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText size={32} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">Este pedido no tiene archivos de diseño adjuntos.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

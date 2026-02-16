'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Package, User, Calendar, CreditCard, Loader2, FileText, X, Download, Image as ImageIcon } from 'lucide-react';

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

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [selectedOrderForFiles, setSelectedOrderForFiles] = useState<Order | null>(null);

    useEffect(() => {
        checkAuth();
        fetchOrders();
    }, []);

    const checkAuth = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            return;
        }

        setUserEmail(user.email || '');
    };

    const fetchOrders = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: 'Pedido Recibido' | 'En Diseño' | 'Revisión' | 'En Producción' | 'Listo') => {
        setUpdatingStatus(orderId);
        try {
            const supabase = createClient();
            const { error } = await (supabase
                .from('orders')
                .update({ status: newStatus }) as any)
                .eq('id', orderId);

            if (error) throw error;

            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            // Show success toast
            setToast({ message: '✅ Estado actualizado correctamente', type: 'success' });
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            console.error('Error updating status:', error);
            setToast({ message: '❌ Error al actualizar el estado', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#742384]" size={48} />
            </div>
        );
    }

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
                            <LogOut size={16} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Orders Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Package className="text-[#742384]" size={20} />
                            <h2 className="text-lg font-black text-gray-900">
                                Pedidos ({orders.length})
                            </h2>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Código</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Producto</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Cantidad</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Pagado</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Método</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Archivos</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-bold text-[#742384]">
                                                {order.order_code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {order.customer_name} {order.customer_lastname}
                                                </p>
                                                <p className="text-xs text-gray-500">{order.customer_phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-700">{order.product_name}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm font-bold text-gray-900">
                                                {order.quantity.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm font-bold text-gray-900">
                                                S/ {order.total_amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm font-bold text-green-600">
                                                S/ {order.amount_paid.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${order.payment_method_type === 'Pago Total'
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
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                                                    disabled={updatingStatus === order.id}
                                                    className={`w-full px-3 py-2 text-xs font-bold border-2 rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#742384] ${order.status === 'Listo'
                                                        ? 'bg-green-50 border-green-300 text-green-700'
                                                        : order.status === 'En Producción'
                                                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                            : order.status === 'Revisión'
                                                                ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                                                                : order.status === 'En Diseño'
                                                                    ? 'bg-purple-50 border-purple-300 text-purple-700'
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
                                            <span className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('es-PE', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-2 justify-center">
                                                {order.design_files && order.design_files.length > 0 && (
                                                    <button
                                                        onClick={() => setSelectedOrderForFiles(order)}
                                                        className="text-blue-600 hover:text-blue-700 transition-colors"
                                                        title="Ver archivos de diseño"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                )}
                                                {order.payment_proof_files && order.payment_proof_files.length > 0 && (
                                                    <a
                                                        href={order.payment_proof_files[0]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-700 transition-colors"
                                                        title="Ver comprobante"
                                                    >
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
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-2xl border-2 animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success'
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
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">
                                    Archivos del Pedido
                                </h2>
                                <p className="text-sm text-gray-500 font-mono font-bold mt-1">
                                    {selectedOrderForFiles.order_code}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrderForFiles(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {selectedOrderForFiles.design_files && selectedOrderForFiles.design_files.length > 0 ? (
                                <>
                                    <p className="text-sm text-gray-600 mb-4">
                                        📁 {selectedOrderForFiles.design_files.length} archivo(s) de diseño
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedOrderForFiles.design_files.map((fileUrl, index) => (
                                            <div
                                                key={index}
                                                className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#742384] transition-all group"
                                            >
                                                {/* Thumbnail */}
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
                                                    {/* Fallback icon */}
                                                    <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-50">
                                                        <ImageIcon size={48} className="text-gray-300" />
                                                    </div>
                                                </div>

                                                {/* Download Link */}
                                                <div className="p-3 bg-white">
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                                    >
                                                        <Download size={14} />
                                                        Abrir/Descargar
                                                    </a>
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
                                    <p className="text-gray-500 font-medium">
                                        Este pedido no tiene archivos de diseño adjuntos.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

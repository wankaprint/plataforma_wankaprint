'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Package, User, Calendar, CreditCard, Loader2, FileText } from 'lucide-react';

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
    status: string;
    created_at: string;
    design_files: string[];
    payment_proof_files: string[];
}

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        checkAuth();
        fetchOrders();
    }, []);

    const checkAuth = async () => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push('/login');
        } else {
            setUserEmail(session.user.email || '');
        }
    };

    const fetchOrders = async () => {
        try {
            console.log('🔍 Fetching orders from Supabase...');
            const supabase = createClient();

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            console.log('📊 Supabase Response:', { data, error });

            if (error) {
                console.error('❌ Supabase Error:', error);
                console.error('Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            console.log(`✅ Successfully fetched ${data?.length || 0} orders`);
            setOrders(data || []);
        } catch (error) {
            console.error('💥 Error in fetchOrders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-[#742384]">
                                Wanka<span className="text-pink-500">Print</span>
                            </h1>
                            <p className="text-sm text-gray-500">Panel de Administración</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                                <p className="text-xs text-gray-500">Administrador</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
                            >
                                <LogOut size={18} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border">
                    {/* Table Header */}
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Package size={24} className="text-[#742384]" />
                            Pedidos ({orders.length})
                        </h2>
                    </div>

                    {/* Orders Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#742384]" size={40} />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <Package size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-medium">No hay pedidos aún</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Código</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Producto</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Cantidad</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Pagado</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Método</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Archivos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <span className="font-mono text-sm font-bold text-[#742384]">
                                                    {order.order_code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {order.customer_name} {order.customer_lastname}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{order.customer_phone}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{order.product_name}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-medium">{order.quantity.toLocaleString()}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-bold text-gray-900">
                                                    S/ {order.total_amount.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-bold text-green-600">
                                                    S/ {order.amount_paid.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${order.payment_method_type === 'Pago Total'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    <CreditCard size={12} />
                                                    {order.payment_method_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${order.status === 'Pagado'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('es-PE', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    {order.design_files && order.design_files.length > 0 && (
                                                        <a
                                                            href={order.design_files[0]}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-700"
                                                            title="Ver diseño"
                                                        >
                                                            <FileText size={18} />
                                                        </a>
                                                    )}
                                                    {order.payment_proof_files && order.payment_proof_files.length > 0 && (
                                                        <a
                                                            href={order.payment_proof_files[0]}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-600 hover:text-green-700"
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
                    )}
                </div>
            </div>
        </div>
    );
}

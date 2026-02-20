'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, Download, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminClient() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Basic Auth or Protection should happen here. 
    // For MVP, simplistic check or assume internal use.

    const fetchOrders = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error) {
            setOrders(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const updateStatus = async (id: string, newStatus: string) => {
        const supabase = createClient()
        await (supabase as any).from('orders').update({ status: newStatus }).eq('id', id)
        fetchOrders()
    }

    if (loading) return <div className="p-8">Cargando pedidos...</div>

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <h1 className="text-2xl font-bold">Panel de Administración</h1>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4">Fecha / Código</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Pago</th>
                                <th className="px-6 py-4">Archivos</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-[#742384]">{order.order_code}</p>
                                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{order.customer_name} {order.customer_lastname}</p>
                                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{order.product_name}</p>
                                        <p className="text-xs text-gray-500">{order.quantity} un.</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold">S/ {order.amount_paid}</p>
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border">
                                            {order.payment_method_type === 'ADELANTO_60_RECOJO' ? '60% Adelanto' : 'Total'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-y-2">
                                        <a href={`https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/payments/${order.payment_proof_url}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                                            <Eye size={12} /> Voucher
                                        </a>
                                        <a href={`https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/client_files/${order.user_file_url}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                                            <Download size={12} /> Diseño
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold",
                                            order.status === 'pendiente_confirmacion' && "bg-yellow-100 text-yellow-700",
                                            order.status === 'confirmado' && "bg-green-100 text-green-700",
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.status === 'pendiente_confirmacion' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'confirmado')}
                                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg" title="Confirmar Pago">
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

'use server'

import { createServiceClient } from '@/lib/supabase/service'

export async function trackOrder(input: string) {
    if (!input) return null

    // 1. Limpieza de "Fuerza Bruta" (Igual que en el cliente para total consistencia)
    const cleanId = input.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (cleanId.length < 4) return null

    const fullOrderCode = cleanId.startsWith('WK-') ? cleanId : `WK-${cleanId}`

    try {
        const supabase = createServiceClient()

        // 2. Búsqueda Multi-columna (ID o Order_Code) con bypass de RLS via Service Role
        const { data, error } = await (supabase as any)
            .from('orders')
            .select(`
                order_code,
                status,
                product_name,
                quantity,
                customer_name,
                customer_lastname,
                created_at,
                final_art_url
            `)
            .or(`order_code.ilike.${fullOrderCode},id.eq.${cleanId}`)
            .single()

        if (error || !data) {
            console.log('Server Action: Pedido no encontrado:', { fullOrderCode, cleanId })
            return null
        }

        const orderData = data as any

        // 3. Filtrado de Privacidad: Solo devolvemos lo que el cliente DEBE ver
        return {
            order_code: orderData.order_code,
            status: orderData.status,
            product_name: orderData.product_name,
            quantity: orderData.quantity,
            customer_name: `${orderData.customer_name} ${orderData.customer_lastname?.charAt(0) || ''}***`,
            created_at: orderData.created_at,
            final_art_url: orderData.final_art_url
        }

    } catch (err) {
        console.error('Server Action Error:', err)
        return null
    }
}

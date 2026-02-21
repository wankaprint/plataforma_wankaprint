'use server'

import { createServiceClient } from '@/lib/supabase/service'

export async function trackOrder(input: string) {
    if (!input) return null

    // 1. Limpieza de "Fuerza Bruta"
    const cleanId = input.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (cleanId.length < 4) return null

    // Generamos variaciones para ser ultra-flexibles
    const wkCode = cleanId.startsWith('WK') ? cleanId : `WK-${cleanId}`
    const wnkCode = cleanId.startsWith('WNK') ? cleanId : `WNK-${cleanId}`

    // Detectamos si lo que enviaron parece un UUID para evitar crash de tipos en la DB
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)

    try {
        const supabase = createServiceClient()

        // 2. Búsqueda ultra-flexible
        // Buscamos por: WK-XXXX, WNK-XXXX, XXXX (parcial) y UUID (si aplica)
        let orQuery = `order_code.ilike.*${cleanId}*,order_code.ilike.${wkCode},order_code.ilike.${wnkCode}`
        if (isUUID) {
            orQuery += `,id.eq.${cleanId}`
        }

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
            .or(orQuery)
            .maybeSingle() // Usamos maybeSingle para evitar error si no hay nada

        if (error) {
            console.error('Supabase Query Error:', error)
            return null
        }

        if (!data) {
            console.log('No se encontró pedido con:', { cleanId, wkCode, wnkCode })
            return null
        }

        const orderData = data as any

        // 3. Filtrado de Privacidad
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
        console.error('Server Action Crash:', err)
        return null
    }
}

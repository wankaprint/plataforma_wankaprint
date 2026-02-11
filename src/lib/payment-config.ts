/**
 * Configuración centralizada de pagos para WankaPrint
 * Todos los productos usan automáticamente esta información
 */

export const PAYMENT_CONFIG = {
    // Información del destinatario de Yape
    recipient: {
        name: 'Omar Mayta',
        phone: '983 555 435',
        businessName: 'WankaPrint'
    },

    // Ruta del QR de Yape
    qrImage: '/images/qr-pago.png',

    // Tarifas
    deliveryFee: 15.00, // S/ 15.00 para envíos

    // Métodos de pago disponibles
    paymentMethods: {
        ADELANTO_60_RECOJO: {
            label: 'Adelanto 60% (Recojo en Tienda)',
            description: 'Paga el 60% ahora y el resto al recoger.',
            percentage: 0.60
        },
        TOTAL_RECOJO: {
            label: 'Pago Completo (Recojo en Tienda)',
            description: 'Sin costo de envío.',
            percentage: 1.00
        },
        TOTAL_ENVIO: {
            label: 'Pago Completo + Envío',
            description: 'Recibe en tu domicilio',
            percentage: 1.00,
            includesDelivery: true
        }
    }
} as const

export type PaymentMethod = keyof typeof PAYMENT_CONFIG.paymentMethods

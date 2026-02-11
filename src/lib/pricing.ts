
import { PAYMENT_CONFIG } from './payment-config'

export const DELIVERY_FEE = PAYMENT_CONFIG.deliveryFee

export type PaymentMethod = 'ADELANTO_60_RECOJO' | 'TOTAL_RECOJO' | 'TOTAL_ENVIO';

export interface PricingResult {
    productPrice: number;
    deliveryFee: number;
    totalAmount: number;
    amountToPayNow: number;
    amountPending: number;
}

/**
 * Calcula los montos a pagar según el precio base del producto y el método de pago elegido.
 * 
 * @param productPrice Precio unitario o total del producto (sacado de la BD public_prices)
 * @param paymentMethod Método de pago seleccionado
 */
export function calculatePricing(productPrice: number, paymentMethod: PaymentMethod): PricingResult {
    let deliveryFee = 0;
    let totalAmount = productPrice;
    let amountToPayNow = 0;
    let amountPending = 0;

    switch (paymentMethod) {
        case 'ADELANTO_60_RECOJO':
            // El precio es el normal (o de lista/oferta según venga en productPrice)
            // Se paga el 60% ahora
            deliveryFee = 0;
            totalAmount = productPrice;
            amountToPayNow = Number((productPrice * 0.60).toFixed(2));
            amountPending = Number((productPrice - amountToPayNow).toFixed(2));
            break;

        case 'TOTAL_RECOJO':
            // Se paga el 100% ahora
            deliveryFee = 0;
            totalAmount = productPrice;
            amountToPayNow = productPrice;
            amountPending = 0;
            break;

        case 'TOTAL_ENVIO':
            // Se paga 100% + Delivery
            deliveryFee = PAYMENT_CONFIG.deliveryFee;
            totalAmount = Number((productPrice + deliveryFee).toFixed(2));
            amountToPayNow = totalAmount;
            amountPending = 0;
            break;
    }

    return {
        productPrice,
        deliveryFee,
        totalAmount,
        amountToPayNow,
        amountPending,
    };
}

'use client';

import { useState, useRef } from 'react';
import { usePurchaseStepper } from '@/contexts/PurchaseStepperContext';
import { createClient } from '@/lib/supabase/client';
import { Wallet, Upload, CheckCircle } from 'lucide-react';

export default function Step4_PaymentSummary() {
    const {
        selectedQuantity,
        selectedTier,
        customerData,
        designFileUrls,
        paymentMethod,
        setPaymentMethod,
        paymentProofFile,
        setPaymentProofFile,
        product,
        previousStep
    } = usePurchaseStepper();

    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // DEFENSIVE CHECKS
    if (!product || !product.price_config) {
        return <div className="text-center py-8 text-red-500">Error: No se encontró configuración del producto</div>;
    }

    if (!selectedTier) {
        return <div className="text-center py-8 text-red-500">Error: No se seleccionó cantidad</div>;
    }

    const { cash_discount_percent, deposit_percent } = product.price_config;

    // Calculate prices using FIXED BONUS amount (not percentage)
    const bulkPrice = selectedTier.bulk_price || 0;
    const fullPaymentBonus = selectedTier.full_payment_bonus || 0; // Fixed amount bonus
    const finalPriceWithBonus = bulkPrice - fullPaymentBonus;
    const depositAmount = (bulkPrice * (deposit_percent || 60)) / 100;

    // Visual Previews (Fixed values for the cards)
    const previewAdelantoPending = bulkPrice - depositAmount;
    const previewTotalBonus = fullPaymentBonus;
    const previewTotalFinal = finalPriceWithBonus;

    // Actual amounts to pay (Reactive to user selection)
    const amountToPay = paymentMethod === 'ADELANTO_60' ? depositAmount : finalPriceWithBonus;
    const amountPendingActual = paymentMethod === 'ADELANTO_60' ? previewAdelantoPending : 0;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPaymentProofFile(file);
        }
    };

    const handleSubmitOrder = async () => {
        if (!paymentProofFile) {
            alert('Por favor sube tu comprobante de pago (captura de Yape)');
            return;
        }

        setSubmitting(true);
        const supabase = createClient();

        try {
            // 1. Upload payment proof
            setUploadProgress(20);
            const orderCode = `WK${Date.now()}`;
            const ext = paymentProofFile.name.split('.').pop();
            const paymentFilename = `${orderCode}_YAPE.${ext}`;

            const { data: paymentData, error: paymentError } = await supabase.storage
                .from('payments')
                .upload(paymentFilename, paymentProofFile);

            if (paymentError) throw paymentError;

            const { data: { publicUrl: paymentUrl } } = supabase.storage
                .from('payments')
                .getPublicUrl(paymentFilename);

            setUploadProgress(50);

            // 2. Create order in database
            const orderData: any = {
                order_code: orderCode,
                customer_name: customerData.firstName || '',
                customer_lastname: customerData.lastName || '',
                customer_phone: customerData.phone || '',
                customer_dni: customerData.dni || null,
                customer_ruc: customerData.ruc || null,
                product_name: product.name,
                quantity: selectedQuantity,
                material_type: 'Estándar',
                design_files: designFileUrls,
                payment_proof_files: [paymentUrl],
                // Legacy fields for backward compatibility
                user_file_url: designFileUrls[0] || '',
                payment_proof_url: paymentUrl,
                payment_method_type: paymentMethod === 'ADELANTO_60' ? 'Adelanto 60%' : 'Pago Total',
                product_price: bulkPrice,
                delivery_fee: 0,
                total_amount: bulkPrice,
                amount_paid: amountToPay,
                status: paymentMethod === 'ADELANTO_60' ? 'Pendiente' : 'Pagado',
                is_delivery: false
            };

            console.log('📊 Intentando insertar orden:', orderData);

            const { error: insertError } = await supabase
                .from('orders')
                .insert(orderData);

            if (insertError) throw insertError;

            setUploadProgress(100);

            // 3. Redirect to WhatsApp
            setTimeout(() => {
                const phone = '51983555435'; // Número real de WankaPrint

                const status = paymentMethod === 'TOTAL'
                    ? '✅ CANCELADO (Bono aplicado)'
                    : '⏳ ADELANTO (60%)';

                const saldo = paymentMethod === 'TOTAL'
                    ? '0.00'
                    : (bulkPrice - amountToPay).toFixed(2);

                const rawMessage = `¡Hola, WankaPrint! 👋 He registrado mi pedido desde la web.\n\n` +
                    `📝 Orden: ${orderCode}\n` +
                    `👤 Cliente: ${customerData.firstName} ${customerData.lastName}\n` +
                    `📦 Producto: ${product.name} (${selectedQuantity} unidades)\n\n` +
                    `💵 Resumen de Pago:\n` +
                    `----------------------------\n` +
                    `Total de la Orden: S/ ${bulkPrice.toFixed(2)}\n` +
                    `Estado: ${status}\n` +
                    `Monto Pagado: S/ ${amountToPay.toFixed(2)}\n` +
                    `Saldo por Pagar: S/ ${saldo}\n\n` +
                    `🎨 Sobre el Diseño:\n` +
                    `He subido mis archivos/bocetos. Quedo atento a la coordinación con el diseñador para la revisión del arte final y el visto bueno.\n\n` +
                    `Ya subí mi comprobante en la web, pero se los envío por aquí también para mayor seguridad. 😊 Me avisan cuando pase a producción.`;

                const url = `https://wa.me/${phone}?text=${encodeURIComponent(rawMessage)}`;
                window.location.href = url;
            }, 1000);

        } catch (error: any) {
            console.error('❌ ERROR COMPLETO:', error);
            console.error('📋 Error message:', error?.message);
            console.error('🔍 Error details:', error?.details);
            console.error('💡 Error hint:', error?.hint);
            console.error('📊 Error code:', error?.code);

            // Show detailed error to user
            const errorMessage = error?.message || 'Error desconocido';
            const errorDetails = error?.details ? `\n\nDetalles: ${error.details}` : '';
            const errorHint = error?.hint ? `\n\nSugerencia: ${error.hint}` : '';

            alert(`❌ Error al procesar tu pedido:\n\n${errorMessage}${errorDetails}${errorHint}\n\nRevisa la consola para más información.`);

            setSubmitting(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Resumen y Pago</h2>
                <p className="text-gray-600">Revisa tu orden y elige tu método de pago</p>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Resumen de Orden</h3>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Producto:</span>
                        <span className="font-semibold">{product.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Cantidad:</span>
                        <span className="font-semibold">{selectedQuantity.toLocaleString()} unidades</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-semibold">{customerData.firstName} {customerData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">WhatsApp:</span>
                        <span className="font-semibold">{customerData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Archivos subidos:</span>
                        <span className="font-semibold text-green-600">
                            {designFileUrls.length === 1
                                ? '1 archivo subido'
                                : `${designFileUrls.length} archivos subidos`
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900">Elige tu método de pago</h3>

                {/* Adelanto Option */}
                <button
                    onClick={() => setPaymentMethod('ADELANTO_60')}
                    className={`
            w-full border-2 rounded-xl p-6 text-left transition-all
            ${paymentMethod === 'ADELANTO_60'
                            ? 'border-[#742384] bg-purple-50'
                            : 'border-gray-200 hover:border-purple-200'
                        }
          `}
                >
                    <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${paymentMethod === 'ADELANTO_60' ? 'border-[#742384] bg-[#742384]' : 'border-gray-300'
                            }`}>
                            {paymentMethod === 'ADELANTO_60' && (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet className="text-gray-700" size={20} />
                                <p className="font-bold text-lg">Dejar Adelanto</p>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                                💳 Cancela el resto al momento de recoger tu producto
                            </p>
                            <div className="bg-white rounded-lg p-4 border space-y-2">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Total de la orden:</span>
                                    <span className="font-semibold text-lg text-gray-900">S/ {bulkPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Pagar ahora ({deposit_percent}%):</span>
                                    <span className="font-bold text-xl text-[#742384]">S/ {depositAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Pendiente al recoger:</span>
                                    <span className="font-semibold text-yellow-600">S/ {previewAdelantoPending.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </button>

                {/* Total Payment Option */}
                <button
                    onClick={() => setPaymentMethod('TOTAL')}
                    className={`
            w-full border-2 rounded-xl p-6 text-left transition-all relative overflow-hidden
            ${paymentMethod === 'TOTAL'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-200'
                        }
          `}
                >
                    {/* Recommended Badge */}
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        RECOMENDADO
                    </div>

                    <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${paymentMethod === 'TOTAL' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                            }`}>
                            {paymentMethod === 'TOTAL' && (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="text-emerald-600" size={20} />
                                <p className="font-bold text-lg">Pago Total (🎁 Ahorro Extra)</p>
                            </div>
                            {fullPaymentBonus > 0 ? (
                                <>
                                    <p className="text-sm text-emerald-700 font-semibold mb-3">
                                        ✨ ¡Recibe S/ {fullPaymentBonus.toFixed(2)} de bonificación!
                                    </p>
                                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border-2 border-emerald-300">
                                        <p className="text-xs font-bold text-emerald-800 mb-2">🎉 ¡Felicidades! Accediste al Bono por Pago Total</p>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Precio normal:</span>
                                            <span className="text-gray-400 line-through font-semibold">S/ {bulkPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-emerald-700">Bonificación:</span>
                                            <span className="text-emerald-600 font-bold">-S/ {fullPaymentBonus.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t-2 border-emerald-300 mt-2 pt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-gray-700">Total a pagar:</span>
                                                <span className="font-black text-2xl text-emerald-600">S/ {finalPriceWithBonus.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Paga todo ahora
                                    </p>
                                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Total a pagar:</span>
                                            <span className="font-bold text-2xl text-emerald-600">S/ {bulkPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </button>
            </div>

            {/* Yape Upload */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-[#742384]" />
                    Realiza tu pago y sube el comprobante
                </h3>

                {/* QR CODE SECTION */}
                <div className="bg-white rounded-lg p-6 mb-6 border-2 border-purple-300 text-center">
                    <p className="font-semibold text-gray-900 mb-3">📱 Escanea el QR para pagar con Yape:</p>

                    {/* Real QR Image */}
                    <div className="flex justify-center mb-4 text-center">
                        <img
                            src="/images/qr-pago.png"
                            alt="QR de Pago Yape"
                            className="w-56 h-auto rounded-xl shadow-md border border-purple-100"
                        />
                    </div>

                    {/* Yape Details */}
                    <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                        <p className="font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                            💳 Datos para el Yapeo:
                        </p>
                        <div className="space-y-2 text-center">
                            <p className="text-gray-600">Titular: <span className="font-bold text-gray-900 uppercase">Omar Mayta</span></p>
                            <p className="text-gray-600">Número: <span className="text-[#742384] font-black text-2xl tracking-wider">983 555 435</span></p>
                            <div className="mt-4 pt-4 border-t border-purple-200">
                                <p className="text-sm text-gray-500 font-medium">Monto exacto a pagar:</p>
                                <p className="text-emerald-600 font-black text-3xl mt-1">S/ {amountToPay.toFixed(2)}</p>
                            </div>
                            <p className="text-xs text-purple-400 mt-2 italic">⚡ Envío inmediato por favor</p>
                        </div>
                    </div>
                </div>

                {/* File Upload Area */}
                <p className="font-medium text-gray-900 mb-3">📸 Luego sube tu captura de pago:</p>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-300 rounded-lg p-6 cursor-pointer hover:border-[#742384] hover:bg-white transition-all"
                >
                    {paymentProofFile ? (
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-500" size={32} />
                            <div>
                                <p className="font-semibold text-gray-900">{paymentProofFile.name}</p>
                                <p className="text-sm text-green-600">✓ Archivo listo</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="mx-auto text-[#742384] mb-2" size={32} />
                            <p className="font-medium text-gray-900">Haz clic para subir captura de Yape</p>
                            <p className="text-sm text-gray-500 mt-1">Imagen JPG o PNG</p>
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Progress Bar (when submitting) */}
            {submitting && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">Procesando tu pedido...</p>
                    <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-blue-600 h-full transition-all duration-500"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="text-xs text-blue-700 mt-1">{uploadProgress}% completado</p>
                </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={previousStep}
                    disabled={submitting}
                    className="border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 text-gray-700 font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Atrás
                </button>

                <button
                    onClick={handleSubmitOrder}
                    disabled={!paymentProofFile || submitting}
                    className="bg-[#742384] hover:bg-[#5a1b66] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        <>
                            Confirmar Pedido
                            <CheckCircle size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

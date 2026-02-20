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
        orderCode,
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
            const ext = paymentProofFile.name.split('.').pop();
            const timestamp = Date.now(); // Add timestamp to make filename unique
            const paymentFilename = `${orderCode}_YAPE_${timestamp}.${ext}`;

            const { data: paymentData, error: paymentError } = await supabase.storage
                .from('payments')
                .upload(paymentFilename, paymentProofFile, { upsert: true });

            if (paymentError) throw paymentError;

            const { data: { publicUrl: paymentUrl } } = supabase.storage
                .from('payments')
                .getPublicUrl(paymentFilename);

            setUploadProgress(50);

            // 2. Create order in database
            const orderData: any = {
                order_code: orderCode, // Use short code from context
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
                status: 'Pedido Recibido', // Always start with 'Pedido Recibido' - matches new DB constraint
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

                // Conditional design message based on whether files were uploaded
                const designMessage = designFileUrls.length > 0
                    ? `🎨 Sobre el Diseño: He subido mis archivos/bocetos. Quedo atento a la coordinación con el diseñador para la revisión del arte final y el visto bueno.`
                    : `🎨 Sobre el Diseño: Aún no tengo un diseño. Por favor, que el área de diseño se contacte conmigo al ${customerData.phone} para coordinar y empezar desde cero.`;

                const rawMessage = `¡Hola, WankaPrint! 👋 He registrado mi pedido desde la web.\n\n` +
                    `📝 Orden: ${orderCode}\n` +
                    `🔍 Rastrea tu pedido en: wankaprint.com/rastreo\n` +
                    `👤 Cliente: ${customerData.firstName} ${customerData.lastName}\n` +
                    `📦 Producto: ${product.name} (${selectedQuantity} unidades)\n\n` +
                    `💵 Resumen de Pago:\n` +
                    `----------------------------\n` +
                    `Total de la Orden: S/ ${bulkPrice.toFixed(2)}\n` +
                    `Estado: ${status}\n` +
                    `Monto Pagado: S/ ${amountToPay.toFixed(2)}\n` +
                    `Saldo por Pagar: S/ ${saldo}\n\n` +
                    `${designMessage}\n\n` +
                    `Ya subí mi comprobante en la web, pero se los envío por aquí también para mayor seguridad. 😊 Me avisan cuando mi pedido pase a fase de producción.`;
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

                <div className="grid grid-cols-2 gap-3">

                    {/* ── Adelanto Option ── */}
                    <button
                        onClick={() => setPaymentMethod('ADELANTO_60')}
                        className={`
            w-full border-2 rounded-xl p-4 text-left transition-all h-full
            ${paymentMethod === 'ADELANTO_60'
                                ? 'border-[#742384] bg-purple-50 shadow-md'
                                : 'border-gray-200 hover:border-purple-200'
                            }
          `}
                    >
                        <div className="flex flex-col gap-3 h-full">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'ADELANTO_60' ? 'border-[#742384] bg-[#742384]' : 'border-gray-300'}`}>
                                {paymentMethod === 'ADELANTO_60' && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Wallet className="text-[#742384]" size={17} />
                                    <p className="font-bold text-sm leading-tight">Dejar Adelanto</p>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">
                                    Cancela el resto al recoger
                                </p>
                                <div className="bg-white rounded-lg p-3 border space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center pb-1.5 border-b border-gray-100">
                                        <span className="text-gray-500">Total orden:</span>
                                        <span className="font-semibold text-gray-900">S/ {bulkPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Pagar ahora ({deposit_percent}%):</span>
                                        <span className="font-bold text-sm text-[#742384]">S/ {depositAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Al recoger:</span>
                                        <span className="font-semibold text-yellow-600">S/ {previewAdelantoPending.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* ── Pago Total Option ── */}
                    <button
                        onClick={() => setPaymentMethod('TOTAL')}
                        className={`
            w-full border-2 rounded-xl p-4 text-left transition-all relative overflow-hidden h-full
            ${paymentMethod === 'TOTAL'
                                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                : 'border-gray-200 hover:border-emerald-200'
                            }
          `}
                    >
                        {/* Recommended Badge */}
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                            RECOMENDADO
                        </div>

                        <div className="flex flex-col gap-3 h-full">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'TOTAL' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                                {paymentMethod === 'TOTAL' && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <CheckCircle className="text-emerald-600" size={17} />
                                    <p className="font-bold text-sm leading-tight">Pago Total 🎁</p>
                                </div>
                                {fullPaymentBonus > 0 ? (
                                    <>
                                        <p className="text-xs text-emerald-700 font-semibold mb-3">
                                            ✨ Bono S/ {fullPaymentBonus.toFixed(2)} incluido
                                        </p>
                                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200 text-xs space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Precio normal:</span>
                                                <span className="text-gray-400 line-through">S/ {bulkPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-emerald-700">Bonificación:</span>
                                                <span className="text-emerald-600 font-bold">-S/ {fullPaymentBonus.toFixed(2)}</span>
                                            </div>
                                            <div className="border-t border-emerald-200 pt-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-700">Total a pagar:</span>
                                                    <span className="font-black text-base text-emerald-600">S/ {finalPriceWithBonus.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Total a pagar:</span>
                                            <span className="font-bold text-base text-emerald-600">S/ {bulkPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>

                </div> {/* end grid */}
            </div>

            {/* Yape Upload */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-[#742384]" />
                    Realiza tu pago y sube el comprobante
                </h3>

                {/* ORDER CODE — compact & elegant */}
                <div className="flex items-center gap-3 bg-white border border-purple-200 rounded-xl px-4 py-3 mb-5 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#742384] text-sm font-black">#</span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Código de pedido</p>
                        <p className="text-xl font-black text-[#742384] tracking-wider leading-tight">{orderCode}</p>
                    </div>
                    <p className="text-xs text-gray-400 ml-auto text-right hidden sm:block">Úsalo para<br />rastrear tu pedido</p>
                </div>

                {/* QR + YAPE INSTRUCTIONS */}
                <div className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden mb-5">

                    {/* Header — personalizado */}
                    <div className="bg-gradient-to-r from-[#742384] to-pink-600 px-5 py-4 text-white text-center">
                        <p className="font-black text-base leading-snug">
                            Yapea al <span className="text-yellow-300 tracking-wider">983 554 435</span> el monto seleccionado.
                        </p>
                        <p className="text-white/90 text-sm font-medium">A nombre de <span className="font-bold">Omar Mayta</span></p>
                    </div>

                    {/* Monto destacado */}
                    <div className="px-5 pt-4 pb-2 text-center border-b border-purple-100">
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Monto a pagar ahora</p>
                        <p className="text-emerald-600 font-black text-3xl">
                            S/ {amountToPay.toFixed(2)}
                        </p>
                    </div>

                    {/* QR centrado */}
                    <div className="flex flex-col items-center px-5 py-5 gap-3">
                        <img
                            src="/images/qr-pago.png"
                            alt="QR de Pago Yape"
                            className="w-52 h-auto rounded-xl shadow-md border border-purple-100"
                        />
                        {/* Texto de ayuda para captura de QR */}
                        <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 text-center max-w-xs">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                💡 O toma captura del QR y dentro de Yape elige
                                <span className="font-semibold text-[#742384]"> &quot;Subir una imagen con QR&quot;</span> para yapear como prefieras.
                            </p>
                        </div>
                    </div>

                    {/* Alerta código */}
                    <div className="bg-yellow-50 border-t border-yellow-200 px-5 py-3">
                        <p className="text-xs text-orange-700 font-semibold flex items-start gap-2">
                            <span className="text-base flex-shrink-0">⚠️</span>
                            <span>
                                <strong>Importante:</strong> Incluye el código{' '}
                                <span className="font-black text-[#742384]">{orderCode}</span>{' '}
                                en la descripción de tu Yape para que validemos tu pedido rápidamente.
                            </span>
                        </p>
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

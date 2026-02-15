'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { PAYMENT_CONFIG } from '@/lib/payment-config'

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    amountToPay: number
    orderCode: string
    customerName: string
    productName?: string
    productImage?: string
    onPaymentSubmit: (fileUrl: string) => Promise<void>
}

export default function PaymentModal({
    isOpen,
    onClose,
    amountToPay,
    orderCode,
    customerName,
    productName,
    productImage,
    onPaymentSubmit
}: PaymentModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setUploadError(null)
        }
    }

    const handleUploadAndSubmit = async () => {
        if (!file) {
            setUploadError('Por favor sube la captura del pago')
            return
        }

        try {
            setIsUploading(true)
            setUploadError(null)
            const supabase = createClient()

            const fileExt = file.name.split('.').pop()
            const fileName = `${orderCode}_PAYMENT_${Date.now()}.${fileExt}`

            // Subir a bucket 'payments' de Supabase
            const { error: uploadError, data } = await supabase.storage
                .from('payments')
                .upload(fileName, file, { upsert: true })

            if (uploadError) throw uploadError

            // Pasar la ruta del archivo al padre
            await onPaymentSubmit(data.path)

        } catch (error: any) {
            console.error('Error uploading payment:', error)
            setUploadError(error.message || 'Error al subir la imagen')
            setIsUploading(false) // Solo resetear si hay error
        }
        // No resetear isUploading aquí - el modal se cerrará automáticamente
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="bg-[#742384] p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Pago con Yape</h2>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Resumen */}
                    <div className="text-center space-y-2">
                        {productImage && (
                            <div className="mb-2 w-20 h-20 bg-white rounded-lg overflow-hidden mx-auto border border-gray-100">
                                <img src={productImage} alt="Producto" className="w-full h-full object-contain" />
                            </div>
                        )}
                        {productName && <h3 className="font-bold text-gray-900">{productName}</h3>}

                        <p className="text-gray-600">Total a pagar</p>
                        <p className="text-4xl font-bold text-[#742384]">
                            S/ {amountToPay.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                            Pedido: <span className="font-mono font-medium text-black">{orderCode}</span>
                        </p>
                    </div>

                    {/* QR */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-56 h-56 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200 relative overflow-hidden shadow-sm">
                            <img
                                src={PAYMENT_CONFIG.qrImage}
                                alt="QR Yape"
                                className="w-full h-full object-contain p-2"
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Yapear a nombre de</p>
                            <p className="font-bold text-lg text-gray-900">{PAYMENT_CONFIG.recipient.name}</p>
                            <p className="text-sm text-gray-600 font-medium">{PAYMENT_CONFIG.recipient.phone}</p>
                        </div>
                    </div>

                    {/* Upload */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Adjuntar Captura de Pantalla
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${file
                                ? 'border-green-500 bg-green-50 hover:bg-green-100'
                                : 'border-[#742384] bg-purple-50 hover:bg-purple-100'
                                }`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="mb-1 text-sm font-semibold text-green-700">{file.name}</p>
                                            <p className="text-xs text-green-600">✓ Captura lista</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mb-2 text-[#742384]" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Clic para subir</span>
                                            </p>
                                            <p className="text-xs text-center text-gray-500 px-4">
                                                PNG, JPG or JPEG (MAX. 5MB)
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        {uploadError && (
                            <p className="text-red-500 text-sm text-center">{uploadError}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleUploadAndSubmit}
                        disabled={!file || isUploading}
                        className={cn(
                            "w-full py-3 px-4 bg-[#742384] hover:bg-[#5a1b66] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2",
                            (!file || isUploading) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" /> Procesando...
                            </>
                        ) : (
                            'Confirmar Pago'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

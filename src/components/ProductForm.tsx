'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Upload, ChevronRight, Store, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PaymentMethod, PricingResult } from '@/lib/pricing'
import { useState, useEffect } from 'react'

const orderSchema = z.object({
    firstName: z.string().min(2, 'Nombre requerido'),
    lastName: z.string().min(2, 'Apellido requerido'),
    phone: z.string().regex(/^9\d{8}$/, 'Celular debe tener 9 dígitos y empezar con 9'),
    dni: z.string().optional(),
})

export type OrderFormValues = z.infer<typeof orderSchema>

interface ProductFormProps {
    productName: string
    productImage?: string
    pricing: PricingResult
    quantity: number
    paymentMethod: PaymentMethod
    onQuantityChange: (q: number) => void
    onPaymentMethodChange: (m: PaymentMethod) => void
    onFileChange: (f: File | null) => void
    onSubmit: (data: OrderFormValues) => void
    hideQuantitySelector?: boolean
}

export default function ProductForm({
    productName,
    productImage,
    pricing,
    quantity,
    paymentMethod,
    onQuantityChange,
    onPaymentMethodChange,
    onFileChange,
    onSubmit,
    hideQuantitySelector = false
}: ProductFormProps) {

    const { register, handleSubmit, formState: { errors } } = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema)
    })

    const [localFile, setLocalFile] = useState<File | null>(null)

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null
        setLocalFile(f)
        onFileChange(f)
    }

    return (
        <div className="space-y-8">
            {/* 1. Config */}
            {!hideQuantitySelector && (
                <section className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><Store size={18} /> Configuración</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Cantidad</label>
                        <select
                            value={quantity}
                            onChange={(e) => onQuantityChange(Number(e.target.value))}
                            className="w-full border rounded-lg p-2"
                        >
                            {[100, 200, 500, 1000].map(q => (
                                <option key={q} value={q}>{q} unidades</option>
                            ))}
                        </select>
                    </div>
                </section>
            )}

            {/* 2. Upload */}
            <section className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                <h3 className="font-bold flex items-center gap-2"><Upload size={18} /> Diseño</h3>
                <div className={`border-2 border-dashed rounded-lg p-4 transition-all ${localFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}>
                    {localFile ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-700">{localFile.name}</p>
                                <p className="text-xs text-green-600">✓ Archivo listo para enviar</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-amber-600">⚠️ Es obligatorio subir un diseño</p>
                    )}
                    <input
                        type="file"
                        onChange={handleFile}
                        accept="image/*,.pdf,.ai,.psd"
                        className="w-full mt-3 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-[#742384] hover:file:bg-purple-100 cursor-pointer"
                    />
                </div>
            </section>

            {/* 3. Customer Data */}
            <section className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg">Datos del Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Nombre</label>
                        <input {...register('firstName')} className="w-full border rounded-lg p-2" />
                        {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium">Apellido</label>
                        <input {...register('lastName')} className="w-full border rounded-lg p-2" />
                        {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Celular (WhatsApp)</label>
                        <input {...register('phone')} className="w-full border rounded-lg p-2" placeholder="987654321" />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium">DNI (Opcional)</label>
                        <input {...register('dni')} className="w-full border rounded-lg p-2" />
                    </div>
                </div>
            </section>

            {/* 4. Payment Method */}
            <section className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg">Método de Pago</h3>
                <div className="space-y-3">
                    <label className={cn("block border p-4 rounded-lg cursor-pointer transition-colors", paymentMethod === 'ADELANTO_60_RECOJO' ? "bg-purple-50 border-[#742384]" : "hover:bg-gray-50")}>
                        <div className="flex items-center gap-3">
                            <input type="radio" value="ADELANTO_60_RECOJO" checked={paymentMethod === 'ADELANTO_60_RECOJO'} onChange={() => onPaymentMethodChange('ADELANTO_60_RECOJO')} className="accent-[#742384] w-5 h-5" />
                            <div>
                                <p className="font-bold">Adelanto 60% (Recojo en Tienda)</p>
                                <p className="text-sm text-gray-500">Paga el 60% ahora y el resto al recoger.</p>
                            </div>
                        </div>
                    </label>

                    <label className={cn("block border p-4 rounded-lg cursor-pointer transition-colors", paymentMethod === 'TOTAL_RECOJO' ? "bg-purple-50 border-[#742384]" : "hover:bg-gray-50")}>
                        <div className="flex items-center gap-3">
                            <input type="radio" value="TOTAL_RECOJO" checked={paymentMethod === 'TOTAL_RECOJO'} onChange={() => onPaymentMethodChange('TOTAL_RECOJO')} className="accent-[#742384] w-5 h-5" />
                            <div>
                                <p className="font-bold">Pago Completo (Recojo en Tienda)</p>
                                <p className="text-sm text-gray-500">Sin costo de envío.</p>
                            </div>
                        </div>
                    </label>

                    <label className={cn("block border p-4 rounded-lg cursor-pointer transition-colors", paymentMethod === 'TOTAL_ENVIO' ? "bg-purple-50 border-[#742384]" : "hover:bg-gray-50")}>
                        <div className="flex items-center gap-3">
                            <input type="radio" value="TOTAL_ENVIO" checked={paymentMethod === 'TOTAL_ENVIO'} onChange={() => onPaymentMethodChange('TOTAL_ENVIO')} className="accent-[#742384] w-5 h-5" />
                            <div>
                                <p className="font-bold">Pago Completo + Envío</p>
                                <p className="text-sm text-gray-500">Recibe en tu domicilio (+ S/ {pricing.deliveryFee.toFixed(2)})</p>
                            </div>
                        </div>
                    </label>
                </div>
            </section>

            {/* Summary */}
            <div className="bg-gray-900 text-white p-6 rounded-xl">
                {productImage && (
                    <div className="mb-4 w-20 h-20 bg-white rounded-lg overflow-hidden mx-auto">
                        <img src={productImage} alt="Producto" className="w-full h-full object-contain" />
                    </div>
                )}
                <div className="flex justify-between items-center mb-4">
                    <span>Producto ({quantity} un.)</span>
                    <span>S/ {pricing.productPrice.toFixed(2)}</span>
                </div>
                {pricing.deliveryFee > 0 && (
                    <div className="flex justify-between items-center mb-4 text-green-400">
                        <span>Envío</span>
                        <span>+ S/ {pricing.deliveryFee.toFixed(2)}</span>
                    </div>
                )}
                <div className="border-t border-gray-700 my-4"></div>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-gray-400 text-sm">A pagar ahora</p>
                        <p className="text-3xl font-bold">S/ {pricing.amountToPayNow.toFixed(2)}</p>
                    </div>
                    {pricing.amountPending > 0 && (
                        <div className="text-right">
                            <p className="text-gray-400 text-sm">Pendiente (al recoger)</p>
                            <p className="text-xl font-bold text-yellow-500">S/ {pricing.amountPending.toFixed(2)}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubmit(onSubmit)}
                    className="w-full bg-[#742384] hover:bg-[#5a1b66] text-white font-bold py-4 rounded-lg transition-all text-lg flex items-center justify-center gap-2">
                    Continuar al Pago <ChevronRight />
                </button>
            </div>
        </div>
    )
}

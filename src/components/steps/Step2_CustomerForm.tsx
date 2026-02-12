'use client';

import { usePurchaseStepper } from '@/contexts/PurchaseStepperContext';
import { User, Phone, FileText, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const customerSchema = z.object({
    firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
    phone: z.string().regex(/^9\d{8}$/, 'Celular debe tener 9 dígitos y empezar con 9'),
    dni: z.string().optional(),
    ruc: z.string().optional()
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function Step2_CustomerForm() {
    const { customerData, setCustomerData, nextStep, previousStep } = usePurchaseStepper();

    const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: customerData
    });

    const onSubmit = (data: CustomerFormData) => {
        setCustomerData(data);
        nextStep();
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Déjanos tus datos</h2>
                <p className="text-gray-600">Para que nuestro equipo de diseño te contacte</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Required Fields Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <User size={20} className="text-[#742384]" />
                        Información Personal
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('firstName')}
                                type="text"
                                placeholder="Ej: Juan"
                                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#742384] focus:outline-none transition-colors"
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Apellido <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('lastName')}
                                type="text"
                                placeholder="Ej: Pérez"
                                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#742384] focus:outline-none transition-colors"
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Phone size={16} />
                            Celular (WhatsApp) <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('phone')}
                            type="tel"
                            placeholder="987654321"
                            maxLength={9}
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#742384] focus:outline-none transition-colors"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">📱 Te contactaremos por este número</p>
                    </div>
                </div>

                {/* Optional Fields Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700">
                        <FileText size={20} className="text-[#742384]" />
                        Información Adicional (Opcional)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* DNI */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <FileText size={16} />
                                DNI
                            </label>
                            <input
                                {...register('dni')}
                                type="text"
                                placeholder="12345678"
                                maxLength={8}
                                className="w-full border-2 border-purple-200 bg-white rounded-lg p-3 focus:border-[#742384] focus:outline-none transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-1">Para emitir comprobante</p>
                        </div>

                        {/* RUC */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Building2 size={16} />
                                RUC
                            </label>
                            <input
                                {...register('ruc')}
                                type="text"
                                placeholder="20123456789"
                                maxLength={11}
                                className="w-full border-2 border-purple-200 bg-white rounded-lg p-3 focus:border-[#742384] focus:outline-none transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-1">Para factura electrónica</p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                    <button
                        type="button"
                        onClick={previousStep}
                        className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Atrás
                    </button>

                    <button
                        type="submit"
                        className="bg-[#742384] hover:bg-[#5a1b66] text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
                    >
                        Continuar
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}

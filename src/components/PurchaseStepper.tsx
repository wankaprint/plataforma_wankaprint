'use client';

import { usePurchaseStepper } from '@/contexts/PurchaseStepperContext';
import { Check } from 'lucide-react';

export default function PurchaseStepper() {
    const { currentStep, goToStep } = usePurchaseStepper();

    const steps = [
        { number: 1, label: 'Cantidad' },
        { number: 2, label: 'Datos' },
        { number: 3, label: 'Archivos' },
        { number: 4, label: 'Pago' }
    ];

    return (
        <div className="w-full py-6">
            {/* Progress Bar */}
            <div className="flex items-center justify-between max-w-3xl mx-auto px-4">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => goToStep(step.number as 1 | 2 | 3 | 4)}
                                disabled={currentStep < step.number}
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${currentStep > step.number
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.number
                                            ? 'bg-[#742384] text-white scale-110 shadow-lg'
                                            : 'bg-gray-200 text-gray-400'
                                    }
                  ${currentStep >= step.number ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                `}
                            >
                                {currentStep > step.number ? (
                                    <Check size={20} />
                                ) : (
                                    step.number
                                )}
                            </button>
                            <span className={`text-xs mt-2 font-medium ${currentStep === step.number ? 'text-[#742384]' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connecting Line */}
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 rounded transition-all ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

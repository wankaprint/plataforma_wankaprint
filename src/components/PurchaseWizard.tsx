'use client';

import { usePurchaseStepper } from '@/contexts/PurchaseStepperContext';
import PurchaseStepper from './PurchaseStepper';
import Step1_QuantitySelector from './steps/Step1_QuantitySelector';
import Step2_CustomerForm from './steps/Step2_CustomerForm';
import Step3_FileUploader from './steps/Step3_FileUploader';
import Step4_PaymentSummary from './steps/Step4_PaymentSummary';

export default function PurchaseWizard() {
    const { currentStep } = usePurchaseStepper();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Progress Indicator */}
                <PurchaseStepper />

                {/* Step Content */}
                <div className="mt-8 animate-in fade-in slide-in-from-right-5 duration-500">
                    {currentStep === 1 && <Step1_QuantitySelector />}
                    {currentStep === 2 && <Step2_CustomerForm />}
                    {currentStep === 3 && <Step3_FileUploader />}
                    {currentStep === 4 && <Step4_PaymentSummary />}
                </div>
            </div>
        </div>
    );
}

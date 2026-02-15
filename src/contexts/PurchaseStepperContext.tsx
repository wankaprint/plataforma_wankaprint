'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    PurchaseStepperContextType,
    PurchaseStepperState,
    CustomerData,
    ProductWithConfig
} from '@/types/purchase-stepper';

const PurchaseStepperContext = createContext<PurchaseStepperContextType | null>(null);

export function usePurchaseStepper() {
    const context = useContext(PurchaseStepperContext);
    if (!context) {
        throw new Error('usePurchaseStepper must be used within PurchaseStepperProvider');
    }
    return context;
}

interface Props {
    children: React.ReactNode;
    product: ProductWithConfig | null;
}

export function PurchaseStepperProvider({ children, product }: Props) {
    // SAFE INITIALIZATION: Check if tiers exists and is an array
    const getSafeTier = (product: ProductWithConfig | null, index: number = 0) => {
        if (!product?.price_config?.tiers) return null;
        if (!Array.isArray(product.price_config.tiers)) return null;
        if (product.price_config.tiers.length === 0) return null;
        return product.price_config.tiers[index] || null;
    };

    const [state, setState] = useState<PurchaseStepperState>({
        selectedQuantity: 1000,
        selectedTier: getSafeTier(product, 0),
        customerData: {
            firstName: '',
            lastName: '',
            phone: '',
            dni: '',
            ruc: ''
        },
        designFiles: [],
        designFileUrls: [],
        uploadProgress: {},
        paymentMethod: 'TOTAL',
        paymentProofFile: null,
        paymentProofUrl: null,
        currentStep: 1,
        product
    });

    const setQuantity = useCallback((quantity: number) => {
        const tiers = state.product?.price_config?.tiers;
        let tier = null;

        // SAFE: Validate tiers is an array before using .find()
        if (Array.isArray(tiers)) {
            tier = tiers.find(t => t.quantity === quantity) || null;
        }

        setState(prev => ({
            ...prev,
            selectedQuantity: quantity,
            selectedTier: tier
        }));
    }, [state.product]);

    const setCustomerData = useCallback((data: Partial<CustomerData>) => {
        setState(prev => ({
            ...prev,
            customerData: { ...prev.customerData, ...data }
        }));
    }, []);

    const addDesignFiles = useCallback((files: File[]) => {
        setState(prev => ({
            ...prev,
            designFiles: [...prev.designFiles, ...files]
        }));
    }, []);

    const removeDesignFile = useCallback((filename: string) => {
        setState(prev => ({
            ...prev,
            designFiles: prev.designFiles.filter(f => f.name !== filename),
            uploadProgress: Object.fromEntries(
                Object.entries(prev.uploadProgress).filter(([key]) => key !== filename)
            )
        }));
    }, []);

    const setDesignFileUrls = useCallback((urls: string[]) => {
        setState(prev => ({ ...prev, designFileUrls: urls }));
    }, []);

    const setPaymentMethod = useCallback((method: 'ADELANTO_60' | 'TOTAL') => {
        setState(prev => ({ ...prev, paymentMethod: method }));
    }, []);

    const setPaymentProofFile = useCallback((file: File | null) => {
        setState(prev => ({ ...prev, paymentProofFile: file }));
    }, []);

    const nextStep = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentStep: Math.min(4, prev.currentStep + 1) as 1 | 2 | 3 | 4
        }));
    }, []);

    const previousStep = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentStep: Math.max(1, prev.currentStep - 1) as 1 | 2 | 3 | 4
        }));
    }, []);

    const goToStep = useCallback((step: 1 | 2 | 3 | 4) => {
        setState(prev => ({ ...prev, currentStep: step }));
    }, []);

    const reset = useCallback(() => {
        setState({
            selectedQuantity: 1000,
            selectedTier: getSafeTier(product, 0),
            customerData: {
                firstName: '',
                lastName: '',
                phone: '',
                dni: '',
                ruc: ''
            },
            designFiles: [],
            designFileUrls: [],
            uploadProgress: {},
            paymentMethod: 'TOTAL',
            paymentProofFile: null,
            paymentProofUrl: null,
            currentStep: 1,
            product
        });
    }, [product]);

    const value: PurchaseStepperContextType = {
        ...state,
        setQuantity,
        setCustomerData,
        addDesignFiles,
        removeDesignFile,
        setDesignFileUrls,
        setPaymentMethod,
        setPaymentProofFile,
        nextStep,
        previousStep,
        goToStep,
        reset
    };

    return (
        <PurchaseStepperContext.Provider value={value}>
            {children}
        </PurchaseStepperContext.Provider>
    );
}

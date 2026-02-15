// Extended types for new database schema with price_config
export interface PriceConfig {
    tiers: Array<{
        quantity: number;
        market_price: number;
        bulk_price: number;
        full_payment_bonus?: number; // Fixed bonus amount for full payment (e.g., 2 or 3 soles)
    }>;
    cash_discount_percent: number; // Deprecated - keeping for backward compatibility
    deposit_percent: number;
}

export interface ProductWithConfig {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    price_config: PriceConfig;
    // Legacy fields (deprecated)
    base_price_1k: number;
    base_price_2k: number;
    base_price_3k: number;
    min_quantity: number;
}

export interface ExtendedOrder {
    id: string;
    created_at: string;
    order_code: string;
    customer_name: string;
    customer_lastname: string;
    customer_phone: string;
    customer_dni: string | null;
    customer_ruc: string | null; // NEW
    product_name: string;
    quantity: number;
    material_type: string;
    design_files: string[]; // NEW: Array of design file URLs
    payment_proof_files: string[]; // NEW: Array of payment proof URLs
    // Legacy fields (deprecated)
    user_file_url: string;
    payment_proof_url: string | null;
    payment_method_type: string;
    product_price: number;
    delivery_fee: number;
    total_amount: number;
    amount_paid: number;
    status: string;
    is_delivery: boolean;
}

// Stepper State Types
export interface CustomerData {
    firstName: string;
    lastName: string;
    phone: string;
    dni?: string;
    ruc?: string;
}

export interface PurchaseStepperState {
    // Step 1: Quantity
    selectedQuantity: number;
    selectedTier: PriceConfig['tiers'][0] | null;

    // Step 2: Customer
    customerData: CustomerData;

    // Step 3: Design Files
    designFiles: File[];
    designFileUrls: string[];
    uploadProgress: Record<string, number>; // filename -> progress %

    // Step 4: Payment
    paymentMethod: 'ADELANTO_60' | 'TOTAL';
    paymentProofFile: File | null;
    paymentProofUrl: string | null;
    orderCode: string; // Short code like WK-A7B2

    // Navigation
    currentStep: 1 | 2 | 3 | 4;

    // Product Info
    product: ProductWithConfig | null;
}

export interface PurchaseStepperActions {
    setQuantity: (quantity: number) => void;
    setCustomerData: (data: Partial<CustomerData>) => void;
    addDesignFiles: (files: File[]) => void;
    removeDesignFile: (filename: string) => void;
    setDesignFileUrls: (urls: string[]) => void;
    setPaymentMethod: (method: 'ADELANTO_60' | 'TOTAL') => void;
    setPaymentProofFile: (file: File | null) => void;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: 1 | 2 | 3 | 4) => void;
    reset: () => void;
}

export type PurchaseStepperContextType = PurchaseStepperState & PurchaseStepperActions;

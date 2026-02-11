export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            orders: {
                Row: {
                    id: string
                    created_at: string
                    order_code: string
                    customer_name: string
                    customer_lastname: string
                    customer_phone: string
                    customer_dni: string | null
                    product_name: string
                    quantity: number
                    material_type: string
                    user_file_url: string
                    payment_proof_url: string | null
                    payment_method_type: string
                    product_price: number
                    delivery_fee: number // Assuming not null in Row based on logic, but could be 0
                    total_amount: number
                    amount_paid: number
                    status: string
                    is_delivery: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    order_code: string
                    customer_name: string
                    customer_lastname: string
                    customer_phone: string
                    customer_dni?: string | null
                    product_name: string
                    quantity: number
                    material_type: string
                    user_file_url: string
                    payment_proof_url?: string | null
                    payment_method_type: string
                    product_price: number
                    delivery_fee?: number
                    total_amount: number
                    amount_paid: number
                    status?: string
                    is_delivery?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    order_code?: string
                    customer_name?: string
                    customer_lastname?: string
                    customer_phone?: string
                    customer_dni?: string | null
                    product_name?: string
                    quantity?: number
                    material_type?: string
                    user_file_url?: string
                    payment_proof_url?: string | null
                    payment_method_type?: string
                    product_price?: number
                    delivery_fee?: number
                    total_amount?: number
                    amount_paid?: number
                    status?: string
                    is_delivery?: boolean
                }
            }
            products: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    description: string | null
                    image_url: string | null
                    base_price_1k: number
                    base_price_2k: number
                    base_price_3k: number
                    min_quantity: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    description?: string | null
                    image_url?: string | null
                    base_price_1k?: number
                    base_price_2k?: number
                    base_price_3k?: number
                    min_quantity?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    description?: string | null
                    image_url?: string | null
                    base_price_1k?: number
                    base_price_2k?: number
                    base_price_3k?: number
                    min_quantity?: number
                }
            }
        }
        Views: {
            public_prices: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    image_url: string | null
                    price_unit: number
                    min_quantity: number
                }
            }
        }
    }
}

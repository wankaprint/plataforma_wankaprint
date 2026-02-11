'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle } from 'lucide-react'
import PaymentModal from '@/components/PaymentModal'
import ProductForm, { OrderFormValues } from '@/components/ProductForm'
import { PAYMENT_CONFIG } from '@/lib/payment-config'

// Helper function to normalize image paths
function normalizeImagePath(path: string | null): string {
    if (!path) return ''

    // External URL - use as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }

    // Absolute local path - use as-is
    if (path.startsWith('/')) {
        return path
    }

    // Relative path - already has images/ prefix?
    if (path.startsWith('images/')) {
        return `/${path}`
    }

    // Relative path - prepend /images/
    return `/images/${path}`
}

// Pricing Logic Types
type PaymentMethod = 'ADELANTO_60_RECOJO' | 'TOTAL_RECOJO' | 'TOTAL_ENVIO'

interface PricingResult {
    paymentMethod: PaymentMethod
    productPrice: number
    deliveryFee: number
    totalAmount: number
    amountToPayNow: number
    amountPending: number
    discountApplied?: boolean
}

// Ensure this matches the DB schema
interface Product {
    id: string
    name: string
    description: string | null
    image_url: string | null
    base_price_1k: number
    base_price_2k: number
    base_price_3k: number
}

function calculateDynamicPricing(product: Product, quantity: number, method: PaymentMethod): PricingResult {
    let basePrice = 0

    // Select price based on quantity directly from DB columns
    if (quantity === 1000) basePrice = product.base_price_1k
    else if (quantity === 2000) basePrice = product.base_price_2k
    else if (quantity === 3000) basePrice = product.base_price_3k
    else basePrice = product.base_price_1k // Fallback

    const productPrice = basePrice

    let deliveryFee = 0
    if (method === 'TOTAL_ENVIO') {
        deliveryFee = PAYMENT_CONFIG.deliveryFee
    }

    const totalAmount = productPrice + deliveryFee
    let amountToPayNow = 0
    let amountPending = 0

    if (method === 'ADELANTO_60_RECOJO') {
        amountToPayNow = Number((totalAmount * 0.60).toFixed(2))
        amountPending = Number((totalAmount - amountToPayNow).toFixed(2))
    } else {
        amountToPayNow = totalAmount
        amountPending = 0
    }

    return {
        paymentMethod: method,
        productPrice,
        deliveryFee,
        totalAmount,
        amountToPayNow,
        amountPending
    }
}

export default function ProductDetail() {
    const params = useParams()
    const router = useRouter()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)

    // Form State
    const [quantity, setQuantity] = useState(1000) // Default 1000
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ADELANTO_60_RECOJO')
    const [designFile, setDesignFile] = useState<File | null>(null)
    const [tempFormData, setTempFormData] = useState<OrderFormValues | null>(null)

    // Modals
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    // Order Code
    const orderCode = useRef(`WNK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`).current

    useEffect(() => {
        async function fetchProduct() {
            if (!params.id) return
            const supabase = createClient()
            const { data, error } = await supabase
                .from('products') // Updated table name
                .select('*')
                .eq('id', params.id)
                .single()

            if (data) {
                setProduct(data)
            } else {
                console.error("Error fetching product", error)
            }
            setLoading(false)
        }
        fetchProduct()
    }, [params.id])

    // Calculated Pricing
    const pricing = product ? calculateDynamicPricing(product, quantity, paymentMethod) : null

    const handleFormSubmit = (data: OrderFormValues) => {
        setTempFormData(data)
        setShowPaymentModal(true)
    }

    const handlePaymentSuccess = async (paymentProofUrl: string) => {
        if (!tempFormData || !product || !pricing) return

        try {
            const supabase = createClient()

            // 1. Upload Design
            if (!designFile) throw new Error("No design file selected")

            const fileExt = designFile.name.split('.').pop()
            const fileName = `${orderCode}_DESIGN_${Date.now()}.${fileExt}`
            const { data: designData, error: designError } = await supabase.storage
                .from('designs')
                .upload(fileName, designFile)

            if (designError) throw designError

            // 2. Create Order
            const { error: insertError } = await supabase.from('orders').insert({
                order_code: orderCode,
                customer_name: tempFormData.firstName,
                customer_lastname: tempFormData.lastName,
                customer_phone: tempFormData.phone,
                customer_dni: tempFormData.dni,

                product_name: product.name,
                quantity: quantity,
                material_type: 'Estándar',

                user_file_url: designData.path,
                payment_proof_url: paymentProofUrl,

                payment_method_type: paymentMethod,
                product_price: pricing.productPrice,
                delivery_fee: pricing.deliveryFee,
                total_amount: pricing.totalAmount,
                amount_paid: pricing.amountToPayNow,

                status: 'pendiente_confirmacion',
                is_delivery: paymentMethod === 'TOTAL_ENVIO'
            })

            if (insertError) throw insertError

            router.push('/thankyou')
        } catch (error: any) {
            console.error(error)
            alert(`Error: ${error.message}`)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#742384]" /></div>
    if (!product) return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Producto no encontrado</h1>
            <p className="text-gray-500 max-w-md mt-2">Es posible que el enlace sea incorrecto o el producto haya sido eliminado.</p>
            <button onClick={() => router.push('/catalogo')} className="mt-6 px-6 py-2 bg-[#742384] text-white rounded-xl font-bold">
                Volver al Catálogo
            </button>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left: Product Info */}
                <div className="lg:w-1/3 space-y-6">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm border relative group">
                        {product.image_url ? (
                            <img
                                src={normalizeImagePath(product.image_url)}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                    if (fallback) fallback.style.display = 'flex'
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">{product.name}</h1>
                        <div className="prose prose-purple text-gray-600">
                            <p>{product.description}</p>
                        </div>
                    </div>

                    {/* Quantity Selector specific to this page */}
                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                        {/* Quantity Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 py-3"
                            >
                                <option value={1000}>1 Millar (S/ {product.base_price_1k})</option>
                                <option value={2000}>2 Millares (S/ {product.base_price_2k})</option>
                                <option value={3000}>3 Millares (S/ {product.base_price_3k})</option>
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            * Precios mejorados por mayor volumen.
                        </p>
                    </div>
                </div>

                {/* Right: Form Component */}
                <div className="lg:w-2/3">
                    {pricing && (
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalles de Compra</h2>

                            {/* Reusing ProductForm but passing the specific props.
                                note: ProductForm likely has its own 'quantity' input which we might want to hide or sync
                                Since we pulled Quantity out to the left (or top), we should just pass it down.
                            */}
                            <ProductForm
                                productName={product.name}
                                productImage={normalizeImagePath(product.image_url)}
                                pricing={pricing}
                                quantity={quantity} // Pass the state
                                paymentMethod={paymentMethod}
                                onQuantityChange={setQuantity} // This might duplicate the selector if ProductForm has one
                                onPaymentMethodChange={setPaymentMethod}
                                onFileChange={setDesignFile}
                                onSubmit={handleFormSubmit}
                                hideQuantitySelector={true} // We need to ensure ProductForm supports hiding it if we render it outside, or just let ProductForm handle it.
                            // For MVP, let's keep it simple. If ProductForm has a quantity input, we sync it.
                            />
                        </div>
                    )}
                </div>
            </div>

            {pricing && tempFormData && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    amountToPay={pricing.amountToPayNow}
                    customerName={`${tempFormData.firstName} ${tempFormData.lastName}`}
                    orderCode={orderCode}
                    productName={product.name}
                    productImage={normalizeImagePath(product.image_url)}
                    onPaymentSubmit={handlePaymentSuccess}
                />
            )}
        </div>
    )
}

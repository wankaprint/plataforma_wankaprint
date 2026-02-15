'use client';

import { useState } from 'react';
import { usePurchaseStepper } from '@/contexts/PurchaseStepperContext';
import { ChevronDown } from 'lucide-react';

export default function Step1_QuantitySelector() {
    const { selectedQuantity, setQuantity, selectedTier, product, nextStep } = usePurchaseStepper();
    const [showMoreQuantities, setShowMoreQuantities] = useState(false);
    const [customQuantity, setCustomQuantity] = useState<number | null>(null);

    // DEFENSIVE CHECKS: Prevent crashes if data is loading or invalid
    if (!product || !product.price_config) {
        return <div className="text-center py-8 text-red-500">Error: No se encontró configuración de precios</div>;
    }

    const { tiers, cash_discount_percent } = product.price_config;

    // CRITICAL: Validate tiers is an array before using .slice()
    if (!Array.isArray(tiers) || tiers.length === 0) {
        return <div className="text-center py-8 text-red-500">Error: Configuración de precios inválida</div>;
    }

    // Safe to use .slice() now
    const fixedTiers = tiers.slice(0, 3);
    const moreTiers = tiers.slice(3);

    const handleQuantitySelect = (quantity: number) => {
        setQuantity(quantity);
        setCustomQuantity(null);
    };

    const handleCustomQuantitySelect = (quantity: number) => {
        setQuantity(quantity);
        setCustomQuantity(quantity);
        // Keep dropdown open so price shows immediately (no double-click needed)
        // setShowMoreQuantities(false);
    };

    const calculateSavings = (tier: typeof tiers[0]) => {
        if (!tier) return 0;
        return tier.market_price - tier.bulk_price;
    };

    // Fixed: Calculate price per THOUSAND, not per unit
    const pricePerThousand = selectedTier ? (selectedTier.bulk_price / (selectedTier.quantity / 1000)).toFixed(2) : '0.00';
    const totalSavings = selectedTier ? calculateSavings(selectedTier) : 0;

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cuántas unidades necesitas?</h2>
                <p className="text-gray-600">Selecciona la cantidad que mejor se ajuste a tus necesidades</p>
            </div>

            {/* Grid of Quantity Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Fixed 3 Cards */}
                {fixedTiers.map((tier) => {
                    const isSelected = selectedQuantity === tier.quantity;
                    const savings = calculateSavings(tier);

                    return (
                        <div
                            key={tier.quantity}
                            onClick={() => handleQuantitySelect(tier.quantity)}
                            className={`
                relative cursor-pointer border-2 rounded-xl p-6 transition-all duration-200
                ${isSelected
                                    ? 'border-[#742384] bg-purple-50 shadow-lg transform scale-105'
                                    : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                                }
              `}
                        >
                            {/* Savings Badge */}
                            {isSelected && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#742384] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                                    AHORRAS S/ {savings.toFixed(2)}
                                </div>
                            )}

                            <div className="text-center space-y-3">
                                <p className={`font-bold text-xl ${isSelected ? 'text-[#742384]' : 'text-gray-700'}`}>
                                    {(tier.quantity / 1000).toFixed(0)} {tier.quantity === 1000 ? 'Millar' : 'Millares'}
                                </p>

                                {/* Price Display */}
                                <div className="space-y-1">
                                    <p className="text-xs text-red-400 line-through">
                                        S/ {tier.market_price.toFixed(2)}
                                    </p>
                                    <p className="text-2xl font-black text-gray-900">
                                        S/ {tier.bulk_price.toFixed(2)}
                                    </p>
                                </div>

                                <p className="text-xs text-gray-500">{tier.quantity.toLocaleString()} unidades</p>
                            </div>
                        </div>
                    );
                })}

                {/* 4th Card - "Más Cantidades" */}
                <div
                    className={`
            relative border-2 rounded-xl p-4 overflow-hidden transition-all duration-200
            ${customQuantity
                            ? 'border-[#742384] bg-purple-50 shadow-lg'
                            : 'border-dashed border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                        }
          `}
                >
                    {!showMoreQuantities ? (
                        <button
                            onClick={() => setShowMoreQuantities(true)}
                            className="w-full h-full flex flex-col items-center justify-center space-y-3 cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <ChevronDown className="text-[#742384]" size={24} />
                            </div>
                            <p className="font-bold text-lg text-[#742384]">Más Cantidades</p>
                            <p className="text-xs text-gray-500">4 a 10 Millares</p>
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-sm text-gray-700">Selecciona cantidad</p>
                                <button
                                    onClick={() => setShowMoreQuantities(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <select
                                value={customQuantity || ''}
                                onChange={(e) => handleCustomQuantitySelect(Number(e.target.value))}
                                className="w-full border-2 border-[#742384] rounded-lg p-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="" disabled>Elige...</option>
                                {moreTiers.map((tier) => (
                                    <option key={tier.quantity} value={tier.quantity}>
                                        {(tier.quantity / 1000).toFixed(0)} Millares - S/ {tier.bulk_price.toFixed(2)}
                                    </option>
                                ))}
                            </select>

                            {customQuantity && (
                                <div className="w-full text-center pt-3 mt-2 border-t border-purple-200 px-2">
                                    <p className="text-xs text-red-400 line-through mb-1">
                                        S/ {tiers.find(t => t.quantity === customQuantity)?.market_price.toFixed(2)}
                                    </p>
                                    <p className="text-lg font-black text-[#742384]">
                                        S/ {tiers.find(t => t.quantity === customQuantity)?.bulk_price.toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Teaser Banner - Curiosity Building */}
            <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-[#742384]/20 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-700">
                    💡 <span className="font-semibold">Tip WankaPrint:</span> Desbloquea un Bono Adicional eligiendo la opción de <span className="font-bold text-[#742384]">Pago Total</span> en el último paso
                </p>
            </div>

            {/* Feedback Display */}
            {selectedTier && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-center gap-6 flex-wrap">
                        <div>
                            <p className="text-sm text-gray-600">🔥 Cada millar te está costando:</p>
                            <p className="text-2xl font-bold text-[#742384]">S/ {pricePerThousand}</p>
                        </div>
                        <div className="h-12 w-px bg-purple-200"></div>
                        <div>
                            <p className="text-sm text-gray-600">¡Estás ahorrando!</p>
                            <p className="text-2xl font-bold text-green-600">S/ {totalSavings.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={nextStep}
                    disabled={!selectedQuantity}
                    className="bg-[#742384] hover:bg-[#5a1b66] disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2 disabled:cursor-not-allowed"
                >
                    Continuar
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

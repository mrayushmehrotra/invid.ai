"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useCustomer, CheckoutDialog } from "autumn-js/react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Loader2, Sparkles, Star, X, Zap } from "lucide-react";
import toast from "react-hot-toast";

// Define your pricing plans
const PLANS = [
    {
        id: "free",
        name: "Free",
        description: "Perfect for getting started",
        price: 0,
        interval: "month",
        features: [
            "3 metadata generations/day",
            "1 TTS generation/day",
            "1 video upload/day",
            "5 videos stored",
            "Basic support",
        ],
        highlighted: false,
        icon: Zap,
        color: "gray",
    },
    {
        id: "pro",
        name: "Pro",
        description: "For serious content creators",
        price: 19,
        interval: "month",
        features: [
            "50 metadata generations/day",
            "25 TTS generations/day",
            "10 video uploads/day",
            "100 videos stored",
            "Priority support",
            "Advanced analytics",
        ],
        highlighted: true,
        icon: Crown,
        color: "purple",
        popular: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "For teams and agencies",
        price: 99,
        interval: "month",
        features: [
            "Unlimited generations",
            "Unlimited TTS",
            "Unlimited uploads",
            "Unlimited storage",
            "24/7 dedicated support",
            "API access",
        ],
        highlighted: false,
        icon: Star,
        color: "orange",
    },
];

// Context for the pricing dialog
interface PricingDialogContextType {
    isOpen: boolean;
    openPricingDialog: () => void;
    closePricingDialog: () => void;
}

const PricingDialogContext = createContext<PricingDialogContextType | null>(null);

// Hook to use the pricing dialog
export function usePricingDialog() {
    const context = useContext(PricingDialogContext);
    if (!context) {
        throw new Error("usePricingDialog must be used within a PricingDialogProvider");
    }
    return context;
}

// The actual dialog component
function PricingDialogContent({ onClose }: { onClose: () => void }) {
    const { customer, checkout, isLoading } = useCustomer();
    const [checkingOut, setCheckingOut] = useState<string | null>(null);

    const currentPlan = customer?.products?.[0]?.id || "free";

    const handleSelectPlan = async (planId: string) => {
        if (planId === currentPlan) {
            toast.error("You're already on this plan!");
            return;
        }

        if (planId === "free") {
            toast.error("Contact support to downgrade to Free plan");
            return;
        }

        setCheckingOut(planId);
        try {
            await checkout({
                productId: planId,
                dialog: CheckoutDialog,
            });
            toast.success("Welcome to your new plan! 🎉");
            onClose();
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast.error(error.message || "Failed to process checkout");
        } finally {
            setCheckingOut(null);
        }
    };

    const getButtonText = (planId: string) => {
        if (checkingOut === planId) return "Processing...";
        if (planId === currentPlan) return "Current Plan";
        if (planId === "free") return "Contact Support";
        return "Select Plan";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Dialog Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl 
                   bg-gradient-to-br from-gray-900 via-gray-950 to-black
                   border border-white/10 shadow-2xl"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 
                     text-gray-400 hover:text-white transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center pt-8 pb-6 px-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300">Upgrade Your Plan</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                            Unlock More Power
                        </span>
                    </h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                        Choose the plan that fits your needs. Upgrade anytime.
                    </p>

                    {customer && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-green-300">
                                Current: <strong className="capitalize">{currentPlan}</strong>
                            </span>
                        </div>
                    )}
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pb-8">
                    {PLANS.map((plan) => {
                        const Icon = plan.icon;
                        const isCurrentPlan = plan.id === currentPlan;

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl p-5 transition-all duration-300
                  ${plan.highlighted
                                        ? "bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-orange-500/10 border-2 border-purple-500/50"
                                        : "bg-white/5 border border-white/10 hover:border-white/20"
                                    }
                  ${isCurrentPlan ? "ring-2 ring-green-500/50" : ""}
                `}
                            >
                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="mb-4 mt-2">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3
                    ${plan.color === "purple" ? "bg-purple-500/20" :
                                            plan.color === "orange" ? "bg-orange-500/20" : "bg-gray-500/20"
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 
                      ${plan.color === "purple" ? "text-purple-400" :
                                                plan.color === "orange" ? "text-orange-400" : "text-gray-400"
                                            }`}
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <p className="text-gray-400 text-xs mt-1">{plan.description}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                                        <span className="text-gray-400 text-sm">/{plan.interval}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-2 mb-5">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0
                        ${plan.color === "purple" ? "text-purple-400" :
                                                    plan.color === "orange" ? "text-orange-400" : "text-gray-400"
                                                }`}
                                            />
                                            <span className="text-gray-300 text-xs">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={isCurrentPlan || isLoading || checkingOut === plan.id}
                                    className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-300
                    flex items-center justify-center gap-2
                    ${isCurrentPlan
                                            ? "bg-green-500/20 text-green-300 border border-green-500/30 cursor-default"
                                            : plan.highlighted
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                                                : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                        }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                                >
                                    {checkingOut === plan.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isCurrentPlan ? (
                                        <Check className="w-4 h-4" />
                                    ) : null}
                                    {getButtonText(plan.id)}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center pb-6 px-6">
                    <p className="text-gray-500 text-xs">
                        Secure payments via Stripe • Cancel anytime • 7-day money-back guarantee
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Provider component
export function PricingDialogProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openPricingDialog = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closePricingDialog = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <PricingDialogContext.Provider value={{ isOpen, openPricingDialog, closePricingDialog }}>
            {children}
            <AnimatePresence>
                {isOpen && <PricingDialogContent onClose={closePricingDialog} />}
            </AnimatePresence>
        </PricingDialogContext.Provider>
    );
}

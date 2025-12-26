"use client";

import { usePricingDialog } from "@/components/pricing-dialog";
import { useEffect } from "react";

// This page just opens the pricing dialog and redirects to dashboard
export default function PricingPage() {
    const { openPricingDialog } = usePricingDialog();

    useEffect(() => {
        // Open the dialog on mount
        openPricingDialog();
    }, [openPricingDialog]);

    // Redirect to dashboard in case dialog is closed
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading pricing...</p>
            </div>
        </div>
    );
}

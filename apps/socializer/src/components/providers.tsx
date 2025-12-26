"use client";

import { AutumnProvider } from "autumn-js/react";
import { RecoilRoot } from "recoil";
import { ReactNode } from "react";
import { PricingDialogProvider } from "./pricing-dialog";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <RecoilRoot>
            <AutumnProvider>
                <PricingDialogProvider>
                    {children}
                </PricingDialogProvider>
            </AutumnProvider>
        </RecoilRoot>
    );
}

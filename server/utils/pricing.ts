export type ServiceType =
    | "Mobile Diagnostics"
    | "Pre-Purchase Inspection"
    | "General Service"
    | "Brake Service"
    | "Engine Diagnostics"
    | "Oil Change"
    | "Battery Replacement"
    | "Other Repairs"
    | string;

export interface PricingResult {
    amountCents: number;
    currency: string;
    description: string;
    isDeposit: boolean;
}

export function computeBookingPrice(serviceType: ServiceType): PricingResult {
    // Normalize string for comparison
    const type = serviceType;

    if (type === "Mobile Diagnostics" || type === "Engine Diagnostics") {
        return {
            amountCents: 14000, // $140.00
            currency: "nzd",
            description: "Mobile Diagnostics Fee",
            isDeposit: false, // Full payment
        };
    }

    if (type === "Pre-Purchase Inspection") {
        return {
            amountCents: 15000, // $150.00
            currency: "nzd",
            description: "Pre-Purchase Inspection Deposit",
            isDeposit: true,
        };
    }

    if (type === "General Service") {
        return {
            amountCents: 20000, // $200.00 (Example base price)
            currency: "nzd",
            description: "General Service Deposit",
            isDeposit: true,
        };
    }

    // Default fallback for other services
    return {
        amountCents: 8500, // $85.00 Callout/Deposit
        currency: "nzd",
        description: "Service Callout & Deposit",
        isDeposit: true,
    };
}

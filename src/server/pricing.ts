import { z } from "zod";

export const ServiceType = z.enum(["DIAGNOSTICS", "PPI"]);
export type ServiceType = z.infer<typeof ServiceType>;

const PaymentPolicy = z.enum(["REQUIRED", "DEPOSIT", "PAY_LATER"]);
export type PaymentPolicy = z.infer<typeof PaymentPolicy>;

function isAfterHoursAuckland(scheduledStartLocal: string) {
  // scheduledStartLocal expected format: YYYY-MM-DDTHH:mm
  const d = new Date(scheduledStartLocal);
  const day = d.getDay();
  const hour = d.getHours();

  const isWeekend = day === 0 || day === 6;
  if (isWeekend) return true;

  // Mon-Fri, outside 08:00-18:00 is after-hours
  return hour < 8 || hour >= 18;
}

export function computePricing(input: { serviceType: ServiceType; scheduledStartLocal: string }) {
  const diagnosticFeeCents = 12000;
  const calloutFeeCents = 7500;
  const ppiDepositCents = 15000;

  // Per your instruction: after-hours surcharge applies to labour, not flat fees.
  // At bootstrap we record it but do not add to Stripe line items.
  const afterHours = isAfterHoursAuckland(input.scheduledStartLocal);
  const labourSurchargeRate = afterHours ? 0.25 : 0;

  const paymentExpiryMinutes = 60;

  if (input.serviceType === "DIAGNOSTICS") {
    const stripeLineItems = [
      {
        quantity: 1,
        price_data: {
          currency: "nzd",
          unit_amount: diagnosticFeeCents,
          product_data: {
            name: "Diagnostic Scan & Fault Report (Flat Rate)",
          },
        },
      },
      {
        quantity: 1,
        price_data: {
          currency: "nzd",
          unit_amount: calloutFeeCents,
          product_data: {
            name: "Call-out fee",
          },
        },
      },
    ];

    return {
      paymentPolicy: "REQUIRED" as const,
      paymentExpiryMinutes,
      pricingJson: {
        currency: "NZD",
        diagnosticFlatFeeCents: diagnosticFeeCents,
        calloutFlatFeeCents: calloutFeeCents,
        afterHours,
        labourSurchargeRate,
        stripeLineItems,
      },
    };
  }

  // PPI default: deposit required
  const stripeLineItems = [
    {
      quantity: 1,
      price_data: {
        currency: "nzd",
        unit_amount: ppiDepositCents,
        product_data: {
          name: "Pre-Purchase Inspection (Deposit)",
        },
      },
    },
  ];

  return {
    paymentPolicy: "DEPOSIT" as const,
    paymentExpiryMinutes,
    pricingJson: {
      currency: "NZD",
      ppiDepositCents,
      afterHours,
      labourSurchargeRate,
      stripeLineItems,
    },
  };
}

import { z } from "zod";

export const ServiceType = z.enum(["DIAGNOSTICS", "PPI"]);
export type ServiceType = z.infer<typeof ServiceType>;

const PaymentPolicy = z.enum(["REQUIRED", "DEPOSIT", "PAY_LATER"]);
export type PaymentPolicy = z.infer<typeof PaymentPolicy>;

function isAfterHoursAuckland(scheduledStartLocal: string) {
  // scheduledStartLocal expected format: YYYY-MM-DDTHH:mm (Pacific/Auckland local wall time)
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})$/.exec(scheduledStartLocal);
  if (!m) return false;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const dayOfMonth = Number(m[3]);
  const hour = Number(m[4]);

  // Day-of-week depends on the calendar date, not the timezone.
  const day = new Date(Date.UTC(year, month - 1, dayOfMonth)).getUTCDay();

  const isWeekend = day === 0 || day === 6;
  if (isWeekend) return true;

  // Mon-Fri, outside 08:00-18:00 is after-hours
  return hour < 8 || hour >= 18;
}

export function computePricing(input: { serviceType: ServiceType; scheduledStartLocal: string }) {
  const diagnosticsTotalCents = 14000;
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
          unit_amount: diagnosticsTotalCents,
          product_data: {
            name: "Mobile Diagnostics",
          },
        },
      },
    ];

    return {
      paymentPolicy: "REQUIRED" as const,
      paymentExpiryMinutes,
      pricingJson: {
        currency: "NZD",
        diagnosticsTotalCents,
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

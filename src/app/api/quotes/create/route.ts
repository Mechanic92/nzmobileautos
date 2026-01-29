import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { sendQuoteCreatedBusinessEmail } from "@/server/email";

export const runtime = "nodejs";

const QuoteCategory = z.enum(["BRAKES", "WOF_REPAIRS", "SERVICING", "OTHER"]);
const QuoteUrgency = z.enum(["TODAY", "THIS_WEEK", "FLEXIBLE"]);

const QuoteCreateSchema = z.object({
  category: QuoteCategory,
  urgency: QuoteUrgency,
  address: z.string().min(5),
  vehiclePlate: z.string().min(2),
  vehicleMake: z.string().optional().nullable(),
  vehicleModel: z.string().optional().nullable(),
  vehicleYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  description: z.string().min(10),
  symptoms: z.array(z.string()).default([]),
  customerName: z.string().min(2),
  customerEmail: z.string().email().nullable().optional(),
  customerPhone: z.string().min(6),
});

export async function POST(req: Request) {
  const json = await req.json();
  const input = QuoteCreateSchema.parse(json);

  // Pricing snapshot for quotes (Phase 1): store current default rule set.
  // In Phase 2 this becomes admin-configurable and snapshotted per request.
  const pricingSnapshotJson = {
    currency: "NZD",
    calloutFeeCents: 7500,
    labourRateCentsPerHour: 11000,
    diagnosticLabourRateCentsPerHour: 12000,
    afterHoursLabourSurchargeRate: 0.25,
    shopSuppliesRate: 0.03,
    shopSuppliesCapCents: 2500,
    diagnosticsTotalCents: 14000,
    diagnosticCreditThresholdCents: 50000,
    diagnosticCreditCents: 14000,
    partsMarkupTiers: [
      { fromCents: 0, toCents: 1000, markupMin: 0.75, markupMax: 1.0 },
      { fromCents: 1000, toCents: 10000, markupMin: 0.45, markupMax: 0.6 },
      { fromCents: 10000, toCents: 50000, markupMin: 0.3, markupMax: 0.4 },
      { fromCents: 50000, toCents: null, markupMin: 0.2, markupMax: 0.25 },
    ],
    notes: "Quote requests are assessed before final pricing. This snapshot preserves rules at time of request.",
  };

  // Minimal address parsing (Phase 1). Expect: "street, suburb, city".
  const parts = input.address.split(",").map((p) => p.trim()).filter(Boolean);
  const line1 = parts[0] || input.address;
  const suburb = parts[1] || "West Auckland";
  const city = parts[2] || "Auckland";

  const created = await db().createQuoteRequest({
    category: input.category,
    urgency: input.urgency,
    customer: {
      fullName: input.customerName,
      email: input.customerEmail ?? null,
      phone: input.customerPhone,
    },
    address: {
      line1,
      suburb,
      city,
      postcode: null,
      lat: null,
      lng: null,
      travelBand: null,
    },
    vehicle: {
      plate: input.vehiclePlate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      make: input.vehicleMake || null,
      model: input.vehicleModel || null,
      year: input.vehicleYear ?? null,
      fuel: null,
      odometer: null,
    },
    symptoms: input.symptoms,
    description: input.description,
    pricingSnapshotJson,
  });

  const businessEmail = (process.env.BUSINESS_EMAIL || "").trim();
  const appUrl = (process.env.APP_URL || "").trim();

  if (businessEmail) {
    const adminUrl = appUrl ? `${appUrl.replace(/\/$/, "")}/admin` : "";

    try {
      await sendQuoteCreatedBusinessEmail({
        toEmail: businessEmail,
        quotePublicId: created.publicId,
        category: input.category,
        urgency: input.urgency,
        addressOneLine: `${line1}, ${suburb}, ${city}`,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail ?? null,
        vehiclePlate: input.vehiclePlate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
        vehicleMake: input.vehicleMake || null,
        vehicleModel: input.vehicleModel || null,
        vehicleYear: input.vehicleYear ?? null,
        description: input.description,
        symptoms: input.symptoms,
        adminUrl,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("sendQuoteCreatedBusinessEmail failed", err);
    }
  }

  return NextResponse.json({ publicId: created.publicId });
}

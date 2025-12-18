import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSessionForBooking } from "@/server/stripe";
import { computePricing } from "@/server/pricing";
import { sendBookingCreatedPaymentRequiredEmail } from "@/server/email";
import { db } from "@/server/db";

const ServiceType = z.enum(["DIAGNOSTICS", "PPI"]);

const BookingCreateSchema = z.object({
  serviceType: ServiceType,
  scheduledStartLocal: z.string().min(1),
  address: z.string().min(5),
  vehiclePlate: z.string().min(2),
  vehicleMake: z.string().optional().nullable(),
  vehicleModel: z.string().optional().nullable(),
  vehicleYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  vehicleFuel: z.string().optional().nullable(),
  odometer: z.string().optional().nullable(),
  symptoms: z.string().min(3),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
});

export async function POST(req: Request) {
  const json = await req.json();
  const input = BookingCreateSchema.parse(json);

  if (input.serviceType !== "DIAGNOSTICS") {
    return new NextResponse("Only DIAGNOSTICS booking is enabled in v1", { status: 400 });
  }

  // Convert local datetime to an ISO string without timezone ambiguity.
  // Client sends YYYY-MM-DDTHH:mm; we treat it as Pacific/Auckland local.
  // For correctness we store it as UTC by converting using Intl.
  // (We avoid bringing heavy tz libs at bootstrap; we can swap to date-fns-tz later.)
  const slotStart = new Date(input.scheduledStartLocal);
  // Default slot length for diagnostics booking. This becomes configurable in Phase 2.
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

  const pricing = computePricing({
    serviceType: input.serviceType,
    scheduledStartLocal: input.scheduledStartLocal,
  });

  const paymentExpiresAt = new Date(Date.now() + pricing.paymentExpiryMinutes * 60_000);

  // Minimal address parsing (Phase 1). Expect: "street, suburb, city".
  const parts = input.address.split(",").map((p) => p.trim()).filter(Boolean);
  const line1 = parts[0] || input.address;
  const suburb = parts[1] || "West Auckland";
  const city = parts[2] || "Auckland";

  const booking = await db().createDiagnosticsBooking({
    customer: {
      fullName: input.customerName,
      email: input.customerEmail,
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
      fuel: input.vehicleFuel || null,
      odometer: input.odometer || null,
    },
    slotStart,
    slotEnd,
    afterHours: Boolean(pricing.pricingJson?.afterHours),
    symptomPreset: null,
    notes: input.symptoms,
    pricingSnapshotJson: pricing.pricingJson,
    paymentExpiresAt,
  });

  const session = await createCheckoutSessionForBooking({ booking, customerEmail: input.customerEmail });

  await db().updateBookingStripeSession({ id: booking.id }, { stripeSessionId: session.id });

  await sendBookingCreatedPaymentRequiredEmail({
    bookingId: booking.id,
    toEmail: input.customerEmail,
    checkoutUrl: session.url!,
  });

  return NextResponse.json({ checkoutUrl: session.url });
}

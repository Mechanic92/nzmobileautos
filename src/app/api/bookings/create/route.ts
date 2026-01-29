import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSessionForBooking } from "@/server/stripe";
import { computePricing } from "@/server/pricing";
import { sendBookingCreatedPaymentRequiredEmail } from "@/server/email";
import { assertDbHealthyOrThrow, DbUnavailableError, db, dbHealthCheck } from "@/server/db";

export const runtime = "nodejs";

const ServiceType = z.enum(["DIAGNOSTICS", "PPI"]);

const BookingCreateSchema = z.object({
  serviceType: ServiceType,
  scheduledStartLocal: z.string().min(1),
  address: z.string().min(5),
  vehiclePlate: z.string().min(2),
  vehicleMake: z.string().optional().nullable(),
  vehicleModel: z.string().optional().nullable(),
  vehicleYear: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().int().min(1900).max(2100)
  ).optional().nullable(),
  vehicleFuel: z.string().optional().nullable(),
  odometer: z.string().optional().nullable(),
  symptoms: z.string().min(3),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
});

function getTimeZoneOffsetMs(dateUtc: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-NZ", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(dateUtc);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  const y = Number(get("year"));
  const mo = Number(get("month"));
  const d = Number(get("day"));
  const h = Number(get("hour"));
  const mi = Number(get("minute"));
  const s = Number(get("second"));

  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi, s);
  return asIfUtc - dateUtc.getTime();
}

function zonedTimeToUtcAuckland(scheduledStartLocal: string) {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})$/.exec(scheduledStartLocal);
  if (!m) throw new Error("Invalid scheduledStartLocal format");

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);

  // Start with a UTC date assuming the local components are UTC (we will correct with offset)
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, "Pacific/Auckland");
  return new Date(utcGuess.getTime() - offsetMs);
}

function getAucklandLocalParts(dateUtc: Date) {
  const dtf = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(dateUtc);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  const weekday = (get("weekday") || "").toLowerCase();
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return { weekday, hour, minute };
}

function assertWithinBusinessHours(slotStartUtc: Date) {
  const { weekday, hour, minute } = getAucklandLocalParts(slotStartUtc);

  // Only allow Mon–Fri by default. Weekends are by request and must be handled manually/admin-side.
  if (weekday === "sat" || weekday === "sun") {
    throw new Error("Weekends are by request only. Please choose a weekday time or contact us.");
  }

  // Business hours: 09:00–17:00 start times.
  // We allow booking starts only when the full reserved duration (incl buffers) fits within business hours.
  const minutes = hour * 60 + minute;
  const open = 9 * 60;
  const close = 17 * 60;

  const reservedMinutes = Number(process.env.BOOKING_RESERVED_MINUTES || "0") || 0;
  const totalMinutes = reservedMinutes > 0 ? reservedMinutes : 60 + 15 + 15;

  const lastStart = close - totalMinutes;
  if (minutes < open || minutes > lastStart) {
    throw new Error(
      "Bookings are available 9am–5pm Monday to Friday. Please select a time within business hours."
    );
  }
}

function getReservedMinutesForDiagnostics() {
  const duration = Number(process.env.BOOKING_DIAGNOSTICS_DURATION_MINUTES || "60") || 60;
  const travel = Number(process.env.BOOKING_TRAVEL_BUFFER_MINUTES || "15") || 15;
  const admin = Number(process.env.BOOKING_ADMIN_BUFFER_MINUTES || "15") || 15;
  return {
    durationMinutes: duration,
    travelMinutes: travel,
    adminMinutes: admin,
    totalMinutes: duration + travel + admin,
  };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = BookingCreateSchema.parse(json);

    // Production preflight: fail fast with explicit error text (otherwise UI shows generic failure).
    if (!process.env.DATABASE_URL) {
      return new NextResponse("Missing DATABASE_URL (database not configured on Vercel)", { status: 500 });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return new NextResponse("Missing STRIPE_SECRET_KEY (Stripe not configured on Vercel)", { status: 500 });
    }
    if (!process.env.APP_URL) {
      return new NextResponse("Missing APP_URL (set to https://nzmobileauto.vercel.app)", { status: 500 });
    }

    // If DB is unhealthy, do NOT attempt Stripe/payment.
    // Return a safe degraded-mode response that the UI can present without crashing.
    try {
      await assertDbHealthyOrThrow();
    } catch (err: any) {
      if (err instanceof DbUnavailableError) {
        // eslint-disable-next-line no-console
        console.error("/api/bookings/create degraded - db unavailable", {
          message: err.message,
          db: await dbHealthCheck(),
        });
        return NextResponse.json(
          {
            ok: false,
            degraded: true,
            error:
              "Booking system temporarily offline. Please call or text 027 642 1824 to book.",
            fallback: {
              phone: "+64276421824",
              displayPhone: "027 642 1824",
            },
          },
          { status: 503 }
        );
      }
      throw err;
    }

    if (input.serviceType !== "DIAGNOSTICS") {
      return new NextResponse("Only DIAGNOSTICS booking is enabled in v1", { status: 400 });
    }

    // Client sends YYYY-MM-DDTHH:mm; treat it as Pacific/Auckland local wall time.
    // Convert to a UTC Date deterministically (safe across DST changes).
    const slotStart = zonedTimeToUtcAuckland(input.scheduledStartLocal);

    // Diagnostics booking reserves service duration + travel buffer + admin buffer.
    // This ensures your calendar cannot be overbooked and stays realistic for mobile work.
    const reserved = getReservedMinutesForDiagnostics();
    const slotEnd = new Date(slotStart.getTime() + reserved.totalMinutes * 60 * 1000);

    // Enforce business hours & weekdays in NZ local time.
    assertWithinBusinessHours(slotStart);

    // Hard-block overlaps against existing CONFIRMED bookings and unexpired PENDING_PAYMENT bookings.
    // Overlap condition: existing.slotStart < requestedEnd AND existing.slotEnd > requestedStart
    // Use the prisma-backed adapter via db() so DB errors can be handled consistently.
    try {
      const { prisma } = await import("@/server/prisma");
      const conflict = await prisma.booking.findFirst({
        where: {
          OR: [
            { status: "CONFIRMED" },
            {
              status: "PENDING_PAYMENT",
              paymentExpiresAt: { gt: new Date() },
            },
          ],
          slotStart: { lt: slotEnd },
          slotEnd: { gt: slotStart },
        },
        select: { id: true, publicId: true, slotStart: true, slotEnd: true },
      });
      if (conflict) {
        return new NextResponse("That time is already booked. Please choose a different time.", { status: 409 });
      }
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.toLowerCase().includes("can't reach database server") || String(err?.code || "") === "P1001") {
        // eslint-disable-next-line no-console
        console.error("/api/bookings/create degraded - conflict check db error", err);
        return NextResponse.json(
          {
            ok: false,
            degraded: true,
            error:
              "Booking system temporarily offline. Please call or text 027 642 1824 to book.",
            fallback: {
              phone: "+64276421824",
              displayPhone: "027 642 1824",
            },
          },
          { status: 503 }
        );
      }
      throw err;
    }

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

    if (!session?.url) {
      return new NextResponse(
        "Payment session could not be created. Please try again or contact support.",
        { status: 500 }
      );
    }

    await db().updateBookingStripeSession({ id: booking.id }, { stripeSessionId: session.id });

    await sendBookingCreatedPaymentRequiredEmail({
      bookingId: booking.id,
      toEmail: input.customerEmail,
      checkoutUrl: session.url!,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("/api/bookings/create failed", err);

    // Zod validation
    const zodIssues = err?.issues;
    if (Array.isArray(zodIssues) && zodIssues.length > 0) {
      const msg = zodIssues.map((i: any) => `${i.path?.join(".") || "field"}: ${i.message}`).join(", ");
      return new NextResponse(`Invalid request: ${msg}`, { status: 400 });
    }

    const message = typeof err?.message === "string" && err.message.trim() ? err.message.trim() : "Unknown server error";
    return new NextResponse(message, { status: 500 });
  }
}

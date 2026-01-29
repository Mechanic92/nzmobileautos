import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { assertDbHealthyOrThrow, DbUnavailableError, db, dbHealthCheck, isDevNoDb } from "@/server/db";
import { sendBookingConfirmedBusinessEmail, sendStripeOrphanPaymentBusinessEmail } from "@/server/email";
import { prisma } from "@/server/prisma";
import { pushPaidJobToGearbox } from "@/lib/integrations/gearbox";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (isDevNoDb()) {
    return NextResponse.json({ received: true, devNoDb: true });
  }

  // If DB is currently unhealthy, we return 503 so Stripe retries later.
  // This prevents losing events and avoids crashing on transient Neon outages.
  try {
    await assertDbHealthyOrThrow();
  } catch (err: any) {
    if (err instanceof DbUnavailableError) {
      // eslint-disable-next-line no-console
      console.error("/api/stripe/webhook degraded - db unavailable", {
        message: err.message,
        db: await dbHealthCheck(),
      });
      return new NextResponse("Database unavailable, please retry", { status: 503 });
    }
    throw err;
  }

  const sig = (await headers()).get("stripe-signature");
  if (!sig) return new NextResponse("Missing stripe-signature", { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return new NextResponse("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) return new NextResponse("Missing STRIPE_SECRET_KEY", { status: 500 });

  const stripe = new Stripe(stripeSecretKey);

  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook signature verification failed: ${err?.message || ""}`.trim(), { status: 400 });
  }

  // Idempotency: store webhook event, ignore duplicates.
  const idem = await db().createIdempotencyKeyOnce({
    scope: "stripe_webhook",
    key: event.id,
    requestHash: null,
    responseJson: null,
  });
  if (!idem.created) return NextResponse.json({ received: true, duplicate: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    if (session?.payment_status !== "paid") {
      return NextResponse.json({ received: true, ignored: true, reason: "payment_status_not_paid" });
    }

    const bookingId = session?.metadata?.bookingId;
    if (bookingId) {
      await db().updateBookingStatus({ id: bookingId }, { status: "CONFIRMED" });

      // Best-effort: push paid job payload to Gearbox (no Gearbox booking API usage).
      try {
        const full = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { customer: true, address: true, vehicle: true },
        });

        if (full) {
          const pricing = full.pricingSnapshotJson as any;
          const totalAmountCents =
            typeof pricing?.totalIncGstCents === "number" ? pricing.totalIncGstCents : Math.round((pricing?.total || 0) * 100);

          const gearboxResult = await pushPaidJobToGearbox({
            customer: {
              name: full.customer.fullName,
              email: full.customer.email || "",
              phone: full.customer.phone || "",
            },
            vehicle: {
              plate: full.vehicle?.plate || "",
              vin: full.vehicle?.vin || "",
              make: full.vehicle?.make || "",
              model: full.vehicle?.model || "",
              year: full.vehicle?.year || 0,
              snapshot: full.vehicle || {},
            },
            job: {
              id: full.id,
              startTime: full.slotStart,
              endTime: full.slotEnd,
              address: `${full.address.line1}, ${full.address.suburb}, ${full.address.city}`,
              serviceType: full.kind,
              totalAmountCents,
            },
            payment: {
              stripeSessionId: session?.id || "",
              amountCents: session?.amount_total || totalAmountCents,
            },
          });

          if (gearboxResult.success && gearboxResult.jobId) {
            await prisma.booking.update({
              where: { id: bookingId },
              data: { serviceM8JobId: gearboxResult.jobId },
            });
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("pushPaidJobToGearbox failed", err);
      }

      const businessEmail = process.env.BUSINESS_EMAIL;
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      if (businessEmail) {
        const full = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { customer: true, address: true, vehicle: true },
        });

        if (full) {
          const addressOneLine = `${full.address.line1}, ${full.address.suburb}, ${full.address.city}`;
          const vehiclePlate = full.vehicle?.plate || "(not provided)";

          await sendBookingConfirmedBusinessEmail({
            toEmail: businessEmail,
            bookingPublicId: full.publicId,
            scheduledStartIso: full.slotStart.toISOString(),
            addressOneLine,
            customerName: full.customer.fullName,
            customerPhone: full.customer.phone || "(not provided)",
            customerEmail: full.customer.email || null,
            vehiclePlate,
            symptoms: full.notes || full.symptomPreset || "(not provided)",
            adminUrl: `${appUrl}/admin`,
          });
        }
      }
    } else {
      const businessEmail = (process.env.BUSINESS_EMAIL || "").trim();
      if (businessEmail) {
        try {
          await sendStripeOrphanPaymentBusinessEmail({
            toEmail: businessEmail,
            stripeEventId: event.id,
            stripeSessionId: session?.id || null,
            bookingId: null,
            amountTotal: session?.amount_total ?? null,
            currency: session?.currency ?? null,
          });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("sendStripeOrphanPaymentBusinessEmail failed", err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

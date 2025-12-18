import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db, isDevNoDb } from "@/server/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (isDevNoDb()) {
    return NextResponse.json({ received: true, devNoDb: true });
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
    const bookingId = session?.metadata?.bookingId;
    if (bookingId) {
      await db().updateBookingStatus({ id: bookingId }, { status: "CONFIRMED" });
      // TODO: send confirmation email (added in next step)
    }
  }

  return NextResponse.json({ received: true });
}

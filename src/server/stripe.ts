import Stripe from "stripe";
import type { BookingRecord } from "@/server/db";
import { isDevNoDb } from "@/server/db";

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) return null;
  return new Stripe(stripeSecretKey);
}

export async function createCheckoutSessionForBooking(input: { booking: BookingRecord; customerEmail: string }) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const booking = input.booking;

  // DEV bypass: no Stripe required.
  if (isDevNoDb() || !process.env.STRIPE_SECRET_KEY) {
    return {
      id: `dev_session_${booking.id}`,
      url: `${appUrl}/checkout/success?bookingId=${booking.id}`,
    } as any;
  }

  const stripe = getStripeClient();
  if (!stripe) throw new Error("Missing STRIPE_SECRET_KEY");

  const pricing = booking.pricingSnapshotJson as any;
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = pricing?.stripeLineItems || [];
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    throw new Error("Missing Stripe line items in pricingSnapshotJson");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    expires_at: Math.floor(((booking.paymentExpiresAt?.getTime() || Date.now() + 60_000) as number) / 1000),
    success_url: `${appUrl}/checkout/success?bookingId=${booking.id}`,
    cancel_url: `${appUrl}/checkout/cancelled?bookingId=${booking.id}`,
    metadata: {
      bookingId: booking.id,
    },
    line_items: lineItems,
    payment_intent_data: {
      metadata: {
        bookingId: booking.id,
      },
    },
  });

  return session;
}

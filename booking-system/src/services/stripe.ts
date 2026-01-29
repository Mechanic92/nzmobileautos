/**
 * Stripe Payment Integration
 * Checkout sessions with Afterpay support
 */

import Stripe from "stripe";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { PricingBreakdown } from "./pricing.js";

// ============================================
// Stripe Client
// ============================================

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" })
  : null;

// ============================================
// Types
// ============================================

export interface CheckoutSessionRequest {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  pricing: PricingBreakdown;
}

export interface CheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  sessionUrl?: string;
  error?: string;
}

export interface WebhookResult {
  success: boolean;
  event?: string;
  error?: string;
}

// ============================================
// Checkout Session Creation
// ============================================

export async function createCheckoutSession(
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResult> {
  if (!stripe) {
    return {
      success: false,
      error: "Payment system not configured. Please contact support.",
    };
  }

  const { bookingId, customerEmail, customerName, pricing } = request;

  try {
    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: "nzd",
          unit_amount: pricing.basePriceCents,
          product_data: {
            name: pricing.serviceName,
            description: `${pricing.vehicle.year} ${pricing.vehicle.make} ${pricing.vehicle.model} (${pricing.vehicle.plate})`,
          },
        },
      },
    ];

    // Add oil surcharge if applicable
    if (pricing.oilSurchargeCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "nzd",
          unit_amount: pricing.oilSurchargeCents,
          product_data: {
            name: "Additional Oil",
            description: "Extra oil beyond 5L included",
          },
        },
      });
    }

    // Add extras
    for (const extra of pricing.extras) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "nzd",
          unit_amount: extra.priceCents,
          product_data: {
            name: extra.name,
          },
        },
      });
    }

    // Build payment method types
    const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
      "card",
    ];

    // Add Afterpay if enabled and amount is within limits ($1-$2000 NZD)
    if (
      env.STRIPE_AFTERPAY_ENABLED &&
      pricing.totalIncGstCents >= 100 &&
      pricing.totalIncGstCents <= 200000
    ) {
      paymentMethodTypes.push("afterpay_clearpay");
    }

    // Create session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      client_reference_id: bookingId,
      payment_method_types: paymentMethodTypes,
      line_items: lineItems,
      metadata: {
        bookingId,
        plate: pricing.vehicle.plate,
        serviceType: pricing.serviceType,
      },
      success_url: `${env.NEXT_PUBLIC_BASE_URL}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/book/cancel?booking_id=${bookingId}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
      payment_intent_data: {
        description: `${pricing.serviceName} - ${pricing.vehicle.plate}`,
        metadata: {
          bookingId,
          customerName,
        },
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId,
        stripeSessionId: session.id,
        amountIncGst: pricing.totalIncGstCents,
        status: "PENDING",
      },
    });

    return {
      success: true,
      sessionId: session.id,
      sessionUrl: session.url!,
    };
  } catch (error: any) {
    console.error("[Stripe] Failed to create checkout session:", error.message);
    return {
      success: false,
      error: "Failed to create payment session. Please try again.",
    };
  }
}

// ============================================
// Webhook Handling
// ============================================

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe not configured");
  }
  return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<WebhookResult> {
  const eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${eventType}`);
    }

    return { success: true, event: eventType };
  } catch (error: any) {
    console.error(`[Stripe] Webhook handler error for ${eventType}:`, error.message);
    return { success: false, event: eventType, error: error.message };
  }
}

// ============================================
// Webhook Event Handlers
// ============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const bookingId = session.client_reference_id;
  if (!bookingId) {
    console.error("[Stripe] No booking ID in session");
    return;
  }

  // Idempotency check
  const existingPayment = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existingPayment?.status === "PAID") {
    console.log(`[Stripe] Payment already processed for session ${session.id}`);
    return;
  }

  // Update payment record
  await prisma.payment.update({
    where: { stripeSessionId: session.id },
    data: {
      status: "PAID",
      stripePaymentId: session.payment_intent as string,
      paymentMethod: session.payment_method_types?.[0] || "card",
    },
  });

  // Confirm booking
  const { confirmBooking } = await import("./booking.js");
  await confirmBooking(bookingId);

  // Sync to Gearbox
  const { syncBookingToGearbox } = await import("./gearbox.js");
  await syncBookingToGearbox(bookingId);

  // Send confirmation email
  const { sendBookingConfirmation } = await import("./email.js");
  await sendBookingConfirmation(bookingId);

  console.log(`[Stripe] Payment completed for booking ${bookingId}`);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
  const bookingId = session.client_reference_id;
  if (!bookingId) return;

  // Update payment status
  await prisma.payment.update({
    where: { stripeSessionId: session.id },
    data: { status: "FAILED" },
  });

  // Expire booking
  const { expireBooking } = await import("./booking.js");
  await expireBooking(bookingId);

  console.log(`[Stripe] Checkout expired for booking ${bookingId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata?.bookingId;
  if (!bookingId) return;

  // Find and update payment
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
  }

  console.log(`[Stripe] Payment failed for booking ${bookingId}`);
}

async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });

    // Cancel booking
    const { cancelBooking } = await import("./booking.js");
    await cancelBooking(payment.bookingId);

    console.log(`[Stripe] Refund processed for booking ${payment.bookingId}`);
  }
}

// ============================================
// Session Retrieval
// ============================================

export async function getSessionDetails(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null;
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error: any) {
    console.error("[Stripe] Failed to retrieve session:", error.message);
    return null;
  }
}

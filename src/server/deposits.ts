/**
 * Deposit Workflow for Repairs
 * Handles deposit collection, balance tracking, and payment completion
 */

import { prisma } from "./prisma";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" as any })
  : null;

// ============================================
// Configuration
// ============================================

// Deposit percentage for repair jobs
const DEPOSIT_PERCENTAGE = 50; // 50% deposit required

// Minimum deposit amount in cents
const MIN_DEPOSIT_CENTS = 5000; // $50 minimum

// Services that require deposits
const DEPOSIT_REQUIRED_SERVICES = [
  "BRAKE_PADS_FRONT",
  "BRAKE_PADS_REAR",
  "BRAKE_PADS_FULL",
  "BATTERY_REPLACEMENT",
  "WOF_REPAIRS",
  "CUSTOM",
];

// Services that require full payment upfront
const FULL_PAYMENT_SERVICES = [
  "DIAGNOSTIC",
  "PPI",
];

// ============================================
// Types
// ============================================

export type PaymentPolicy = "FULL_UPFRONT" | "DEPOSIT_REQUIRED" | "PAY_ON_COMPLETION";

export interface DepositCalculation {
  policy: PaymentPolicy;
  totalCents: number;
  depositCents: number;
  balanceCents: number;
  depositPercentage: number;
}

export interface PaymentSession {
  sessionId: string;
  sessionUrl: string;
  amountCents: number;
  type: "DEPOSIT" | "FULL" | "BALANCE";
  expiresAt: Date;
}

// ============================================
// Deposit Calculation
// ============================================

/**
 * Determine payment policy for a service
 */
export function getPaymentPolicy(servicePackage: string): PaymentPolicy {
  if (FULL_PAYMENT_SERVICES.includes(servicePackage)) {
    return "FULL_UPFRONT";
  }
  if (DEPOSIT_REQUIRED_SERVICES.includes(servicePackage)) {
    return "DEPOSIT_REQUIRED";
  }
  // Service packages (Bronze/Silver/Gold) - deposit required
  if (servicePackage.includes("SERVICE")) {
    return "DEPOSIT_REQUIRED";
  }
  return "PAY_ON_COMPLETION";
}

/**
 * Calculate deposit amount for a quote
 */
export function calculateDeposit(
  totalCents: number,
  servicePackage: string
): DepositCalculation {
  const policy = getPaymentPolicy(servicePackage);

  if (policy === "FULL_UPFRONT") {
    return {
      policy,
      totalCents,
      depositCents: totalCents,
      balanceCents: 0,
      depositPercentage: 100,
    };
  }

  if (policy === "PAY_ON_COMPLETION") {
    return {
      policy,
      totalCents,
      depositCents: 0,
      balanceCents: totalCents,
      depositPercentage: 0,
    };
  }

  // Calculate deposit
  let depositCents = Math.round(totalCents * (DEPOSIT_PERCENTAGE / 100));
  
  // Ensure minimum deposit
  if (depositCents < MIN_DEPOSIT_CENTS && totalCents >= MIN_DEPOSIT_CENTS) {
    depositCents = MIN_DEPOSIT_CENTS;
  }

  // Don't exceed total
  if (depositCents > totalCents) {
    depositCents = totalCents;
  }

  return {
    policy,
    totalCents,
    depositCents,
    balanceCents: totalCents - depositCents,
    depositPercentage: DEPOSIT_PERCENTAGE,
  };
}

// ============================================
// Stripe Payment Sessions
// ============================================

/**
 * Create a Stripe checkout session for deposit payment
 */
export async function createDepositSession(
  quoteId: string,
  customerEmail: string,
  depositCalc: DepositCalculation,
  metadata: {
    serviceName: string;
    vehicleDescription: string;
  }
): Promise<PaymentSession | null> {
  if (!stripe) {
    console.error("[Deposits] Stripe not configured");
    return null;
  }

  const isDeposit = depositCalc.policy === "DEPOSIT_REQUIRED";
  const amountCents = isDeposit ? depositCalc.depositCents : depositCalc.totalCents;
  const productName = isDeposit
    ? `${metadata.serviceName} (${depositCalc.depositPercentage}% Deposit)`
    : metadata.serviceName;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "nzd",
            unit_amount: amountCents,
            product_data: {
              name: productName,
              description: `${metadata.vehicleDescription} - ${metadata.serviceName}`,
            },
          },
        },
      ],
      metadata: {
        quoteId,
        paymentType: isDeposit ? "DEPOSIT" : "FULL",
        totalCents: depositCalc.totalCents.toString(),
        depositCents: depositCalc.depositCents.toString(),
        balanceCents: depositCalc.balanceCents.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/success?session_id={CHECKOUT_SESSION_ID}&quote=${quoteId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/cancel?quote=${quoteId}`,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url!,
      amountCents,
      type: isDeposit ? "DEPOSIT" : "FULL",
      expiresAt: new Date(session.expires_at * 1000),
    };
  } catch (error: any) {
    console.error("[Deposits] Failed to create Stripe session:", error.message);
    return null;
  }
}

/**
 * Create a Stripe checkout session for balance payment
 */
export async function createBalanceSession(
  bookingId: string,
  customerEmail: string,
  balanceCents: number,
  metadata: {
    serviceName: string;
    vehicleDescription: string;
  }
): Promise<PaymentSession | null> {
  if (!stripe) {
    console.error("[Deposits] Stripe not configured");
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "nzd",
            unit_amount: balanceCents,
            product_data: {
              name: `${metadata.serviceName} (Balance Due)`,
              description: `${metadata.vehicleDescription} - Remaining balance`,
            },
          },
        },
      ],
      metadata: {
        bookingId,
        paymentType: "BALANCE",
        balanceCents: balanceCents.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/complete?session_id={CHECKOUT_SESSION_ID}&booking=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/balance?booking=${bookingId}`,
      expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url!,
      amountCents: balanceCents,
      type: "BALANCE",
      expiresAt: new Date(session.expires_at * 1000),
    };
  } catch (error: any) {
    console.error("[Deposits] Failed to create balance session:", error.message);
    return null;
  }
}

// ============================================
// Payment Status Tracking
// ============================================

export interface PaymentStatus {
  depositPaid: boolean;
  depositPaidAt?: Date;
  depositAmountCents: number;
  balancePaid: boolean;
  balancePaidAt?: Date;
  balanceAmountCents: number;
  totalPaidCents: number;
  totalDueCents: number;
  remainingCents: number;
  fullyPaid: boolean;
}

/**
 * Get payment status for a booking
 * This would query the booking record and associated payments
 */
export async function getPaymentStatus(bookingId: string): Promise<PaymentStatus | null> {
  // In production, this would query the Booking model and associated payment records
  // For now, return a placeholder structure
  
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) return null;

  const pricingSnapshot = booking.pricingSnapshotJson as any;
  const totalDueCents = pricingSnapshot?.totalCents || 0;
  const depositCents = pricingSnapshot?.depositCents || 0;
  const balanceCents = pricingSnapshot?.balanceCents || 0;

  // Check payment status from booking status
  const depositPaid = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(booking.status);
  const balancePaid = booking.status === "COMPLETED";

  const totalPaidCents = (depositPaid ? depositCents : 0) + (balancePaid ? balanceCents : 0);

  return {
    depositPaid,
    depositPaidAt: depositPaid ? booking.updatedAt : undefined,
    depositAmountCents: depositCents,
    balancePaid,
    balancePaidAt: balancePaid ? booking.updatedAt : undefined,
    balanceAmountCents: balanceCents,
    totalPaidCents,
    totalDueCents,
    remainingCents: totalDueCents - totalPaidCents,
    fullyPaid: totalPaidCents >= totalDueCents,
  };
}

// ============================================
// Webhook Handlers
// ============================================

/**
 * Handle successful deposit payment
 */
export async function handleDepositPayment(
  sessionId: string,
  quoteId: string,
  amountCents: number
): Promise<boolean> {
  console.log(`[Deposits] Processing deposit payment for quote ${quoteId}: $${(amountCents / 100).toFixed(2)}`);
  
  // Update quote status to ACCEPTED
  await prisma.instantQuote.update({
    where: { publicId: quoteId },
    data: { status: "ACCEPTED" },
  });

  // In production: Create booking record, send confirmation email, etc.
  
  return true;
}

/**
 * Handle successful balance payment
 */
export async function handleBalancePayment(
  sessionId: string,
  bookingId: string,
  amountCents: number
): Promise<boolean> {
  console.log(`[Deposits] Processing balance payment for booking ${bookingId}: $${(amountCents / 100).toFixed(2)}`);
  
  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  });

  // In production: Send receipt, update accounting, etc.
  
  return true;
}

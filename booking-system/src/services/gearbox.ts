/**
 * Gearbox SaaS Integration
 * Server-to-server booking ingestion
 */

import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import type { PricingBreakdown } from "./pricing.js";

// ============================================
// Types
// ============================================

interface GearboxCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
}

interface GearboxVehicle {
  plate: string;
  make: string;
  model: string;
  year: number;
  fuel: string;
  cc: number;
  vin?: string;
}

interface GearboxBooking {
  externalId: string;
  startTime: string; // ISO 8601
  endTime: string;
  serviceType: string;
  serviceName: string;
}

interface GearboxPayment {
  amountCents: number;
  currency: string;
  method: string;
  stripeSessionId: string;
  paidAt: string;
}

interface GearboxPayload {
  customer: GearboxCustomer;
  vehicle: GearboxVehicle;
  booking: GearboxBooking;
  pricing: PricingBreakdown;
  payment: GearboxPayment;
  source: string;
  createdAt: string;
}

interface GearboxResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

// ============================================
// Retry Configuration
// ============================================

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

function getBackoffDelay(attempt: number): number {
  return INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// API Call
// ============================================

async function callGearboxApi(payload: GearboxPayload): Promise<GearboxResponse> {
  const response = await fetch(env.GEARBOX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GEARBOX_API_KEY}`,
      "X-Source": "mobileautoworks-booking",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gearbox API error ${response.status}: ${errorText}`);
  }

  return (await response.json()) as GearboxResponse;
}

// ============================================
// Sync Function
// ============================================

export async function syncBookingToGearbox(bookingId: string): Promise<boolean> {
  // Fetch booking with related data
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      quote: true,
      payments: {
        where: { status: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!booking) {
    console.error(`[Gearbox] Booking not found: ${bookingId}`);
    return false;
  }

  if (booking.gearboxSynced) {
    console.log(`[Gearbox] Booking already synced: ${bookingId}`);
    return true;
  }

  const pricing = booking.quote.pricingBreakdownJson as unknown as PricingBreakdown;
  const vehicle = booking.quote.vehicleSnapshotJson as unknown as {
    plate: string;
    make: string;
    model: string;
    year: number;
    fuel: string;
    cc: number;
    vin?: string;
  };
  const payment = booking.payments[0];

  if (!payment) {
    console.error(`[Gearbox] No paid payment found for booking: ${bookingId}`);
    return false;
  }

  // Build payload
  const payload: GearboxPayload = {
    customer: {
      name: booking.customerName,
      email: booking.customerEmail,
      phone: booking.customerPhone,
      address: booking.address,
      suburb: booking.suburb,
    },
    vehicle: {
      plate: vehicle.plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      fuel: vehicle.fuel,
      cc: vehicle.cc,
      vin: vehicle.vin,
    },
    booking: {
      externalId: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      serviceType: pricing.serviceType,
      serviceName: pricing.serviceName,
    },
    pricing,
    payment: {
      amountCents: payment.amountIncGst,
      currency: "NZD",
      method: payment.paymentMethod || "card",
      stripeSessionId: payment.stripeSessionId,
      paidAt: payment.updatedAt.toISOString(),
    },
    source: "mobileautoworks-booking-website",
    createdAt: new Date().toISOString(),
  };

  // Attempt sync with retries
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Log attempt
      await prisma.gearboxSyncLog.create({
        data: {
          bookingId,
          requestJson: payload as any,
          attempt,
        },
      });

      const response = await callGearboxApi(payload);

      if (response.success) {
        // Update booking
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            gearboxSynced: true,
            gearboxId: response.jobId,
          },
        });

        // Update sync log
        await prisma.gearboxSyncLog.updateMany({
          where: { bookingId, attempt },
          data: {
            responseJson: response as any,
            statusCode: 200,
            success: true,
          },
        });

        console.log(`[Gearbox] Successfully synced booking ${bookingId} → ${response.jobId}`);
        return true;
      }

      throw new Error(response.error || "Unknown Gearbox error");
    } catch (error: any) {
      lastError = error;
      console.error(`[Gearbox] Attempt ${attempt} failed for ${bookingId}:`, error.message);

      // Update sync log with error
      await prisma.gearboxSyncLog.updateMany({
        where: { bookingId, attempt },
        data: {
          errorMsg: error.message,
          success: false,
        },
      });

      if (attempt < MAX_RETRIES) {
        const delay = getBackoffDelay(attempt);
        console.log(`[Gearbox] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  console.error(`[Gearbox] All retries exhausted for booking ${bookingId}`);
  return false;
}

// ============================================
// Manual Retry (Admin)
// ============================================

export async function retrySyncBooking(bookingId: string): Promise<boolean> {
  // Reset sync status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      gearboxSynced: false,
      gearboxId: null,
    },
  });

  return syncBookingToGearbox(bookingId);
}

// ============================================
// Failed Sync Report
// ============================================

export async function getFailedSyncs(): Promise<
  Array<{
    bookingId: string;
    customerEmail: string;
    lastAttempt: Date;
    errorMsg: string;
  }>
> {
  const failedBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      gearboxSynced: false,
    },
    select: {
      id: true,
      customerEmail: true,
      createdAt: true,
    },
  });

  const results = [];

  for (const booking of failedBookings) {
    const lastLog = await prisma.gearboxSyncLog.findFirst({
      where: { bookingId: booking.id },
      orderBy: { createdAt: "desc" },
    });

    results.push({
      bookingId: booking.id,
      customerEmail: booking.customerEmail,
      lastAttempt: lastLog?.createdAt || booking.createdAt,
      errorMsg: lastLog?.errorMsg || "No sync attempted",
    });
  }

  return results;
}

/**
 * Email Service
 * Booking confirmations via Resend
 */

import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { PricingBreakdown } from "./pricing.js";

// ============================================
// Types
// ============================================

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================
// Email Templates
// ============================================

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function generateConfirmationHtml(
  booking: {
    id: string;
    customerName: string;
    startTime: Date;
    endTime: Date;
    address: string;
    suburb: string;
  },
  pricing: PricingBreakdown
): string {
  const nzStart = toZonedTime(booking.startTime, "Pacific/Auckland");
  const dateStr = format(nzStart, "EEEE, d MMMM yyyy");
  const timeStr = format(nzStart, "h:mm a");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1a1a1a; margin-bottom: 5px;">Booking Confirmed ✓</h1>
    <p style="color: #666; margin: 0;">Mobile Autoworks NZ</p>
  </div>

  <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1a1a1a;">Hi ${booking.customerName},</h2>
    <p style="margin: 0; color: #444;">
      Your service booking has been confirmed. We'll see you soon!
    </p>
  </div>

  <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">
      Appointment Details
    </h3>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666; width: 120px;">Date</td>
        <td style="padding: 8px 0; font-weight: 600;">${dateStr}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Time</td>
        <td style="padding: 8px 0; font-weight: 600;">${timeStr}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Location</td>
        <td style="padding: 8px 0;">${booking.address}<br>${booking.suburb}</td>
      </tr>
    </table>
  </div>

  <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">
      Vehicle & Service
    </h3>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666; width: 120px;">Vehicle</td>
        <td style="padding: 8px 0;">${pricing.vehicle.year} ${pricing.vehicle.make} ${pricing.vehicle.model}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Plate</td>
        <td style="padding: 8px 0; font-weight: 600;">${pricing.vehicle.plate}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Service</td>
        <td style="padding: 8px 0;">${pricing.serviceName}</td>
      </tr>
    </table>
  </div>

  <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">
      Payment Summary
    </h3>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">${pricing.serviceName}</td>
        <td style="padding: 8px 0; text-align: right;">${formatPrice(pricing.basePriceCents)}</td>
      </tr>
      ${pricing.oilSurchargeCents > 0 ? `
      <tr>
        <td style="padding: 8px 0; color: #666;">Additional Oil</td>
        <td style="padding: 8px 0; text-align: right;">${formatPrice(pricing.oilSurchargeCents)}</td>
      </tr>
      ` : ""}
      ${pricing.extras.map(extra => `
      <tr>
        <td style="padding: 8px 0; color: #666;">${extra.name}</td>
        <td style="padding: 8px 0; text-align: right;">${formatPrice(extra.priceCents)}</td>
      </tr>
      `).join("")}
      <tr style="border-top: 1px solid #e5e7eb;">
        <td style="padding: 12px 0 8px 0; font-weight: 600;">Total (inc GST)</td>
        <td style="padding: 12px 0 8px 0; text-align: right; font-weight: 600; font-size: 18px;">${formatPrice(pricing.totalIncGstCents)}</td>
      </tr>
    </table>
    
    <div style="background: #dcfce7; border-radius: 8px; padding: 12px; margin-top: 16px; text-align: center;">
      <span style="color: #166534; font-weight: 600;">✓ Payment Received</span>
    </div>
  </div>

  <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <h4 style="margin: 0 0 8px 0; color: #92400e;">Before Your Appointment</h4>
    <ul style="margin: 0; padding-left: 20px; color: #92400e;">
      <li>Please ensure your vehicle is accessible</li>
      <li>Clear any items from around the engine bay</li>
      <li>Have your keys ready</li>
    </ul>
  </div>

  <div style="text-align: center; padding: 24px 0; border-top: 1px solid #e5e7eb;">
    <p style="margin: 0 0 8px 0; color: #666;">Questions? Contact us:</p>
    <p style="margin: 0;">
      <a href="tel:+64276421824" style="color: #2563eb; text-decoration: none; font-weight: 600;">027 642 1824</a>
    </p>
    <p style="margin: 16px 0 0 0; font-size: 12px; color: #999;">
      Booking Reference: ${booking.id}
    </p>
  </div>

</body>
</html>
  `.trim();
}

function generateConfirmationText(
  booking: {
    id: string;
    customerName: string;
    startTime: Date;
    endTime: Date;
    address: string;
    suburb: string;
  },
  pricing: PricingBreakdown
): string {
  const nzStart = toZonedTime(booking.startTime, "Pacific/Auckland");
  const dateStr = format(nzStart, "EEEE, d MMMM yyyy");
  const timeStr = format(nzStart, "h:mm a");

  return `
BOOKING CONFIRMED ✓
Mobile Autoworks NZ

Hi ${booking.customerName},

Your service booking has been confirmed. We'll see you soon!

APPOINTMENT DETAILS
-------------------
Date: ${dateStr}
Time: ${timeStr}
Location: ${booking.address}, ${booking.suburb}

VEHICLE & SERVICE
-----------------
Vehicle: ${pricing.vehicle.year} ${pricing.vehicle.make} ${pricing.vehicle.model}
Plate: ${pricing.vehicle.plate}
Service: ${pricing.serviceName}

PAYMENT SUMMARY
---------------
${pricing.serviceName}: ${formatPrice(pricing.basePriceCents)}
${pricing.oilSurchargeCents > 0 ? `Additional Oil: ${formatPrice(pricing.oilSurchargeCents)}\n` : ""}${pricing.extras.map(e => `${e.name}: ${formatPrice(e.priceCents)}`).join("\n")}
---
Total (inc GST): ${formatPrice(pricing.totalIncGstCents)}

✓ Payment Received

BEFORE YOUR APPOINTMENT
-----------------------
- Please ensure your vehicle is accessible
- Clear any items from around the engine bay
- Have your keys ready

Questions? Call us: 027 642 1824

Booking Reference: ${booking.id}
  `.trim();
}

// ============================================
// Send Functions
// ============================================

export async function sendBookingConfirmation(bookingId: string): Promise<EmailResult> {
  if (!env.RESEND_API_KEY) {
    console.log("[Email] Resend not configured, skipping email");
    return { success: true };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { quote: true },
  });

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  const pricing = booking.quote.pricingBreakdownJson as unknown as PricingBreakdown;

  const html = generateConfirmationHtml(booking, pricing);
  const text = generateConfirmationText(booking, pricing);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: booking.customerEmail,
        subject: `Booking Confirmed - ${format(toZonedTime(booking.startTime, "Pacific/Auckland"), "d MMM")} - Mobile Autoworks`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await response.json();
    console.log(`[Email] Confirmation sent to ${booking.customerEmail}`);
    
    return { success: true, messageId: result.id };
  } catch (error: any) {
    console.error("[Email] Failed to send confirmation:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Booking Notification System for Mobile Autoworks NZ
 * Handles email and SMS notifications for bookings
 */

import { Resend } from 'resend';
import { notifyOwnerViaSMS } from './sms';
import { BUSINESS_INFO, CANCELLATION_POLICY, PREPARATION_INSTRUCTIONS, SERVICES } from './booking-config';
import type { ServiceType } from '../../shared/types/booking';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'chris@mobileautoworksnz.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'bookings@mobileautoworksnz.com';

export interface BookingNotificationData {
  bookingRef: string;
  serviceType: ServiceType;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  vehicleRego: string;
  notes: string;
  preferredDate: string;
  preferredTime: string;
  totalAmountCents: number;
  isWeekendBooking: boolean;
  weekendTimeWindow?: string;
  addOns: string[];
  paidAt: string;
  stripeSessionId: string;
  paymentIntentId?: string;
}

/**
 * Send all notifications for a successful booking payment
 */
export async function sendBookingNotifications(data: BookingNotificationData): Promise<{
  ownerEmailSent: boolean;
  ownerSmsSent: boolean;
  customerEmailSent: boolean;
}> {
  const results = {
    ownerEmailSent: false,
    ownerSmsSent: false,
    customerEmailSent: false,
  };

  // Send owner email notification
  try {
    results.ownerEmailSent = await sendOwnerBookingEmail(data);
  } catch (error) {
    console.error('[Notification] Owner email failed:', error);
  }

  // Send owner SMS notification
  try {
    const smsResult = await notifyOwnerViaSMS({
      bookingRef: data.bookingRef,
      serviceType: SERVICES[data.serviceType]?.name || data.serviceType,
      amountPaid: data.totalAmountCents,
      customerName: data.customerName,
      phone: data.phone,
      address: data.address,
      vehicleRego: data.vehicleRego,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
    });
    results.ownerSmsSent = smsResult.success;
  } catch (error) {
    console.error('[Notification] Owner SMS failed:', error);
  }

  // Send customer confirmation email
  try {
    results.customerEmailSent = await sendCustomerConfirmationEmail(data);
  } catch (error) {
    console.error('[Notification] Customer email failed:', error);
  }

  return results;
}

/**
 * Send booking notification email to business owner
 */
async function sendOwnerBookingEmail(data: BookingNotificationData): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] Resend not configured, logging instead');
    console.log('[Email] Owner notification:', data);
    return false;
  }

  const service = SERVICES[data.serviceType];
  const amountFormatted = `$${(data.totalAmountCents / 100).toFixed(2)} NZD`;
  const paidAtFormatted = new Date(data.paidAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' });

  const subject = `💰 PAID BOOKING: ${data.bookingRef} - ${service?.name || data.serviceType}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header .ref { font-size: 14px; opacity: 0.9; margin-top: 8px; }
    .content { padding: 24px; background: #ffffff; }
    .section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb; }
    .section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .section-title { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .info-row { display: flex; margin-bottom: 8px; }
    .info-label { font-weight: 600; color: #374151; min-width: 120px; }
    .info-value { color: #4b5563; }
    .highlight { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 16px 0; }
    .highlight-amount { font-size: 24px; font-weight: 700; color: #059669; }
    .weekend-notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; }
    .footer { background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 New Paid Booking!</h1>
      <div class="ref">Reference: ${data.bookingRef}</div>
    </div>
    
    <div class="content">
      <div class="highlight">
        <div class="highlight-amount">${amountFormatted}</div>
        <div>Payment confirmed at ${paidAtFormatted}</div>
      </div>

      ${data.isWeekendBooking ? `
      <div class="weekend-notice">
        <strong>⚠️ Weekend Booking - Requires Approval</strong><br>
        Customer requested: ${data.weekendTimeWindow || 'No specific time provided'}<br>
        Please contact customer to confirm exact time.
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Service Details</div>
        <div class="info-row">
          <span class="info-label">Service:</span>
          <span class="info-value">${service?.name || data.serviceType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${data.preferredDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time:</span>
          <span class="info-value">${data.preferredTime}${data.isWeekendBooking ? ' (pending confirmation)' : ''}</span>
        </div>
        ${data.addOns.length > 0 ? `
        <div class="info-row">
          <span class="info-label">Add-ons:</span>
          <span class="info-value">${data.addOns.join(', ')}</span>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${data.customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value"><a href="tel:${data.phone}">${data.phone}</a></span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value"><a href="mailto:${data.email}">${data.email}</a></span>
        </div>
        <div class="info-row">
          <span class="info-label">Address:</span>
          <span class="info-value">${data.address}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Vehicle Details</div>
        <div class="info-row">
          <span class="info-label">Registration:</span>
          <span class="info-value"><strong>${data.vehicleRego}</strong></span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Customer Notes</div>
        <p style="margin: 0; color: #4b5563;">${data.notes || 'No notes provided'}</p>
      </div>

      <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="info-row">
          <span class="info-label">Stripe Session:</span>
          <span class="info-value" style="font-family: monospace; font-size: 12px;">${data.stripeSessionId}</span>
        </div>
        ${data.paymentIntentId ? `
        <div class="info-row">
          <span class="info-label">Payment Intent:</span>
          <span class="info-value" style="font-family: monospace; font-size: 12px;">${data.paymentIntentId}</span>
        </div>
        ` : ''}
      </div>
    </div>

    <div class="footer">
      Mobile Autoworks NZ | ${BUSINESS_INFO.phone} | ${BUSINESS_INFO.email}
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject,
      html,
    });
    console.log(`[Email] Owner notification sent for ${data.bookingRef}`);
    return true;
  } catch (error: any) {
    console.error('[Email] Failed to send owner notification:', error.message);
    return false;
  }
}

/**
 * Send confirmation email to customer
 */
async function sendCustomerConfirmationEmail(data: BookingNotificationData): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] Resend not configured');
    return false;
  }

  const service = SERVICES[data.serviceType];
  const amountFormatted = `$${(data.totalAmountCents / 100).toFixed(2)}`;

  const subject = data.isWeekendBooking
    ? `Booking Request Received - ${data.bookingRef} | Mobile Autoworks NZ`
    : `Booking Confirmed - ${data.bookingRef} | Mobile Autoworks NZ`;

  const preparationList = PREPARATION_INSTRUCTIONS.map(item => `<li>${item}</li>`).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 28px; }
    .header .tagline { font-size: 16px; opacity: 0.9; }
    .booking-ref { background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 16px; border-radius: 8px; margin-top: 16px; font-family: monospace; font-size: 18px; letter-spacing: 1px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; margin-bottom: 24px; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
    .status-confirmed { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .summary-card { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { color: #6b7280; }
    .summary-value { font-weight: 600; color: #1f2937; text-align: right; }
    .amount-paid { font-size: 24px; color: #059669; }
    .section { margin: 32px 0; }
    .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #2563eb; }
    .prep-list { margin: 0; padding-left: 24px; }
    .prep-list li { margin-bottom: 8px; color: #4b5563; }
    .policy-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; font-size: 14px; }
    .policy-box h4 { margin: 0 0 8px 0; color: #991b1b; }
    .contact-box { background: #eff6ff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .contact-box h4 { margin: 0 0 12px 0; color: #1e40af; }
    .contact-phone { font-size: 24px; font-weight: 700; color: #2563eb; }
    .contact-email { color: #4b5563; margin-top: 8px; }
    .footer { background: #1f2937; color: #9ca3af; padding: 24px; text-align: center; font-size: 12px; }
    .footer a { color: #60a5fa; text-decoration: none; }
    .weekend-notice { background: #fef3c7; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .weekend-notice h4 { margin: 0 0 8px 0; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mobile Autoworks NZ</h1>
      <div class="tagline">Professional Mobile Mechanic Services</div>
      <div class="booking-ref">${data.bookingRef}</div>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${data.customerName},
      </div>

      <p>
        ${data.isWeekendBooking 
          ? `Thank you for your booking request! We've received your payment and your <span class="status-badge status-pending">weekend booking is pending confirmation</span>. We'll contact you shortly to confirm the exact time.`
          : `Great news! Your booking is <span class="status-badge status-confirmed">confirmed</span>. We've received your payment and your appointment is secured.`
        }
      </p>

      ${data.isWeekendBooking ? `
      <div class="weekend-notice">
        <h4>⏰ Weekend Booking Notice</h4>
        <p style="margin: 0;">Weekend appointments are by arrangement only. We'll call or text you within 24 hours to confirm the exact time. Your preferred window: <strong>${data.weekendTimeWindow || data.preferredTime}</strong></p>
      </div>
      ` : ''}

      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-label">Service</span>
          <span class="summary-value">${service?.name || data.serviceType}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Date</span>
          <span class="summary-value">${data.preferredDate}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Time</span>
          <span class="summary-value">${data.isWeekendBooking ? 'To be confirmed' : data.preferredTime}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Location</span>
          <span class="summary-value">${data.address}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Vehicle</span>
          <span class="summary-value">${data.vehicleRego}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Amount Paid</span>
          <span class="summary-value amount-paid">${amountFormatted} NZD</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📋 Preparation Checklist</div>
        <p>To ensure a smooth service, please make sure:</p>
        <ul class="prep-list">
          ${preparationList}
        </ul>
      </div>

      <div class="policy-box">
        <h4>Cancellation Policy</h4>
        <p style="margin: 0; white-space: pre-line;">${CANCELLATION_POLICY}</p>
      </div>

      <div class="contact-box">
        <h4>Questions? Need to reschedule?</h4>
        <div class="contact-phone">
          <a href="tel:${BUSINESS_INFO.phone}">${BUSINESS_INFO.phone}</a>
        </div>
        <div class="contact-email">
          <a href="mailto:${BUSINESS_INFO.email}">${BUSINESS_INFO.email}</a>
        </div>
      </div>

      <p style="text-align: center; color: #6b7280;">
        Thank you for choosing Mobile Autoworks NZ!<br>
        We look forward to seeing you.
      </p>
    </div>

    <div class="footer">
      <p>Mobile Autoworks NZ | Auckland, New Zealand</p>
      <p><a href="${BUSINESS_INFO.website}">${BUSINESS_INFO.website}</a></p>
      <p style="margin-top: 16px; font-size: 11px;">
        This email was sent to ${data.email} regarding booking ${data.bookingRef}.<br>
        If you did not make this booking, please contact us immediately.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html,
    });
    console.log(`[Email] Customer confirmation sent for ${data.bookingRef}`);
    return true;
  } catch (error: any) {
    console.error('[Email] Failed to send customer confirmation:', error.message);
    return false;
  }
}

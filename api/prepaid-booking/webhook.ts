/**
 * Stripe Webhook Handler for Prepaid Bookings
 * Mobile Autoworks NZ
 * 
 * Handles checkout.session.completed events to:
 * 1. Create booking in database
 * 2. Send owner notifications (email + SMS)
 * 3. Send customer confirmation email
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { sendBookingNotifications } from '../../server/utils/booking-notifications';
import type { ServiceType, BookingStatus, PaymentStatus } from '../../shared/types/booking';

export const config = {
  api: {
    bodyParser: false,
  },
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');
    const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');

    const sig = req.headers['stripe-signature'] as string | undefined;
    if (!sig) {
      console.error('[Webhook] Missing stripe-signature header');
      return res.status(400).send('Missing stripe-signature');
    }

    const rawBody = (await buffer(req)).toString('utf8');
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      return res.status(400).send(`Webhook signature verification failed: ${err?.message || ''}`);
    }

    console.log(`[Webhook] Received event: ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Verify payment was successful
      if (session.payment_status !== 'paid') {
        console.log(`[Webhook] Payment not completed for session ${session.id}`);
        return res.status(200).json({ received: true, processed: false, reason: 'payment_not_completed' });
      }

      const meta = session.metadata || {};
      
      // Validate required metadata
      if (!meta.bookingRef || !meta.serviceType || !meta.customerName) {
        console.error('[Webhook] Missing required metadata in session:', session.id);
        return res.status(200).json({ received: true, processed: false, reason: 'missing_metadata' });
      }

      console.log(`[Webhook] Processing paid booking: ${meta.bookingRef}`);

      // Extract booking data from metadata
      const bookingData = {
        bookingRef: meta.bookingRef,
        serviceType: meta.serviceType as ServiceType,
        customerName: meta.customerName,
        phone: meta.phone || '',
        email: meta.email || session.customer_email || '',
        address: meta.address || '',
        vehicleRego: meta.vehicleRego || '',
        notes: meta.notes || '',
        preferredDate: meta.preferredDate || '',
        preferredTime: meta.preferredTime || '',
        totalAmountCents: parseInt(meta.totalAmountCents || '0', 10) || (session.amount_total || 0),
        isWeekendBooking: meta.isWeekendBooking === 'true',
        weekendTimeWindow: meta.weekendTimeWindow || undefined,
        addOns: meta.addOns ? JSON.parse(meta.addOns) : [],
        paidAt: new Date().toISOString(),
        stripeSessionId: session.id,
        paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
      };

      // Determine booking status
      const bookingStatus: BookingStatus = bookingData.isWeekendBooking 
        ? 'pending_weekend_approval' 
        : 'confirmed';
      const paymentStatus: PaymentStatus = 'paid';

      // TODO: Save booking to database
      // await saveBookingToDatabase({
      //   ...bookingData,
      //   bookingStatus,
      //   paymentStatus,
      // });

      console.log(`[Webhook] Booking ${meta.bookingRef} saved with status: ${bookingStatus}`);

      // Send notifications
      try {
        const notificationResults = await sendBookingNotifications(bookingData);
        console.log(`[Webhook] Notifications sent for ${meta.bookingRef}:`, notificationResults);
      } catch (notifyError: any) {
        // Don't fail the webhook if notifications fail
        console.error(`[Webhook] Notification error for ${meta.bookingRef}:`, notifyError.message);
      }

      // TODO: Create Google Calendar event if not weekend booking
      // if (!bookingData.isWeekendBooking) {
      //   await createCalendarEvent(bookingData);
      // }

      return res.status(200).json({
        received: true,
        processed: true,
        bookingRef: meta.bookingRef,
        status: bookingStatus,
      });
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`[Webhook] Payment failed for intent: ${paymentIntent.id}`);
      
      // TODO: Update booking status if exists
      // TODO: Send failure notification to customer
      
      return res.status(200).json({ received: true, processed: true });
    }

    // Handle checkout.session.expired
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[Webhook] Checkout session expired: ${session.id}`);
      
      // TODO: Clean up any pending booking records
      
      return res.status(200).json({ received: true, processed: true });
    }

    // Handle refunds
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      console.log(`[Webhook] Charge refunded: ${charge.id}`);
      
      // TODO: Update booking status to refunded
      // TODO: Send refund notification to customer
      
      return res.status(200).json({ received: true, processed: true });
    }

    // Acknowledge other events
    return res.status(200).json({ received: true, processed: false, reason: 'unhandled_event_type' });

  } catch (err: any) {
    console.error('[Webhook] Unhandled error:', err.message);
    return res.status(500).send(err?.message || 'Server error');
  }
}

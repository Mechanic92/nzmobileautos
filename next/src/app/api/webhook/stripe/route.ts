import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/server/prisma';
import { pushToGearbox } from '@/lib/integrations/gearbox';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe Webhook Handler
 * Processes payments and triggers business workflows (Booking confirmation + Gearbox push).
 */
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing stripe-signature or webhook secret');
    }
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // 1. Idempotency Check (Prevent duplicate processing)
    const existingIdem = await prisma.idempotencyKey.findUnique({
      where: {
        scope_key: {
          scope: 'stripe-webhook',
          key: event.id,
        },
      },
    });

    if (existingIdem) {
      return NextResponse.json({ received: true, message: 'Already processed' });
    }

    // 2. Extract Booking ID from Metadata
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      console.error('[Stripe Webhook] No bookingId in metadata');
      return NextResponse.json({ error: 'No bookingId in metadata' }, { status: 400 });
    }

    try {
      // 3. Update Database (Transaction)
      const booking = await prisma.$transaction(async (tx) => {
        const b = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: 'CONFIRMED',
            // Note: In our schema payments are not a separate table but fields in Booking
            // or we use the paymentStatus field in Booking.
            // Looking at the schema, Booking has paymentStatus and stripeSessionId.
          },
          include: {
            customer: true,
            vehicle: true,
            address: true,
          }
        });

        // Record idempotency
        await tx.idempotencyKey.create({
          data: {
            scope: 'stripe-webhook',
            key: event.id,
            requestHash: session.id,
          }
        });

        return b;
      });

      console.log(`[Stripe Webhook] Booking ${bookingId} marked as CONFIRMED`);

      // 4. Push to Gearbox (After successful DB commit)
      const pricing = booking.pricingSnapshotJson as any;
      
      const gearboxResult = await pushToGearbox({
        customer: {
          name: booking.customer.fullName,
          email: booking.customer.email || '',
          phone: booking.customer.phone || '',
        },
        vehicle: {
          plate: booking.vehicle?.plate || '',
          vin: booking.vehicle?.vin || '',
          make: booking.vehicle?.make || '',
          model: booking.vehicle?.model || '',
          year: booking.vehicle?.year || 0,
          snapshot: booking.vehicle || {},
        },
        booking: {
          id: booking.id,
          startTime: booking.slotStart,
          endTime: booking.slotEnd,
          address: `${booking.address.line1}, ${booking.address.suburb}`,
          serviceType: booking.kind,
          totalAmount: pricing?.total || 0,
        },
        payment: {
          stripeSessionId: session.id,
          amount: (session.amount_total || 0) / 100,
        },
      });

      if (!gearboxResult.success) {
        // We logged it inside pushToGearbox, but we don't break the webhook response
        console.error(`[Stripe Webhook] Gearbox ingestion failed for ${bookingId}`);
      } else {
        // Update booking with Gearbox ID
        await prisma.booking.update({
          where: { id: bookingId },
          data: { serviceM8JobId: gearboxResult.jobId } // We use serviceM8JobId as the field for external ingestion
        });
      }

    } catch (dbError: any) {
      console.error(`[Stripe Webhook] DB Error: ${dbError.message}`);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

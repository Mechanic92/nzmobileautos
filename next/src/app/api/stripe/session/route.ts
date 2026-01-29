import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/server/prisma';
import { addMinutes } from 'date-fns';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

const sessionSchema = z.object({
  quoteId: z.string().uuid(),
  startTime: z.string().datetime(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    line1: z.string().min(1),
    suburb: z.string().min(1),
  }),
});

/**
 * Stripe Session Creator
 * Creates a PENDING booking, holds the slot for 15 mins, and returns the Stripe Checkout URL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = sessionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { quoteId, startTime, customer } = result.data;

    // 1. Get Quote & Snapshot
    const quote = await prisma.quoteRequest.findUnique({
      where: { publicId: quoteId }, // Note: Using publicId for security
      include: { vehicle: true }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const start = new Date(startTime);
    // Average duration based on kind (DIAGNOSTICS is 60m, but we can scale)
    const duration = 90; 
    const end = addMinutes(start, duration);

    // 2. Check Overlaps (Slot Hold Logic)
    // Find any CONFIRMED or PENDING_PAYMENT (if not expired) bookings in this range
    const overlapping = await prisma.booking.findFirst({
      where: {
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
        OR: [
          {
            AND: [
              { paymentExpiresAt: { gte: new Date() } }, // Only count pending if not expired
              { slotStart: { lt: end } },
              { slotEnd: { gt: start } }
            ]
          },
          {
            AND: [
              { status: 'CONFIRMED' },
              { slotStart: { lt: end } },
              { slotEnd: { gt: start } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      return NextResponse.json({ error: 'This time slot was just taken. Please pick another.' }, { status: 409 });
    }

    // 3. Create/Sync Customer & Address
    let dbCustomer = await prisma.customer.findFirst({
      where: { email: customer.email }
    });

    if (dbCustomer) {
      dbCustomer = await prisma.customer.update({
        where: { id: dbCustomer.id },
        data: { phone: customer.phone, fullName: customer.name }
      });
    } else {
      dbCustomer = await prisma.customer.create({
        data: { 
          publicId: crypto.randomUUID(),
          fullName: customer.name, 
          email: customer.email, 
          phone: customer.phone 
        }
      });
    }

    const dbAddress = await prisma.address.create({
      data: {
        publicId: Math.random().toString(36).substring(7),
        customerId: dbCustomer.id,
        line1: customer.line1,
        suburb: customer.suburb,
        city: 'Auckland',
      }
    });

    // 4. Create Booking (PENDING_PAYMENT)
    const pricing = quote.pricingSnapshotJson as any;
    const holdExpiresAt = addMinutes(new Date(), 32);

    const booking = await prisma.booking.create({
      data: {
        publicId: Math.random().toString(36).substring(7),
        kind: 'DIAGNOSTICS', // TODO: Extend BookingKind enum for SERVICING
        status: 'PENDING_PAYMENT',
        customerId: dbCustomer.id,
        vehicleId: quote.vehicleId,
        addressId: dbAddress.id,
        slotStart: start,
        slotEnd: end,
        pricingSnapshotJson: pricing,
        paymentExpiresAt: holdExpiresAt,
      }
    });

    // 5. Create Stripe Session
    const origin = req.headers.get('origin');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'afterpay_clearpay'],
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: `Mobile Service: ${quote.category}`,
              description: `For ${quote.vehicle?.year} ${quote.vehicle?.make} ${quote.vehicle?.model}`,
            },
            unit_amount: Math.round(pricing.total * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking/cancel?id=${booking.id}`,
      metadata: {
        bookingId: booking.id,
      },
      expires_at: Math.floor(holdExpiresAt.getTime() / 1000), // Stripe session expires same as hold
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id }
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('[Stripe Session] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

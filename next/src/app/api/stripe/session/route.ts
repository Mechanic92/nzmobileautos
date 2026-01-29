import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/server/prisma';
import { addMinutes } from 'date-fns';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
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

    // 1. Get Quote Snapshot (prefer InstantQuote, fall back to legacy QuoteRequest)
    const instant = await prisma.instantQuote.findUnique({
      where: { publicId: quoteId },
    });

    const legacy = instant
      ? null
      : await prisma.quoteRequest.findUnique({
          where: { publicId: quoteId },
          include: { vehicle: true, customer: true },
        });

    if (!instant && !legacy) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const snapshot: any = instant ? (instant.pricingSnapshotJson as any) : (legacy!.pricingSnapshotJson as any);

    const start = new Date(startTime);
    const duration = typeof snapshot?.durationMinutes === 'number' && snapshot.durationMinutes > 0 ? snapshot.durationMinutes : 60;
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

    // 3b. Create or reuse Vehicle (best-effort, for downstream job automation)
    let vehicleId: string | null = null;
    const snapPlate = String(snapshot?.vehicleIdentity?.plate || legacy?.vehicle?.plate || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const snapVin = String(snapshot?.vehicleIdentity?.vin || legacy?.vehicle?.vin || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (snapPlate || snapVin) {
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          customerId: dbCustomer.id,
          OR: [
            snapPlate ? { plate: snapPlate } : undefined,
            snapVin ? { vin: snapVin } : undefined,
          ].filter(Boolean) as any,
        },
      });

      if (existingVehicle) {
        vehicleId = existingVehicle.id;
      } else {
        const createdVehicle = await prisma.vehicle.create({
          data: {
            publicId: crypto.randomUUID(),
            customerId: dbCustomer.id,
            plate: snapPlate || null,
            vin: snapVin || null,
            make: snapshot?.vehicleIdentity?.make || legacy?.vehicle?.make || null,
            model: snapshot?.vehicleIdentity?.model || legacy?.vehicle?.model || null,
            year: snapshot?.vehicleIdentity?.year || legacy?.vehicle?.year || null,
            fuel: snapshot?.vehicleIdentity?.fuel || legacy?.vehicle?.fuel || null,
          },
        });
        vehicleId = createdVehicle.id;
      }
    }

    // 4. Create Booking (PENDING_PAYMENT)
    const pricing = snapshot;
    const holdExpiresAt = addMinutes(new Date(), 15);

    const booking = await prisma.booking.create({
      data: {
        publicId: Math.random().toString(36).substring(7),
        kind: 'DIAGNOSTICS',
        status: 'PENDING_PAYMENT',
        customerId: dbCustomer.id,
        vehicleId,
        addressId: dbAddress.id,
        slotStart: start,
        slotEnd: end,
        pricingSnapshotJson: pricing,
        paymentExpiresAt: holdExpiresAt,
      }
    });

    // 5. Create Stripe Session
    const origin = req.headers.get('origin');
    const intent = String(snapshot?.intent || legacy?.category || 'SERVICE').toUpperCase();
    const lineAmountCents = typeof snapshot?.totalIncGstCents === 'number' ? snapshot.totalIncGstCents : Math.round((snapshot?.total || 0) * 100);
    const descriptionParts = [
      snapshot?.vehicleIdentity?.year,
      snapshot?.vehicleIdentity?.make,
      snapshot?.vehicleIdentity?.model,
    ].filter(Boolean);

    // Stripe requires expires_at to be at least 30 mins in the future
    const stripeExpiresAt = Math.floor(addMinutes(new Date(), 30).getTime() / 1000);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: `Mobile Autoworks: ${intent}`,
              description: descriptionParts.length ? `For ${descriptionParts.join(' ')}` : undefined,
            },
            unit_amount: lineAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking/cancel?id=${booking.id}`,
      metadata: {
        bookingId: booking.id,
        quoteId,
      },
      expires_at: stripeExpiresAt,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id }
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('[Stripe Session] Error:', error.message);
    console.error('[Stripe Session] Stack:', error.stack);
    console.error('[Stripe Session] Full Error:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

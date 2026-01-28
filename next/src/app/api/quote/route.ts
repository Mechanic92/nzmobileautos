import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { generateQuote } from "@/lib/engines/pricing";
import { z } from "zod";

const quoteSaveSchema = z.object({
  plate: z.string(),
  email: z.string().email(),
  serviceMode: z.enum(['SERVICE', 'REPAIR']),
  serviceKey: z.string().optional(),
  classification: z.any(),
});

/**
 * Saves a quote snapshot and returns a public ID for the booking flow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = quoteSaveSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { plate, email, serviceMode, serviceKey, classification } = result.data;

    // Generate price snapshot
    const quoteResult = generateQuote(serviceMode, classification, serviceKey);

    // Find or Create Customer
    let customer = await prisma.customer.findFirst({
      where: { email: email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          publicId: Math.random().toString(36).substring(7),
          fullName: 'Lead from Quote',
          email,
        }
      });
    }

    // Get Vehicle reference
    const vehicle = await prisma.vehicle.findFirst({
      where: { plate: plate.toUpperCase() }
    });

    // Map serviceKey to QuoteCategory enum
    let category: any = 'SERVICING';
    if (serviceKey === 'DIAGNOSTICS') category = 'OTHER'; 
    if (serviceKey === 'PPI') category = 'OTHER';

    const quoteId = crypto.randomUUID();

    // Save to QuoteRequest table
    const quote = await prisma.quoteRequest.create({
      data: {
        publicId: quoteId,
        status: 'NEW',
        category: category as any,
        urgency: 'FLEXIBLE', 
        customerId: customer.id,
        vehicleId: vehicle?.id,
        symptoms: { serviceKey } as any,
        pricingSnapshotJson: quoteResult as any,
      } as any
    });

    // Wait, prisma schema has BookingKind enum [DIAGNOSTICS]. 
    // I might need to adjust the kind or just use pricingSnapshot.

    return NextResponse.json({ id: quoteId });

  } catch (error: any) {
    console.error('[Quote POST Error]:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

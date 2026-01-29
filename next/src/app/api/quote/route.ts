import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { z } from "zod";
import { AddOnsSchema, ServiceIntentSchema, buildPricingSnapshot } from "@/lib/engines/revenueQuote";

const quoteSaveSchema = z.object({
  vehicleIdentity: z.object({
    make: z.string().optional().default("Unknown"),
    model: z.string().optional().default("Unknown"),
    year: z.coerce.number().int().nonnegative().optional().default(0),
    fuel: z.string().optional().default("Unknown"),
    power_kw: z.coerce.number().int().nonnegative().optional().default(0),
    body_style: z.string().optional().default("Unknown"),
    gvm: z.coerce.number().int().nonnegative().optional().default(0),
    vin: z.string().optional().default(""),
    plate: z.string().optional().default("UNKNOWN"),
  }),
  intent: ServiceIntentSchema,
  addOns: AddOnsSchema.optional(),
});

/**
 * Saves a quote snapshot and returns a public ID for the booking flow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = quoteSaveSchema.safeParse(body);
    
    if (!result.success) {
      console.error('[Quote Validation Error]:', JSON.stringify(result.error.format(), null, 2));
      console.error('[Quote Input]:', JSON.stringify(body, null, 2));
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
    }

    const { vehicleIdentity, intent, addOns } = result.data;

    const snapshot = buildPricingSnapshot({ vehicleIdentity, intent, addOns });
    const publicId = crypto.randomUUID();

    await prisma.instantQuote.create({
      data: {
        publicId,
        status: "NEW",
        pricingSnapshotJson: snapshot as any,
      },
    });

    return NextResponse.json({
      quoteId: publicId,
      pricingSnapshot: snapshot,
      totalIncGst: snapshot.totalIncGstCents,
      disclaimers: snapshot.disclaimers,
    });

  } catch (error: any) {
    console.error('[Quote POST Error]:', error);
    console.error('[Quote POST Stack]:', error.stack);
    return NextResponse.json({ error: 'Internal Error', details: error.message }, { status: 500 });
  }
}

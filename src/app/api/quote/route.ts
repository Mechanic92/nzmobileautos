import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import crypto from "crypto";
import { z } from "zod";
import { AddOnsSchema, ServiceIntentSchema, ServiceTierSchema, buildPricingSnapshot } from "@/lib/engines/revenueQuote";

export const runtime = "nodejs";

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
  tier: ServiceTierSchema.optional(),
  addOns: AddOnsSchema.optional(),
});

/**
 * Saves a quote snapshot and returns a public ID for the booking flow.
 */
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const result = quoteSaveSchema.safeParse(body);
    
    if (!result.success) {
      console.error('[Quote Validation Error]:', JSON.stringify(result.error.format(), null, 2));
      console.error('[Quote Input]:', JSON.stringify(body, null, 2));
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
    }

    const { vehicleIdentity, intent, tier, addOns } = result.data;
    console.log('[Quote API] Building snapshot for:', vehicleIdentity.plate, intent);

    const snapshot = buildPricingSnapshot({ vehicleIdentity, intent, tier, addOns });
    const publicId = crypto.randomUUID();

    console.log('[Quote API] Saving to DB, publicId:', publicId);
    try {
      await prisma.instantQuote.create({
        data: {
          publicId,
          status: "NEW",
          pricingSnapshotJson: snapshot as any,
        },
      });
    } catch (dbErr: any) {
      console.error('[Quote API] Prisma Create Error:', dbErr);
      throw new Error(`Database error: ${dbErr.message}`);
    }

    return NextResponse.json({
      quoteId: publicId,
      pricingSnapshot: snapshot,
      totalIncGst: snapshot.totalIncGstCents,
      disclaimers: snapshot.disclaimers,
    });

  } catch (error: any) {
    console.error('[Quote POST Error]:', error);
    return NextResponse.json({ 
      error: 'Internal Error', 
      details: error.message,
      env_db: !!process.env.DATABASE_URL
    }, { status: 500 });
  }
}

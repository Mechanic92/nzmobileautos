import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { fetchMotorWebIdentity } from '@/lib/integrations/motorweb';
import { createHash } from 'crypto';
import { z } from 'zod';

const lookupSchema = z.object({
  plateOrVin: z.string().min(1).max(40),
  fingerprint: z.string().optional(),
});

function getClientIp(req: NextRequest): string {
  const headerCandidates = [
    'x-nf-client-connection-ip',
    'x-forwarded-for',
    'x-real-ip',
  ];
  for (const header of headerCandidates) {
    const value = req.headers.get(header);
    if (value) return value.split(',')[0].trim();
  }
  return '127.0.0.1';
}

function hashPlate(plate: string): string {
  return createHash('sha256').update(plate.trim().toUpperCase()).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plateOrVin, fingerprint } = lookupSchema.parse(body);
    const plate = plateOrVin.trim().toUpperCase();
    const ip = getClientIp(req);
    const plateHash = hashPlate(plate);

    console.log('[IDENTITY_LOOKUP] Plate:', plate);

    // 1. Try Cache
    try {
      const cached = await prisma.vehicleCache.findUnique({
        where: { plate },
      });

      if (cached && (cached.expiresAt > new Date())) {
        console.log('[IDENTITY_CACHE_HIT]', plate);
        return NextResponse.json({
          vehicleIdentity: cached.identityJson,
          cacheHit: true,
        });
      }
    } catch (dbErr) {
      console.error('[IDENTITY_DB_ERROR] Cache lookup failed:', dbErr);
    }

    // 2. Fetch from MotorWeb
    console.log('[IDENTITY_MOTORWEB_FETCH]', plate);
    const identity = await fetchMotorWebIdentity(plate);

    // 3. Update Cache & Log (Matches Root Schema)
    try {
      await prisma.vehicleCache.upsert({
        where: { plate },
        update: { 
          identityJson: identity as any,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
          lastAccessAt: new Date(),
          lookupCount: { increment: 1 }
        },
        create: { 
          plate, 
          identityJson: identity as any,
          classificationJson: {},
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          lastAccessAt: new Date(),
          lookupCount: 1
        },
      });

      await prisma.lookupLog.create({
        data: {
          plateHash,
          ip,
          fingerprint,
          source: 'WEB_BOOKING',
          status: 'SUCCESS',
          costCents: 0, // We handle billing separately
        },
      });
    } catch (logErr) {
      console.error('[IDENTITY_LOG_ERROR]', logErr);
    }

    return NextResponse.json({
      vehicleIdentity: identity,
      cacheHit: false,
    });

  } catch (err: any) {
    console.error('[IDENTITY_ERROR]', err);
    return NextResponse.json(
      { 
        error: 'Vehicle not found or provider error', 
        details: err.message,
        env_diagnostic: {
          has_db: !!process.env.DATABASE_URL,
          has_motorweb_b64: !!process.env.MOTORWEB_P12_B64,
          has_motorweb_pass: !!process.env.MOTORWEB_P12_PASSPHRASE
        }
      },
      { status: 500 }
    );
  }
}

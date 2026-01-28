import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { fetchMotorWebIdentity } from '@/lib/integrations/motorweb';
import { classifyVehicle } from '@/lib/engines/classification';
import { createHash } from 'crypto';
import { z } from 'zod';

const lookupSchema = z.object({
  plate: z.string().min(1).max(20),
  email: z.string().email(),
  fingerprint: z.string().optional(),
  honeypot: z.string().optional(),
  intent: z.boolean(),
});

/**
 * Identity API
 * Entry point for vehicle lookup. Implements caching, rate-limiting, and cost control.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
  
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 1. Zod Validation
  const result = lookupSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
  }

  const { plate, email, fingerprint, honeypot, intent } = result.data;
  
  // 2. Honeypot Check (Anti-bot)
  if (honeypot) {
    console.warn(`Honeypot hit from IP: ${ip} for email: ${email}`);
    return NextResponse.json({ error: 'Detection triggered' }, { status: 403 });
  }

  // 3. Click Intent check (Must have explicitly clicked the action button)
  if (!intent) {
    return NextResponse.json({ error: 'Explicit intent required' }, { status: 400 });
  }

  const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const plateHash = createHash('sha256').update(normalizedPlate).digest('hex');

  // 4. Rate Limiting (20/day per IP, 10/day per fingerprint)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const ipCount = await prisma.lookupLog.count({
    where: { ip, createdAt: { gte: startOfDay } },
  });

  if (ipCount >= 20) {
    return NextResponse.json({ error: 'Direct lookup limit reached. Please contact support.' }, { status: 429 });
  }

  if (fingerprint) {
    const fpCount = await prisma.lookupLog.count({
      where: { fingerprint, createdAt: { gte: startOfDay } },
    });
    if (fpCount >= 10) {
      return NextResponse.json({ error: 'Device lookup limit reached.' }, { status: 429 });
    }
  }

  try {
    // 5. Cache-First Strategy (90 day TTL)
    const cache = await prisma.vehicleCache.findUnique({
      where: { plate: normalizedPlate },
    });

    if (cache && cache.expiresAt > new Date()) {
      // Update access stats
      await prisma.vehicleCache.update({
        where: { plate: normalizedPlate },
        data: {
          lastAccessAt: new Date(),
          lookupCount: { increment: 1 },
        },
      });

      // Log attempt
      await prisma.lookupLog.create({
        data: { plateHash, ip, fingerprint, email, source: 'CACHE', status: 'SUCCESS' },
      });

      return NextResponse.json({
        identity: cache.identityJson,
        classification: cache.classificationJson,
        source: 'CACHE',
      });
    }

    // 6. MotorWeb Retrieval on Cache Miss
    const identity = await fetchMotorWebIdentity(normalizedPlate);
    const classification = classifyVehicle(identity);

    // 7. Store in Cache
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    await prisma.vehicleCache.upsert({
      where: { plate: normalizedPlate },
      update: {
        identityJson: identity as any,
        classificationJson: classification as any,
        lookupCount: { increment: 1 },
        lastAccessAt: new Date(),
        expiresAt,
      },
      create: {
        plate: normalizedPlate,
        identityJson: identity as any,
        classificationJson: classification as any,
        lookupCount: 1,
        expiresAt,
      },
    });

    // 8. Log success
    await prisma.lookupLog.create({
      data: { plateHash, ip, fingerprint, email, source: 'MOTORWEB', status: 'SUCCESS' },
    });

    return NextResponse.json({
      identity,
      classification,
      source: 'MOTORWEB',
    });

  } catch (error: any) {
    console.error('Identity API Error:', error.message);
    
    // Log failure
    await prisma.lookupLog.create({
      data: { plateHash, ip, fingerprint, email, source: 'MOTORWEB', status: 'FAILURE' },
    });

    return NextResponse.json({ error: 'Vehicle not found or provider unreachable' }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { fetchMotorWebIdentity } from '@/lib/integrations/motorweb';
import { createHash } from 'crypto';
import { z } from 'zod';
import { getRevenueEnginePricingConfig } from '@/lib/config/pricing';

const lookupSchema = z.object({
  plateOrVin: z.string().min(1).max(40),
  fingerprint: z.string().optional(),
  honeypot: z.string().optional(),
});

function getClientIp(req: NextRequest): string {
  const headerCandidates = [
    'x-nf-client-connection-ip',
    'cf-connecting-ip',
    'x-real-ip',
    'x-forwarded-for',
  ];

  for (const h of headerCandidates) {
    const v = req.headers.get(h);
    if (!v) continue;

    if (h === 'x-forwarded-for') {
      const first = v.split(',')[0]?.trim();
      if (first) return first;
      continue;
    }

    return v.trim();
  }

  const anyIp = (req as any).ip;
  if (typeof anyIp === 'string' && anyIp.trim()) return anyIp.trim();

  const ua = req.headers.get('user-agent') || '';
  const al = req.headers.get('accept-language') || '';
  return `derived:${createHash('sha256').update(`${ua}|${al}`).digest('hex').slice(0, 16)}`;
}

function getDailyLimit(envKey: string, defaultValue: number): number {
  const raw = process.env[envKey];
  if (!raw) return defaultValue;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : defaultValue;
}

/**
 * Identity API
 * Entry point for vehicle lookup. Implements caching, rate-limiting, and cost control.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  
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

  const { plateOrVin, fingerprint, honeypot } = result.data;
  
  // 2. Honeypot Check (Anti-bot)
  if (honeypot) {
    console.warn(`Honeypot hit from IP: ${ip}`);
    return NextResponse.json({ error: 'Detection triggered' }, { status: 403 });
  }

  const normalizedPlateOrVin = plateOrVin.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const plateHash = createHash('sha256').update(normalizedPlateOrVin).digest('hex');

  // 4. Rate Limiting (defaults: 20/day per IP, 10/day per fingerprint)
  const ipDailyLimit = getDailyLimit('IDENTITY_IP_DAILY_LIMIT', 20);
  const fingerprintDailyLimit = getDailyLimit('IDENTITY_FINGERPRINT_DAILY_LIMIT', 10);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const ipCount = await prisma.lookupLog.count({
    where: { ip, createdAt: { gte: startOfDay } },
  });

  if (ipCount >= ipDailyLimit) {
    return NextResponse.json({ error: 'Direct lookup limit reached. Please contact support.' }, { status: 429 });
  }

  if (fingerprint) {
    const fpCount = await prisma.lookupLog.count({
      where: { fingerprint, createdAt: { gte: startOfDay } },
    });
    if (fpCount >= fingerprintDailyLimit) {
      return NextResponse.json({ error: 'Device lookup limit reached.' }, { status: 429 });
    }
  }

  try {
    // 5. Cache-First Strategy (90 day TTL)
    const cache = await prisma.vehicleCache.findUnique({
      where: { plate: normalizedPlateOrVin },
    });

    if (cache && cache.expiresAt > new Date()) {
      // Update access stats
      await prisma.vehicleCache.update({
        where: { plate: normalizedPlateOrVin },
        data: {
          lastAccessAt: new Date(),
          lookupCount: { increment: 1 },
        },
      });

      // Log attempt
      await (prisma.lookupLog as any).create({
        data: { plateHash, ip, fingerprint, email: null, source: 'CACHE', status: 'SUCCESS', costCents: 0 },
      });

      return NextResponse.json({
        vehicleIdentity: cache.identityJson,
        cacheHit: true,
      });
    }

    // 6. MotorWeb Retrieval on Cache Miss
    const identity = await fetchMotorWebIdentity(normalizedPlateOrVin);

    // 7. Store in Cache
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    await prisma.vehicleCache.upsert({
      where: { plate: normalizedPlateOrVin },
      update: {
        identityJson: identity as any,
        lookupCount: { increment: 1 },
        lastAccessAt: new Date(),
        expiresAt,
      },
      create: {
        plate: normalizedPlateOrVin,
        identityJson: identity as any,
        classificationJson: {} as any,
        lookupCount: 1,
        expiresAt,
      },
    });

    // 8. Log success
    const cfg = getRevenueEnginePricingConfig();
    await (prisma.lookupLog as any).create({
      data: {
        plateHash,
        ip,
        fingerprint,
        email: null,
        source: 'MOTORWEB',
        status: 'SUCCESS',
        costCents: cfg.motorWebLookupCostCents,
      },
    });

    return NextResponse.json({
      vehicleIdentity: identity,
      cacheHit: false,
    });

  } catch (error: any) {
    console.error('Identity API Error:', error.message);
    
    // Log failure
    const cfg = getRevenueEnginePricingConfig();
    await (prisma.lookupLog as any).create({
      data: {
        plateHash,
        ip,
        fingerprint,
        email: null,
        source: 'MOTORWEB',
        status: 'FAILURE',
        costCents: cfg.motorWebLookupCostCents,
      },
    });

    return NextResponse.json({ error: 'Vehicle not found or provider unreachable' }, { status: 502 });
  }
}

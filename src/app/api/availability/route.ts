import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { generateAvailableSlots } from "@/lib/engines/slots";
import { parse, startOfDay, addDays } from "date-fns";

function getTimeZoneOffsetMs(dateUtc: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-NZ", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(dateUtc);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  const y = Number(get("year"));
  const mo = Number(get("month"));
  const d = Number(get("day"));
  const h = Number(get("hour"));
  const mi = Number(get("minute"));
  const s = Number(get("second"));

  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi, s);
  return asIfUtc - dateUtc.getTime();
}

function zonedMidnightToUtc(dateStrYmd: string, timeZone: string) {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateStrYmd);
  if (!m) throw new Error("Invalid date format (expected yyyy-MM-dd)");
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMs);
}

function addDaysYmd(dateStrYmd: string, days: number) {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateStrYmd);
  if (!m) throw new Error("Invalid date format (expected yyyy-MM-dd)");
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const durationMinutesRaw = searchParams.get("durationMinutes");

  if (!dateStr) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  try {
    const tz = "Pacific/Auckland";
    const dayStartUtc = zonedMidnightToUtc(dateStr, tz);
    const nextDayStartUtc = zonedMidnightToUtc(addDaysYmd(dateStr, 1), tz);

    // Keep a representative date for slot generation. Slots implementation will interpret it in Pacific/Auckland.
    const date = dayStartUtc;
    const durationMinutes = (() => {
      if (!durationMinutesRaw) return 90;
      const parsed = Number.parseInt(durationMinutesRaw, 10);
      if (!Number.isFinite(parsed)) return 90;
      return Math.min(360, Math.max(15, parsed));
    })();
    
    // 1. Fetch Occupied Ranges (CONFIRMED or PENDING_PAYMENT)
    const bookings = await prisma.booking.findMany({
      where: {
        slotStart: {
          gte: dayStartUtc,
          lt: nextDayStartUtc,
        },
        OR: [
          { status: 'CONFIRMED' },
          { 
            AND: [
              { status: 'PENDING_PAYMENT' },
              { paymentExpiresAt: { gte: new Date() } }
            ]
          }
        ]
      },
      select: {
        slotStart: true,
        slotEnd: true,
      }
    });

    // 2. Fetch Availability Blocks (Admin manual blocks)
    const blocks = await prisma.availabilityBlock.findMany({
      where: {
        start: {
          gte: dayStartUtc,
          lt: nextDayStartUtc,
        }
      }
    });

    const occupiedRanges = [
      ...bookings.map(b => ({ start: b.slotStart, end: b.slotEnd })),
      ...blocks.map(b => ({ start: b.start, end: b.end }))
    ];

    // 3. Generate Slots
    const slots = generateAvailableSlots(date, occupiedRanges, durationMinutes);

    return NextResponse.json({ slots });

  } catch (error: any) {
    console.error("[Availability API Error]:", error.message);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

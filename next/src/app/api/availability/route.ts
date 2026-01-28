import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { generateAvailableSlots } from "@/lib/engines/slots";
import { parse, startOfDay, addDays } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");

  if (!dateStr) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  try {
    const date = parse(dateStr, "yyyy-MM-dd", new Date());
    
    // 1. Fetch Occupied Ranges (CONFIRMED or PENDING_PAYMENT)
    const bookings = await prisma.booking.findMany({
      where: {
        slotStart: {
          gte: startOfDay(date),
          lt: addDays(startOfDay(date), 1),
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
          gte: startOfDay(date),
          lt: addDays(startOfDay(date), 1),
        }
      }
    });

    const occupiedRanges = [
      ...bookings.map(b => ({ start: b.slotStart, end: b.slotEnd })),
      ...blocks.map(b => ({ start: b.start, end: b.end }))
    ];

    // 3. Generate Slots (Default 90m duration as previously referenced)
    const slots = generateAvailableSlots(date, occupiedRanges, 90);

    return NextResponse.json({ slots });

  } catch (error: any) {
    console.error("[Availability API Error]:", error.message);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

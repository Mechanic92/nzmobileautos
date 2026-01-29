import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  const now = new Date();

  const expiredCount = await db().expirePendingBookings(now);

  return NextResponse.json({ expired: expiredCount });
}

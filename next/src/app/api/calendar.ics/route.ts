import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export const runtime = "nodejs";

function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function icsEscape(input: string) {
  return (input || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsUtc(dt: Date) {
  const iso = dt.toISOString();
  // 2025-01-02T03:04:05.000Z -> 20250102T030405Z
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") || "";

  const provisionToken = process.env.ADMIN_PROVISION_TOKEN;
  if (!provisionToken) {
    return new NextResponse("Calendar feed not configured", { status: 500 });
  }

  // Same token as device provisioning: simplest + free.
  if (!timingSafeEq(token, provisionToken)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
    },
    orderBy: {
      slotStart: "asc",
    },
    include: {
      customer: true,
      address: true,
      vehicle: true,
    },
  });

  const nowUtc = new Date();

  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//Mobile Autoworks NZ//Admin Calendar//EN");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push("X-WR-CALNAME:Mobile Autoworks Jobs");
  lines.push("X-WR-TIMEZONE:Pacific/Auckland");

  for (const b of bookings) {
    const uid = `${b.id}@nzmobileauto.vercel.app`;
    const dtStart = toIcsUtc(b.slotStart);
    const dtEnd = toIcsUtc(b.slotEnd);

    const summary = `Mobile Autoworks - ${b.kind} (${b.publicId})`;

    const addressOneLine = [b.address?.line1, b.address?.suburb, b.address?.city]
      .filter(Boolean)
      .join(", ");

    const customerLine = `${b.customer?.fullName || ""}${b.customer?.phone ? ` (${b.customer.phone})` : ""}`;

    const description = [
      `Reference: ${b.publicId}`,
      `Status: ${b.status}`,
      `Customer: ${customerLine}`,
      `Customer email: ${b.customer?.email || ""}`,
      `Address: ${addressOneLine}`,
      `Vehicle: ${[b.vehicle?.plate, b.vehicle?.year, b.vehicle?.make, b.vehicle?.model].filter(Boolean).join(" ")}`,
      "",
      "Notes:",
      `${b.notes || ""}`,
    ].join("\n");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${icsEscape(uid)}`);
    lines.push(`DTSTAMP:${toIcsUtc(nowUtc)}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${icsEscape(summary)}`);
    if (addressOneLine) lines.push(`LOCATION:${icsEscape(addressOneLine)}`);
    lines.push(`DESCRIPTION:${icsEscape(description)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const body = lines.join("\r\n") + "\r\n";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "content-disposition": 'inline; filename="mobile-autoworks.ics"',
    },
  });
}

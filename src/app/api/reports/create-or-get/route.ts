import { NextResponse } from "next/server";
import { z } from "zod";
import { db, type ServiceReportType } from "@/server/db";
import { requireAdminOrThrow } from "@/server/adminGuard";

const BodySchema = z.object({
  bookingId: z.string().min(1),
  type: z.enum(["DIAGNOSTICS", "PPI"]).default("DIAGNOSTICS"),
});

export async function POST(req: Request) {
  await requireAdminOrThrow();
  const body = BodySchema.parse(await req.json());

  const report = await db().createOrGetServiceReportForBooking({
    bookingId: body.bookingId,
    type: body.type as ServiceReportType,
  });

  return NextResponse.json({
    id: report.id,
    bookingId: report.bookingId,
    type: report.type,
    status: report.status,
    dataJson: report.dataJson,
    publicToken: report.publicToken,
    emailedAt: report.emailedAt ? report.emailedAt.toISOString() : null,
  });
}

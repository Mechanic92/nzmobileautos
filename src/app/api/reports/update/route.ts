import { NextResponse } from "next/server";
import { z } from "zod";
import { db, type ServiceReportStatus } from "@/server/db";
import { requireAdminOrThrow } from "@/server/adminGuard";

const BodySchema = z.object({
  id: z.string().min(1),
  status: z.enum(["DRAFT", "FINAL"]).optional(),
  dataJson: z.any(),
});

export async function POST(req: Request) {
  await requireAdminOrThrow();
  const body = BodySchema.parse(await req.json());

  const updated = await db().updateServiceReportData(
    { id: body.id },
    { status: body.status as ServiceReportStatus | undefined, dataJson: body.dataJson }
  );

  return NextResponse.json({
    id: updated.id,
    bookingId: updated.bookingId,
    type: updated.type,
    status: updated.status,
    dataJson: updated.dataJson,
    publicToken: updated.publicToken,
    emailedAt: updated.emailedAt ? updated.emailedAt.toISOString() : null,
  });
}

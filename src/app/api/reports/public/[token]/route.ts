import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await db().getServiceReportByPublicToken(token);
  if (!report) return new NextResponse("Not found", { status: 404 });

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

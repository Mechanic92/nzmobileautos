import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/prisma";
import { requireAdminOrThrow } from "@/server/adminGuard";
import { db } from "@/server/db";
import { sendServiceReportReadyEmail } from "@/server/email";

const BodySchema = z.object({
  reportId: z.string().min(1),
});

function getAppUrl() {
  return process.env.APP_URL || "https://app.mobileautoworksnz.com";
}

export async function POST(req: Request) {
  await requireAdminOrThrow();
  const body = BodySchema.parse(await req.json());

  const report = await prisma.serviceReport.findUnique({
    where: { id: body.reportId },
    include: {
      booking: {
        include: {
          customer: true,
          vehicle: true,
        },
      },
    },
  });

  if (!report) return new NextResponse("Report not found", { status: 404 });

  const toEmail = report.booking.customer.email;
  if (!toEmail) return new NextResponse("Customer email missing", { status: 400 });

  const reportUrl = `${getAppUrl()}/report/${report.publicToken}`;

  await sendServiceReportReadyEmail({
    toEmail,
    reportTitle: (report.dataJson as any)?.title || (report.type === "DIAGNOSTICS" ? "Diagnostics Report" : "Pre-Purchase Inspection Report"),
    reportUrl,
    bookingRef: report.booking.publicId,
  });

  await db().markServiceReportEmailed({ id: report.id }, { emailedAt: new Date() });

  return NextResponse.json({ ok: true, reportUrl });
}

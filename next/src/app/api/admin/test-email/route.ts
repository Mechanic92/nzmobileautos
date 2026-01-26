import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminOrThrow } from "@/server/adminGuard";
import { sendBookingConfirmedBusinessEmail } from "@/server/email";

const BodySchema = z.object({
  toEmail: z.string().email().optional(),
});

export async function POST(req: Request) {
  await requireAdminOrThrow();
  const body = BodySchema.parse(await req.json().catch(() => ({})));

  const to = body.toEmail || process.env.BUSINESS_EMAIL;
  if (!to) return new NextResponse("Missing BUSINESS_EMAIL", { status: 500 });

  await sendBookingConfirmedBusinessEmail({
    toEmail: to,
    bookingPublicId: "bk_TEST1234",
    scheduledStartIso: new Date().toISOString(),
    addressOneLine: "123 Example St, Auckland",
    customerName: "Test Customer",
    customerPhone: "027 000 0000",
    customerEmail: "test@example.com",
    vehiclePlate: "ABC123",
    symptoms: "Test booking confirmation email",
    adminUrl: `${process.env.APP_URL || "http://localhost:3000"}/admin`,
  });

  return NextResponse.json({ ok: true });
}

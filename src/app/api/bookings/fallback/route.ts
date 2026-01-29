import { NextResponse } from "next/server";
import { z } from "zod";
import { sendBookingFallbackBusinessEmail } from "@/server/email";

export const runtime = "nodejs";

const BodySchema = z.object({
  scheduledStartLocal: z.string().min(1),
  address: z.string().min(5),
  vehiclePlate: z.string().min(2),
  symptoms: z.string().min(3),
  customerName: z.string().min(2),
  customerEmail: z.string().email().nullable().optional(),
  customerPhone: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = BodySchema.parse(json);

    const businessEmail = (process.env.BUSINESS_EMAIL || "").trim();
    if (!businessEmail) {
      return NextResponse.json(
        {
          ok: false,
          error: "BUSINESS_EMAIL is not configured. Please call or text 027 642 1824 to book.",
          fallback: { phone: "+64276421824", displayPhone: "027 642 1824" },
        },
        { status: 500 }
      );
    }

    await sendBookingFallbackBusinessEmail({
      toEmail: businessEmail,
      customerName: input.customerName,
      customerEmail: input.customerEmail ?? null,
      customerPhone: input.customerPhone,
      scheduledStartLocal: input.scheduledStartLocal,
      address: input.address,
      vehiclePlate: input.vehiclePlate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      symptoms: input.symptoms,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = String(err?.message || "Invalid request");
    return new NextResponse(msg, { status: 400 });
  }
}

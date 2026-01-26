import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdminOrThrow } from "@/server/adminGuard";

const QuoteStatusSchema = z.enum(["NEW", "CONTACTED", "BOOKED", "IN_PROGRESS", "COMPLETED", "CLOSED"]);

const BodySchema = z.object({
  id: z.string().min(1),
  status: QuoteStatusSchema,
});

export async function POST(req: Request) {
  try {
    await requireAdminOrThrow();

    const json = await req.json();
    const body = BodySchema.parse(json);

    await db().updateQuoteRequestStatus({ id: body.id }, { status: body.status });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = String(err?.message || "Unauthorized");
    const status = msg === "Unauthorized" ? 401 : 500;
    return new NextResponse(msg, { status });
  }
}

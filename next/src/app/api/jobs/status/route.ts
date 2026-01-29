import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdminOrThrow } from "@/server/adminGuard";

const JobStatusSchema = z.enum(["NEW", "NEEDS_QUOTE", "QUOTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

const BodySchema = z.object({
  id: z.string().min(1),
  status: JobStatusSchema,
});

export async function POST(req: Request) {
  try {
    await requireAdminOrThrow();

    const json = await req.json();
    const body = BodySchema.parse(json);

    await db().updateJobStatus({ id: body.id }, { status: body.status });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = String(err?.message || "Unauthorized");
    const status = msg === "Unauthorized" ? 401 : 500;
    return new NextResponse(msg, { status });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdminOrThrow } from "@/server/adminGuard";

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdminOrThrow();

    const url = new URL(req.url);
    const parsed = QuerySchema.parse({ limit: url.searchParams.get("limit") ?? undefined });

    const jobs = await db().listJobs(parsed.limit ?? 200);
    const rows = jobs.map((j) => ({
      id: j.id,
      publicId: j.publicId,
      status: j.status,
      title: j.title,
      createdAt: j.createdAt.toISOString(),
      scheduledStart: j.scheduledStart ? j.scheduledStart.toISOString() : null,
    }));

    return NextResponse.json({ ok: true, jobs: rows });
  } catch (err: any) {
    const msg = String(err?.message || "Unauthorized");
    const status = msg === "Unauthorized" ? 401 : 500;
    return new NextResponse(msg, { status });
  }
}

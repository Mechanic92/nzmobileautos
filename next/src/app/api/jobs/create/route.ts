import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdminOrThrow } from "@/server/adminGuard";

const JobStatusSchema = z.enum(["NEW", "NEEDS_QUOTE", "QUOTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

const BodySchema = z.object({
  status: JobStatusSchema.optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  customer: z.object({
    fullName: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
  }),
  address: z.object({
    line1: z.string().min(1),
    suburb: z.string().min(1),
    city: z.string().min(1),
    postcode: z.string().optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
    travelBand: z.string().optional().nullable(),
  }),
  vehicle: z
    .object({
      plate: z.string().optional().nullable(),
      make: z.string().optional().nullable(),
      model: z.string().optional().nullable(),
      year: z.number().int().optional().nullable(),
      fuel: z.string().optional().nullable(),
      odometer: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export async function POST(req: Request) {
  try {
    await requireAdminOrThrow();

    const json = await req.json();
    const body = BodySchema.parse(json);

    const created = await db().createJob({
      status: body.status ?? undefined,
      title: body.title,
      description: body.description ?? null,
      internalNotes: body.internalNotes ?? null,
      customer: body.customer,
      address: body.address,
      vehicle: body.vehicle ?? null,
    });

    return NextResponse.json({ ok: true, job: { id: created.id, publicId: created.publicId } });
  } catch (err: any) {
    const msg = String(err?.message || "Unauthorized");
    const status = msg === "Unauthorized" ? 401 : 500;
    return new NextResponse(msg, { status });
  }
}

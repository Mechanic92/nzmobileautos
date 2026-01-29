import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const instant = await prisma.instantQuote.findUnique({
      where: { publicId: id },
    });

    if (instant) {
      return NextResponse.json({
        kind: "INSTANT_QUOTE",
        publicId: instant.publicId,
        status: instant.status,
        pricingSnapshot: instant.pricingSnapshotJson,
        createdAt: instant.createdAt,
      });
    }

    const legacy = await prisma.quoteRequest.findUnique({
      where: { publicId: id },
      include: {
        vehicle: true,
        customer: true,
      },
    });

    if (!legacy) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({
      kind: "QUOTE_REQUEST",
      ...legacy,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

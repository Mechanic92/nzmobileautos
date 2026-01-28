import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const quote = await prisma.quoteRequest.findUnique({
      where: { publicId: id },
      include: {
        vehicle: true,
        customer: true,
      }
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

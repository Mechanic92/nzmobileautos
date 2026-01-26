import { NextResponse } from "next/server";
import { dbHealthCheck } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  const db = await dbHealthCheck();

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const stripeWebhookConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const envOk = Boolean(process.env.DATABASE_URL) && Boolean(process.env.APP_URL);

  return NextResponse.json({
    ok: db.ok && envOk,
    db,
    stripeConfigured,
    stripeWebhookConfigured,
    envOk,
  });
}

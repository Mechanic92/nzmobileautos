import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { buffer } from "micro";
import { Resend } from "resend";

export const config = {
  api: {
    bodyParser: false,
  },
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function formatBookingText(meta: Record<string, any>) {
  const lines = [
    `Booking Ref: ${meta.bookingRef || ""}`,
    `Service: ${meta.serviceType || ""}`,
    meta.servicePackage ? `Package: ${meta.servicePackage}` : "",
    `When: ${meta.appointmentDate || ""} ${meta.appointmentTime || ""}`,
    "",
    `Customer: ${meta.customerName || ""}`,
    `Email: ${meta.customerEmail || ""}`,
    `Phone: ${meta.customerPhone || ""}`,
    "",
    `Vehicle: ${[meta.vehicleYear, meta.vehicleMake, meta.vehicleModel].filter(Boolean).join(" ")}`,
    `Rego: ${meta.vehicleRego || ""}`,
    "",
    `Suburb: ${meta.suburb || ""}`,
    `Address: ${meta.address || ""}`,
    "",
    `Notes: ${meta.notes || ""}`,
  ].filter(Boolean);

  return lines.join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");
    const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");

    const sig = req.headers["stripe-signature"] as string | undefined;
    if (!sig) return res.status(400).send("Missing stripe-signature");

    const rawBody = (await buffer(req)).toString("utf8");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook signature verification failed: ${err?.message || ""}`.trim());
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = (session.metadata || {}) as Record<string, any>;

      const notifyTo = process.env.BOOKING_NOTIFY_EMAIL || process.env.QUOTE_NOTIFY_EMAIL;
      const resendApiKey = process.env.RESEND_API_KEY;

      if (notifyTo && resendApiKey) {
        const resend = new Resend(resendApiKey);
        const fromEmail = process.env.BOOKING_FROM_EMAIL || process.env.QUOTE_FROM_EMAIL || "onboarding@resend.dev";

        const subject = `PAID Booking Confirmed: ${meta.serviceType || "Booking"} - ${meta.customerName || ""}`.trim();
        const text = formatBookingText(meta);

        await resend.emails.send({
          from: fromEmail,
          to: notifyTo,
          replyTo: meta.customerEmail || undefined,
          subject,
          text,
        });
      }

      // MechanicDesk handoff: requires their API credentials/spec. Keep as email for now.
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    return res.status(500).send(err?.message || "Server error");
  }
}

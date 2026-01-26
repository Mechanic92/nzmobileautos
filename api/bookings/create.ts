import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import Stripe from "stripe";
import { computeBookingPrice } from "../../server/utils/pricing";

const BookingCreateSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  vehicleYear: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  vehicleRego: z.string().optional().default(""),
  serviceType: z.string().min(1),
  servicePackage: z.string().optional().default(""),
  appointmentDate: z.string().min(1),
  appointmentTime: z.string().min(1),
  suburb: z.string().min(1),
  address: z.string().min(1),
  notes: z.string().optional().default(""),
});

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function truncate(s: string, max: number) {
  if (!s) return "";
  return s.length <= max ? s : `${s.slice(0, max - 3)}...`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const input = BookingCreateSchema.parse(req.body);

    const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });

    const origin = process.env.PUBLIC_APP_URL || `https://${req.headers.host}`;

    const pricing = computeBookingPrice(input.serviceType);

    const bookingRef = `bk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: input.email,
      line_items: [
        {
          price_data: {
            currency: pricing.currency,
            product_data: {
              name: pricing.description,
              description: pricing.isDeposit
                ? "Deposit payment. Balance due upon completion of work."
                : "Service fee.",
            },
            unit_amount: pricing.amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingRef,
        serviceType: input.serviceType,
        servicePackage: input.servicePackage || "",
        appointmentDate: input.appointmentDate,
        appointmentTime: input.appointmentTime,
        customerName: input.customerName,
        customerEmail: input.email,
        customerPhone: input.phone,
        suburb: input.suburb,
        address: truncate(input.address, 200),
        vehicleRego: (input.vehicleRego || "").toUpperCase(),
        vehicleMake: input.vehicleMake,
        vehicleModel: input.vehicleModel,
        vehicleYear: String(input.vehicleYear),
        notes: truncate(input.notes || "", 200),
      },
      success_url: `${origin}/book?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?payment=cancelled`,
    });

    if (!session.url) {
      return res.status(502).json({ error: "Stripe session creation failed" });
    }

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Unknown error" });
  }
}

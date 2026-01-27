import express, { type Request, type Response } from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { z } from "zod";
import { appRouter } from "../routers";
import { createContext } from "./trpc";
import { ENV } from "./env";
import path from "path";
import { fileURLToPath } from "url";
import { seedBlogPosts, updateBookingStatus, getBookingById } from "../../db";
import { stripe } from "../utils/stripe";
import { 
  sendAdminQuoteEmail, 
  sendCustomerQuoteEmail,
  sendAdminBookingConfirmation,
  sendCustomerBookingConfirmation
} from "../utils/email";
import { notifyOwnerViaSMS } from "../utils/sms";

const app = express();

// Middleware
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret || !stripe) {
    res.status(400).send("Webhook Error: Missing signature, secret, or stripe client");
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const bookingId = parseInt(session.metadata?.bookingId || "0");
      
      if (bookingId) {
        // Idempotency check: Get current booking state
        const booking = await getBookingById(bookingId);
        if (booking && booking.paymentStatus === "paid") {
          console.log(`[Stripe] Webhook: Booking ${bookingId} already processed (idempotent skip)`);
          res.json({ received: true });
          return;
        }

        // Determine confirmed status based on metadata
        const isWeekendBooking = session.metadata?.isWeekendBooking === 'true';
        const finalStatus = isWeekendBooking ? 'pending_weekend_approval' : 'confirmed';

        // Update booking in DB
        await updateBookingStatus(
          bookingId, 
          finalStatus, 
          undefined, 
          undefined, 
          undefined, 
          "paid"
        );
        
        console.log(`[Stripe] Booking ${bookingId} marked as PAID (${finalStatus}) via webhook`);

        // Prepare notification data
        const notificationData = {
          bookingRef: session.metadata?.bookingRef || `ID-${bookingId}`,
          customerName: session.metadata?.customerName || '',
          phone: session.metadata?.phone || '',
          email: session.metadata?.email || '',
          address: session.metadata?.address || '',
          suburb: 'Auckland',
          vehicleRego: session.metadata?.vehicleRego || '',
          vehicleMake: 'Unknown',
          vehicleModel: 'Unknown',
          vehicleYear: 0,
          serviceType: session.metadata?.serviceType || 'Service',
          appointmentDate: session.metadata?.preferredDate || '',
          appointmentTime: session.metadata?.preferredTime || '',
          notes: session.metadata?.notes || '',
          stripeSessionId: session.id,
          amountPaid: session.amount_total || 0,
          paidAt: new Date().toISOString(),
        };

        // Send notifications asynchronously
        await Promise.allSettled([
          sendAdminBookingConfirmation(notificationData),
          sendCustomerBookingConfirmation(notificationData),
          notifyOwnerViaSMS({
            ...notificationData,
            amountPaid: session.amount_total || 0,
          }),
        ]);
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(`[Stripe] Webhook error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(cors());
app.use(express.json());

const QuoteEmailSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  vehicleRego: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.union([z.string(), z.number()]).optional(),
  serviceType: z.string().min(1),
  suburb: z.string().optional(),
  message: z.string().optional(),
});

app.post("/api/quote-email", async (req: Request, res: Response) => {
  try {
    const parsed = QuoteEmailSchema.parse(req.body);
    const yearNum =
      parsed.vehicleYear === undefined || parsed.vehicleYear === null
        ? undefined
        : typeof parsed.vehicleYear === "number"
          ? parsed.vehicleYear
          : Number(String(parsed.vehicleYear).trim());

    const payload = {
      customerName: parsed.customerName,
      email: parsed.email,
      phone: parsed.phone,
      vehicleMake: parsed.vehicleMake,
      vehicleModel: parsed.vehicleModel,
      vehicleYear: Number.isFinite(yearNum as number) ? (yearNum as number) : undefined,
      serviceType: parsed.serviceType,
      suburb: parsed.suburb,
      message: [
        parsed.vehicleRego ? `Registration: ${parsed.vehicleRego}` : null,
        parsed.message ? parsed.message : null,
      ]
        .filter(Boolean)
        .join("\n\n"),
    };

    const adminOk = await sendAdminQuoteEmail(payload);
    const customerOk = await sendCustomerQuoteEmail(payload);

    res.json({ ok: true, adminSent: adminOk, customerSent: customerOk });
  } catch (err: any) {
    const message = err?.issues ? "Invalid quote request" : String(err?.message || "Failed to process quote request");
    res.status(400).json({ ok: false, error: message });
  }
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// tRPC API endpoint
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Serve static frontend in production builds
if (ENV.nodeEnv === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDir = path.resolve(__dirname, "../../dist/client");
  app.use(express.static(clientDir));
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

// Start server
const port = ENV.port;
app.listen(port, async () => {
  console.log(`[Server] Mobile Autoworks NZ API running on port ${port}`);
  console.log(`[Server] tRPC endpoint: http://localhost:${port}/api/trpc`);

  try {
    await seedBlogPosts();
    console.log("[Server] Blog posts seeded successfully");
  } catch (error) {
    console.error("[Server] Failed to seed blog posts:", error);
  }
});

export { appRouter, type AppRouter } from "../routers";

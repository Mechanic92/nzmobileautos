/**
 * Payment Routes
 * POST /api/payment/checkout - Create Stripe checkout session
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { createCheckoutSession } from "../services/stripe.js";
import type { PricingBreakdown } from "../services/pricing.js";

// ============================================
// Schemas
// ============================================

const CheckoutSchema = z.object({
  bookingId: z.string().min(1),
});

// ============================================
// Routes
// ============================================

export async function paymentRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/payment/checkout
   * Create Stripe checkout session for a booking
   */
  fastify.post(
    "/checkout",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as unknown;

      const parseResult = CheckoutSchema.safeParse(body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: "Invalid request",
        });
      }

      const { bookingId } = parseResult.data;

      // Get booking with quote
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { quote: true },
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: "Booking not found",
        });
      }

      // Verify booking is pending payment
      if (booking.status !== "PENDING_PAYMENT") {
        return reply.status(400).send({
          success: false,
          error: `Booking is ${booking.status.toLowerCase()}. Cannot create payment session.`,
        });
      }

      // Check if hold has expired
      if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
        return reply.status(400).send({
          success: false,
          error: "Booking hold has expired. Please select a new time slot.",
        });
      }

      const pricing = booking.quote.pricingBreakdownJson as unknown as PricingBreakdown;

      // Create Stripe checkout session
      const result = await createCheckoutSession({
        bookingId: booking.id,
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        pricing,
      });

      if (!result.success) {
        return reply.status(500).send({
          success: false,
          error: result.error,
        });
      }

      return reply.send({
        success: true,
        sessionId: result.sessionId,
        sessionUrl: result.sessionUrl,
      });
    }
  );

  /**
   * GET /api/payment/status/:bookingId
   * Get payment status for a booking
   */
  fastify.get(
    "/status/:bookingId",
    async (request: FastifyRequest<{ Params: { bookingId: string } }>, reply: FastifyReply) => {
      const { bookingId } = request.params;

      const payment = await prisma.payment.findFirst({
        where: { bookingId },
        orderBy: { createdAt: "desc" },
      });

      if (!payment) {
        return reply.status(404).send({
          success: false,
          error: "No payment found for this booking",
        });
      }

      return reply.send({
        success: true,
        payment: {
          status: payment.status,
          amount: payment.amountIncGst,
          method: payment.paymentMethod,
          createdAt: payment.createdAt,
        },
      });
    }
  );
}

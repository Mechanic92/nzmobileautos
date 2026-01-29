/**
 * Booking Routes
 * POST /api/booking - Create booking
 * GET /api/booking/availability - Get available slots
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  getAvailability,
  createBooking,
  cancelBooking,
} from "../services/booking.js";
import type { ServiceType } from "../config/constants.js";

// ============================================
// Schemas
// ============================================

const CreateBookingSchema = z.object({
  quoteId: z.string().min(1),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8).max(20),
  address: z.string().min(5).max(500),
  suburb: z.string().min(2).max(100),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const AvailabilityQuerySchema = z.object({
  serviceType: z.enum(["BASIC", "COMPREHENSIVE"]),
  days: z.coerce.number().min(1).max(30).optional(),
});

// ============================================
// Routes
// ============================================

export async function bookingRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/booking/availability
   * Get available time slots
   */
  fastify.get(
    "/availability",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as unknown;

      const parseResult = AvailabilityQuerySchema.safeParse(query);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: "Invalid query parameters",
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { serviceType, days = 14 } = parseResult.data;

      const availability = await getAvailability(serviceType as ServiceType, days);

      return reply.send({
        success: true,
        availability,
      });
    }
  );

  /**
   * POST /api/booking
   * Create a new booking (holds slot for payment)
   */
  fastify.post(
    "/",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as unknown;

      const parseResult = CreateBookingSchema.safeParse(body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: "Invalid booking data",
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const bookingData = parseResult.data;

      // Verify quote exists and is valid
      const quote = await prisma.quote.findUnique({
        where: { id: bookingData.quoteId },
      });

      if (!quote) {
        return reply.status(404).send({
          success: false,
          error: "Quote not found",
        });
      }

      if (quote.expiresAt < new Date()) {
        return reply.status(400).send({
          success: false,
          error: "Quote has expired. Please get a new quote.",
        });
      }

      // Create booking
      const result = await createBooking(bookingData);

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          error: result.error,
        });
      }

      return reply.send({
        success: true,
        bookingId: result.bookingId,
        holdExpiresAt: result.holdExpiresAt,
        message: `Slot held for 15 minutes. Please complete payment to confirm.`,
      });
    }
  );

  /**
   * GET /api/booking/:id
   * Get booking details
   */
  fastify.get(
    "/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          quote: true,
          payments: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: "Booking not found",
        });
      }

      return reply.send({
        success: true,
        booking: {
          id: booking.id,
          status: booking.status,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          address: booking.address,
          suburb: booking.suburb,
          startTime: booking.startTime,
          endTime: booking.endTime,
          holdExpiresAt: booking.holdExpiresAt,
          vehicle: booking.quote.vehicleSnapshotJson,
          pricing: booking.quote.pricingBreakdownJson,
          payment: booking.payments[0]
            ? {
                status: booking.payments[0].status,
                amount: booking.payments[0].amountIncGst,
              }
            : null,
          createdAt: booking.createdAt,
        },
      });
    }
  );

  /**
   * POST /api/booking/:id/cancel
   * Cancel a booking
   */
  fastify.post(
    "/:id/cancel",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: "Booking not found",
        });
      }

      // Only allow cancellation of pending bookings
      if (booking.status !== "PENDING_PAYMENT") {
        return reply.status(400).send({
          success: false,
          error: "Only pending bookings can be cancelled. Contact support for confirmed bookings.",
        });
      }

      const cancelled = await cancelBooking(id);

      if (!cancelled) {
        return reply.status(500).send({
          success: false,
          error: "Failed to cancel booking",
        });
      }

      return reply.send({
        success: true,
        message: "Booking cancelled",
      });
    }
  );
}

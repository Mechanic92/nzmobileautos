/**
 * Quote Routes
 * POST /api/quote - Generate pricing quote
 * GET /api/quote/:id - Retrieve quote
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { addHours } from "date-fns";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { calculatePrice, type PricingBreakdown } from "../services/pricing.js";
import type { VehicleData } from "../services/motorweb.js";

// ============================================
// Schemas
// ============================================

const CreateQuoteSchema = z.object({
  vehicle: z.object({
    plate: z.string().min(1).max(6),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().min(1980),
    fuel: z.string(),
    cc: z.number().min(100),
    vin: z.string().optional(),
    body: z.string().optional(),
  }),
  serviceType: z.enum(["BASIC", "COMPREHENSIVE"]),
  extras: z.array(z.string()).optional(),
  oilCapacityLitres: z.number().optional(),
});

// ============================================
// Routes
// ============================================

export async function quoteRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/quote
   * Generate a new pricing quote
   */
  fastify.post(
    "/",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as unknown;

      const parseResult = CreateQuoteSchema.safeParse(body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: "Invalid request",
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { vehicle, serviceType, extras, oilCapacityLitres } = parseResult.data;

      // Calculate pricing
      const pricingResult = calculatePrice({
        vehicle: vehicle as VehicleData,
        serviceType,
        extras,
        oilCapacityLitres,
      });

      if (!pricingResult.success) {
        return reply.status(200).send({
          success: false,
          error: pricingResult.error,
          requiresApproval: pricingResult.requiresApproval,
          approvalReason: pricingResult.approvalReason,
        });
      }

      const breakdown = pricingResult.breakdown!;

      // Create quote record
      const quote = await prisma.quote.create({
        data: {
          plate: vehicle.plate.toUpperCase(),
          vehicleSnapshotJson: vehicle as any,
          serviceType,
          pricingBreakdownJson: breakdown as any,
          totalIncGst: breakdown.totalIncGstCents,
          expiresAt: addHours(new Date(), env.QUOTE_VALIDITY_HOURS),
        },
      });

      return reply.send({
        success: true,
        quoteId: quote.id,
        expiresAt: quote.expiresAt,
        pricing: breakdown,
      });
    }
  );

  /**
   * GET /api/quote/:id
   * Retrieve an existing quote
   */
  fastify.get(
    "/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      const quote = await prisma.quote.findUnique({
        where: { id },
      });

      if (!quote) {
        return reply.status(404).send({
          success: false,
          error: "Quote not found",
        });
      }

      const isExpired = quote.expiresAt < new Date();

      return reply.send({
        success: true,
        quote: {
          id: quote.id,
          plate: quote.plate,
          vehicle: quote.vehicleSnapshotJson,
          serviceType: quote.serviceType,
          pricing: quote.pricingBreakdownJson as PricingBreakdown,
          totalIncGst: quote.totalIncGst,
          expiresAt: quote.expiresAt,
          isExpired,
          createdAt: quote.createdAt,
        },
      });
    }
  );

  /**
   * POST /api/quote/:id/refresh
   * Refresh an expired quote with current pricing
   */
  fastify.post(
    "/:id/refresh",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      const existingQuote = await prisma.quote.findUnique({
        where: { id },
      });

      if (!existingQuote) {
        return reply.status(404).send({
          success: false,
          error: "Quote not found",
        });
      }

      const vehicle = existingQuote.vehicleSnapshotJson as unknown as VehicleData;
      const oldPricing = existingQuote.pricingBreakdownJson as unknown as PricingBreakdown;

      // Recalculate with current pricing
      const pricingResult = calculatePrice({
        vehicle,
        serviceType: existingQuote.serviceType as "BASIC" | "COMPREHENSIVE",
        extras: oldPricing.extras.map((e) => e.code),
      });

      if (!pricingResult.success) {
        return reply.status(400).send({
          success: false,
          error: pricingResult.error,
        });
      }

      const breakdown = pricingResult.breakdown!;

      // Create new quote
      const newQuote = await prisma.quote.create({
        data: {
          plate: vehicle.plate.toUpperCase(),
          vehicleSnapshotJson: vehicle as any,
          serviceType: existingQuote.serviceType,
          pricingBreakdownJson: breakdown as any,
          totalIncGst: breakdown.totalIncGstCents,
          expiresAt: addHours(new Date(), env.QUOTE_VALIDITY_HOURS),
        },
      });

      return reply.send({
        success: true,
        quoteId: newQuote.id,
        expiresAt: newQuote.expiresAt,
        pricing: breakdown,
        priceChanged: breakdown.totalIncGstCents !== existingQuote.totalIncGst,
      });
    }
  );
}

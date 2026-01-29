/**
 * Vehicle Lookup Routes
 * POST /api/vehicle/lookup - MotorWeb plate lookup
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { lookupVehicle, validatePlate, createManualVehicle } from "../services/motorweb.js";
import { prisma } from "../lib/prisma.js";

// ============================================
// Schemas
// ============================================

const LookupSchema = z.object({
  plate: z.string().min(1).max(6),
  email: z.string().email(),
  fingerprint: z.string().optional(),
  honeypot: z.string().optional(), // Must be empty
});

const ManualVehicleSchema = z.object({
  plate: z.string().min(1).max(6),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().min(1980).max(new Date().getFullYear() + 1),
  fuel: z.enum(["PETROL", "DIESEL"]),
  cc: z.number().min(100).max(10000),
});

// ============================================
// Routes
// ============================================

export async function vehicleRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/vehicle/lookup
   * Lookup vehicle by plate number
   */
  fastify.post(
    "/lookup",
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "1 minute",
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as unknown;

      // Validate input
      const parseResult = LookupSchema.safeParse(body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: "Invalid request",
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { plate, email, fingerprint, honeypot } = parseResult.data;

      // Honeypot check - if filled, it's a bot
      if (honeypot && honeypot.length > 0) {
        fastify.log.warn(`Honeypot triggered from IP ${request.ip}`);
        // Return fake success to confuse bots
        return reply.send({
          success: true,
          source: "CACHE",
          vehicle: {
            plate: plate.toUpperCase(),
            make: "Unknown",
            model: "Unknown",
            year: 2020,
            fuel: "PETROL",
            cc: 2000,
          },
        });
      }

      // Check if IP is blocked
      const blocked = await prisma.blockedIp.findUnique({
        where: { ipAddress: request.ip },
      });

      if (blocked && (!blocked.expiresAt || blocked.expiresAt > new Date())) {
        return reply.status(429).send({
          success: false,
          error: "Too many requests. Please try again later.",
        });
      }

      // Perform lookup
      const result = await lookupVehicle(plate, request.ip, fingerprint);

      if (!result.success) {
        return reply.status(result.source === "FALLBACK" ? 200 : 500).send(result);
      }

      return reply.send(result);
    }
  );

  /**
   * POST /api/vehicle/manual
   * Manual vehicle entry (fallback)
   */
  fastify.post(
    "/manual",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as unknown;

      const parseResult = ManualVehicleSchema.safeParse(body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: "Invalid vehicle data",
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { plate, make, model, year, fuel, cc } = parseResult.data;

      // Validate plate format
      const validation = validatePlate(plate);
      if (!validation.valid) {
        return reply.status(400).send({
          success: false,
          error: validation.error,
        });
      }

      const vehicle = createManualVehicle(
        validation.normalized,
        make,
        model,
        year,
        fuel,
        cc
      );

      return reply.send({
        success: true,
        source: "MANUAL",
        vehicle,
      });
    }
  );

  /**
   * GET /api/vehicle/makes
   * Get list of common vehicle makes
   */
  fastify.get("/makes", async (_request: FastifyRequest, reply: FastifyReply) => {
    const makes = [
      "Toyota",
      "Honda",
      "Mazda",
      "Nissan",
      "Ford",
      "Holden",
      "Mitsubishi",
      "Subaru",
      "Hyundai",
      "Kia",
      "Suzuki",
      "Volkswagen",
      "BMW",
      "Mercedes-Benz",
      "Audi",
      "Lexus",
      "Jeep",
      "Land Rover",
      "Isuzu",
      "Other",
    ];

    return reply.send({ makes });
  });
}

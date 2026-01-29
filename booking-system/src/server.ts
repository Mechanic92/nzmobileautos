/**
 * Fastify Server
 * Main entry point for the booking API
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env.js";
import { redis } from "./lib/redis.js";
import { cleanupExpiredHolds } from "./services/booking.js";

// Import routes
import { vehicleRoutes } from "./routes/vehicle.js";
import { quoteRoutes } from "./routes/quote.js";
import { bookingRoutes } from "./routes/booking.js";
import { paymentRoutes } from "./routes/payment.js";
import { webhookRoutes } from "./routes/webhook.js";

// ============================================
// Server Setup
// ============================================

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    transport:
      env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: { colorize: true },
          }
        : undefined,
  },
  trustProxy: true,
});

// ============================================
// Plugins
// ============================================

// CORS
await fastify.register(cors, {
  origin: env.NODE_ENV === "production" ? env.NEXT_PUBLIC_BASE_URL : true,
  credentials: true,
});

// Security headers
await fastify.register(helmet, {
  contentSecurityPolicy: false, // Handled by Next.js
});

// Global rate limiting
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  redis,
  keyGenerator: (request) => {
    return request.ip;
  },
});

// ============================================
// Health Check
// ============================================

fastify.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// ============================================
// API Routes
// ============================================

await fastify.register(vehicleRoutes, { prefix: "/api/vehicle" });
await fastify.register(quoteRoutes, { prefix: "/api/quote" });
await fastify.register(bookingRoutes, { prefix: "/api/booking" });
await fastify.register(paymentRoutes, { prefix: "/api/payment" });
await fastify.register(webhookRoutes, { prefix: "/api/webhook" });

// ============================================
// Error Handler
// ============================================

fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  // Don't expose internal errors in production
  const message =
    env.NODE_ENV === "production" && error.statusCode === 500
      ? "Internal server error"
      : error.message;

  reply.status(error.statusCode || 500).send({
    success: false,
    error: message,
  });
});

// ============================================
// Cleanup Job (runs every minute)
// ============================================

let cleanupInterval: NodeJS.Timeout;

function startCleanupJob() {
  cleanupInterval = setInterval(async () => {
    try {
      await cleanupExpiredHolds();
    } catch (error) {
      fastify.log.error("Cleanup job failed:", error);
    }
  }, 60 * 1000);
}

// ============================================
// Graceful Shutdown
// ============================================

async function shutdown() {
  fastify.log.info("Shutting down...");

  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }

  await fastify.close();
  await redis.quit();

  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// ============================================
// Start Server
// ============================================

async function start() {
  try {
    await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });

    startCleanupJob();

    fastify.log.info(`Server running on http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

start();

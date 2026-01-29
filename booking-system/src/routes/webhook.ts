/**
 * Webhook Routes
 * POST /api/webhook/stripe - Stripe webhook handler
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { constructWebhookEvent, handleWebhookEvent } from "../services/stripe.js";

// ============================================
// Routes
// ============================================

export async function webhookRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/webhook/stripe
   * Handle Stripe webhook events
   * 
   * Note: This route needs raw body parsing for signature verification
   */
  fastify.post(
    "/stripe",
    {
      config: {
        rawBody: true,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const signature = request.headers["stripe-signature"] as string;

      if (!signature) {
        return reply.status(400).send({
          success: false,
          error: "Missing stripe-signature header",
        });
      }

      // Get raw body for signature verification
      const rawBody = (request as any).rawBody || request.body;

      if (!rawBody) {
        return reply.status(400).send({
          success: false,
          error: "Missing request body",
        });
      }

      try {
        // Verify webhook signature
        const event = constructWebhookEvent(
          typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody),
          signature
        );

        // Handle the event
        const result = await handleWebhookEvent(event);

        if (!result.success) {
          fastify.log.error(`Webhook handler failed: ${result.error}`);
          // Still return 200 to prevent Stripe retries for handler errors
        }

        return reply.send({ received: true });
      } catch (error: any) {
        fastify.log.error(`Webhook signature verification failed: ${error.message}`);
        return reply.status(400).send({
          success: false,
          error: "Webhook signature verification failed",
        });
      }
    }
  );
}

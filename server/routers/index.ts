import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import {
  getApprovedTestimonials,
  getActiveServiceAreas,
  getPublishedBlogPosts,
  getBlogPostBySlug,
  getChatConversationBySessionId,
  createChatConversation,
  updateChatConversation,
} from "../../db";
import { reportsRouter } from "./reports";
import { vehicleRouter } from "./vehicle";
import { authRouter } from "./auth";
import { serviceHistoryRouter } from "./service-history";
import { confirmationRouter } from "./confirmation";
import { prepaidBookingRouter } from "./prepaid-booking";

/**
 * Notification helper (stub - implement with actual notification service)
 */
// notifyOwner and notifyCustomer are legacy stubs, now using email utils directly or updated stubs
async function notifyOwner(data: { title: string; content: string }) {
  console.log(`[Notification to Owner] ${data.title}: ${data.content}`);
}

async function notifyCustomer(email: string, data: { title: string; content: string }) {
  console.log(`[Notification to Customer (${email})] ${data.title}: ${data.content}`);
}

/**
 * Main application router combining all sub-routers
 */
export const appRouter = router({
  auth: authRouter,

  /**
   * Vehicle lookup (rego -> make/model/year)
   */
  vehicle: vehicleRouter,

  /**
   * Service History
   */
  serviceHistory: serviceHistoryRouter,

  /**
   * Booking confirmation (post-payment)
   */
  confirmation: confirmationRouter,

  /**
   * Quote requests
   */
  quotes: router({
    submit: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        vehicleMake: z.string().optional(),
        vehicleModel: z.string().optional(),
        vehicleYear: z.number().optional(),
        serviceType: z.string().min(1),
        suburb: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        void input;
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Quote requests are handled via email only and are not available through the API.",
        });
      }),
    list: adminProcedure.query(async () => {
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Quote requests are handled via email only and are not available through the API.",
      });
    }),
  }),

  /**
   * Testimonials
   */
  testimonials: router({
    list: publicProcedure.query(async () => {
      return await getApprovedTestimonials();
    }),
  }),

  /**
   * Service areas
   */
  serviceAreas: router({
    list: publicProcedure.query(async () => {
      return await getActiveServiceAreas();
    }),
  }),

  /**
   * Blog posts
   */
  blog: router({
    list: publicProcedure.query(async () => {
      return await getPublishedBlogPosts();
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await getBlogPostBySlug(input.slug);
      }),
  }),

  /**
   * Bookings
   */
  bookings: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        vehicleMake: z.string().min(1),
        vehicleModel: z.string().min(1),
        vehicleYear: z.number(),
        vehicleRego: z.string().optional(),
        serviceType: z.string().min(1),
        servicePackage: z.string().optional(),
        appointmentDate: z.date(),
        appointmentTime: z.string(),
        suburb: z.string().min(1),
        address: z.string().min(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        void input;
        void ctx;
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Bookings are handled via Mechanic Desk and are not available through the API.",
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      void ctx;
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Bookings are handled via Mechanic Desk and are not available through the API.",
      });
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        void input;
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Bookings are handled via Mechanic Desk and are not available through the API.",
        });
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]),
        adminNotes: z.string().optional(),
        estimatedCost: z.number().optional(),
        actualCost: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        void input;
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Bookings are handled via Mechanic Desk and are not available through the API.",
        });
      }),
  }),

  /**
   * Chat conversations (AI chatbot)
   */
  chat: router({
    getConversation: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conversation = await getChatConversationBySessionId(input.sessionId);
        if (!conversation) {
          return { messages: [] };
        }
        return {
          messages: JSON.parse(conversation.messages),
        };
      }),

    sendMessage: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        let conversation = await getChatConversationBySessionId(input.sessionId);

        const userMessage = {
          role: "user",
          content: input.message,
          timestamp: new Date().toISOString(),
        };

        // Simple AI response (replace with actual AI integration)
        const aiResponse = generateChatResponse(input.message);

        if (!conversation) {
          const messages = [userMessage, aiResponse];
          await createChatConversation({
            sessionId: input.sessionId,
            messages: JSON.stringify(messages),
          });
        } else {
          const messages = JSON.parse(conversation.messages);
          messages.push(userMessage, aiResponse);
          await updateChatConversation(input.sessionId, JSON.stringify(messages));
        }

        return { message: aiResponse.content };
      }),
  }),

  /**
   * Inspection reports
   */
  reports: reportsRouter,

  /**
   * Prepaid booking system
   */
  prepaidBooking: prepaidBookingRouter,
});

/**
 * Simple chat response generator (replace with OpenAI or similar)
 */
function generateChatResponse(message: string) {
  const lowerMessage = message.toLowerCase();

  let response = "Thanks for your message! I'm the Mobile Autoworks virtual assistant. For specific inquiries, pricing, or to book a job, please use our 'Get a Quote' form or call Chris directly at 027 642 1824.";

  if (lowerMessage.includes("service") || lowerMessage.includes("offer") || lowerMessage.includes("what do you do")) {
    response = "We provide a comprehensive range of mobile mechanical services across West Auckland, including:\n\n" +
      "• Mobile Diagnostics ($140 callout & scan)\n" +
      "• General Servicing (Bronze, Silver, & Gold packages)\n" +
      "• Brake & Rotor Repairs\n" +
      "• Suspension & Steering\n" +
      "• Pre-Purchase Inspections ($150 deposit)\n" +
      "• WOF Remedial Repairs (we fix what the inspector failed!)\n\n" +
      "All work is done at your home or workplace for maximum convenience!";
  } else if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much")) {
    response = "Our pricing is transparent and competitive. \n\n" +
      "• Diagnostics: $140 flat fee for mobile scan and fault finding.\n" +
      "• Pre-Purchase Inspections: $150 deposit to secure the booking.\n" +
      "• Servicing: Varies by package and vehicle.\n\n" +
      "For a specific quote for your vehicle, please use our 'Get a Quote' form or call 027 642 1824 and we'll give you an estimate over the phone.";
  } else if (lowerMessage.includes("area") || lowerMessage.includes("location") || lowerMessage.includes("cover") || lowerMessage.includes("west auckland")) {
    response = "We are 100% mobile and service all of West Auckland, including:\n\n" +
      "Massey, West Harbour, Te Atatū, Henderson, Whenuapai, Hobsonville, Kumeu, Huapai, Riverhead, Taupaki, Swanson, Ranui, Glendene, and Muriwai.\n\n" +
      "We come to your home or workplace!";
  } else if (lowerMessage.includes("book") || lowerMessage.includes("appointment") || lowerMessage.includes("schedule")) {
    response = "Booking is easy! You can:\n\n" +
      "1. Use our 'Book Now' button to select a time and pay your deposit online.\n" +
      "2. Fill out the 'Get a Quote' form if you have a specific issue.\n" +
      "3. Call or text Chris at 027 642 1824.\n\n" +
      "Which would you prefer?";
  } else if (lowerMessage.includes("wof") || lowerMessage.includes("warrant")) {
    response = "While we don't issue WOFs ourselves, we specialize in 'WOF Remedial Repairs'. This means if your car failed its WOF, we come to you and fix everything on the fail sheet so you can get your sticker on the re-check without leaving home!";
  } else if (lowerMessage.includes("diagnostics") || lowerMessage.includes("scan") || lowerMessage.includes("light") || lowerMessage.includes("engine")) {
    response = "Our mobile diagnostic service is $140. This includes a full system scan using professional equipment at your location, clear explanation of the faults, and a plan for repair. It's the best way to deal with 'Check Engine' lights or mystery noises!";
  } else if (lowerMessage.includes("who is chris") || lowerMessage.includes("owner") || lowerMessage.includes("about")) {
    response = "Mobile Autoworks is owned and operated by Chris, a qualified and experienced mobile mechanic dedicated to providing honest, transparent, and convenient car repairs for the West Auckland community.";
  }

  return {
    role: "assistant",
    content: response,
    timestamp: new Date().toISOString(),
  };
}

export type AppRouter = typeof appRouter;

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getServiceHistoryByUserId, createServiceHistory } from "../../db";

export const serviceHistoryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getServiceHistoryByUserId((ctx.user as any).id);
  }),
  
  create: adminProcedure
    .input(z.object({
      bookingId: z.number(),
      userId: z.number().optional(),
      serviceDate: z.string().transform((str) => new Date(str)), // Accept ISO string from frontend
      serviceType: z.string(),
      vehicleMake: z.string(),
      vehicleModel: z.string(),
      vehicleRego: z.string().optional(),
      workPerformed: z.string(),
      partsUsed: z.string().optional(),
      totalCost: z.number(),
      nextServiceDue: z.string().optional().transform((str) => str ? new Date(str) : undefined),
      invoiceUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await createServiceHistory(input);
      return { success: true };
    }),
});

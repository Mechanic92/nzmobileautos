import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import {
  createInspectionReport,
  getInspectionReportByBookingId,
  updateInspectionReport,
  getInspectionReportByPublicToken,
  getBookingById,
} from "../../db";
import { createDefaultPrePurchaseReport, InspectionReportDataV1 } from "../../shared/types/inspection";

/**
 * Zod schema for validating inspection report data updates
 */
const inspectionPhotoSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().optional(),
});

const inspectionItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.enum(["OK", "Attention Soon", "Requires Repair", "N/A"]),
  comment: z.string().optional(),
  photos: z.array(inspectionPhotoSchema),
});

const inspectionSectionSchema = z.object({
  key: z.string(),
  title: z.string(),
  items: z.array(inspectionItemSchema),
});

const inspectionReportDataSchema = z.object({
  reportType: z.enum(["pre_purchase", "service"]),
  vehicle: z.object({
    make: z.string(),
    model: z.string(),
    year: z.number(),
    rego: z.string().optional(),
    kms: z.number().optional(),
    vin: z.string().optional(),
  }),
  customer: z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
  inspectionDate: z.string(),
  sections: z.array(inspectionSectionSchema),
  summary: z.object({
    overallCondition: z.enum(["Excellent", "Good", "Fair", "Poor"]),
    recommendation: z.enum(["Recommend purchase", "Caution", "Not recommended"]),
    overallComment: z.string().optional(),
  }),
});

/**
 * Reports router - handles inspection report CRUD operations
 */
export const reportsRouter = router({
  /**
   * Create a new report for a booking, or return existing one if already created
   */
  createOrGetForBooking: protectedProcedure
    .input(z.object({
      bookingId: z.number(),
      type: z.enum(["pre_purchase", "service"]).default("pre_purchase"),
    }))
    .mutation(async ({ input }) => {
      // Check if report already exists for this booking
      const existing = await getInspectionReportByBookingId(input.bookingId);
      if (existing) {
        return {
          id: existing.id,
          publicToken: existing.publicToken,
          data: JSON.parse(existing.data) as InspectionReportDataV1,
          isNew: false,
        };
      }

      // Get booking details to pre-fill report
      const booking = await getBookingById(input.bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Create default report structure
      const reportData = createDefaultPrePurchaseReport(
        {
          make: booking.vehicleMake,
          model: booking.vehicleModel,
          year: booking.vehicleYear,
          rego: booking.vehicleRego || undefined,
        },
        {
          name: booking.customerName,
          email: booking.email,
          phone: booking.phone,
        },
        new Date().toISOString().split("T")[0]
      );

      // Insert into database
      await createInspectionReport({
        bookingId: input.bookingId,
        type: input.type,
        data: JSON.stringify(reportData),
      });

      // Fetch the newly created report to get its ID and token
      const newReport = await getInspectionReportByBookingId(input.bookingId);
      if (!newReport) {
        throw new Error("Failed to create report");
      }

      return {
        id: newReport.id,
        publicToken: newReport.publicToken,
        data: reportData,
        isNew: true,
      };
    }),

  /**
   * Update an existing report's data (for autosave)
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: inspectionReportDataSchema,
    }))
    .mutation(async ({ input }) => {
      await updateInspectionReport(input.id, JSON.stringify(input.data));
      return { success: true };
    }),

  /**
   * Get a report by booking ID (for authenticated users)
   */
  getForBooking: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input }) => {
      const report = await getInspectionReportByBookingId(input.bookingId);
      if (!report) {
        return null;
      }
      return {
        id: report.id,
        bookingId: report.bookingId,
        type: report.type,
        publicToken: report.publicToken,
        data: JSON.parse(report.data) as InspectionReportDataV1,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      };
    }),

  /**
   * Get a report by public token (for customer-facing view, no auth required)
   */
  getPublic: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const report = await getInspectionReportByPublicToken(input.token);
      if (!report) {
        return null;
      }
      return {
        id: report.id,
        type: report.type,
        data: JSON.parse(report.data) as InspectionReportDataV1,
        createdAt: report.createdAt,
      };
    }),

  /**
   * List all reports (admin only)
   */
  list: adminProcedure.query(async () => {
    // For now, return empty array - can implement full listing later
    return [];
  }),
});

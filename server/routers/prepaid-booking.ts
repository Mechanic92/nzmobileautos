/**
 * Prepaid Booking Router for Mobile Autoworks NZ
 * Handles booking creation, Stripe checkout, and validation
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../_core/trpc';
import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import {
  validateBookingTime,
  validateBookingDateRange,
  isWeekend,
  getAvailableTimeSlots,
  getNextAvailableDate,
  getFormattedBusinessHours,
  BUSINESS_HOURS_CONFIG,
} from '../utils/business-hours';
import {
  SERVICES,
  ADD_ONS,
  calculateBookingTotal,
  hasAddOnsRequiringApproval,
  getAllServices,
  getAllAddOns,
  BUSINESS_INFO,
  CANCELLATION_POLICY,
  PREPARATION_INSTRUCTIONS,
  TERMS_AGREEMENT,
} from '../utils/booking-config';
import { isValidNZPhone } from '../utils/sms';
import type { ServiceType, AddOnType, BookingStatus, PaymentStatus } from '../../shared/types/booking';

// Stripe client
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  : null;

const APP_URL = process.env.PUBLIC_APP_URL || 'http://localhost:5173';

// Input validation schemas
const ServiceTypeSchema = z.enum(['mobile_diagnostic', 'pre_purchase_inspection']);
const AddOnTypeSchema = z.enum(['priority_same_day', 'outside_area_surcharge', 'after_hours']);

const DiagnosticFieldsSchema = z.object({
  wontStart: z.boolean().default(false),
  warningLights: z.boolean().default(false),
  batteryAge: z.string().optional(),
});

const PPIFieldsSchema = z.object({
  sellerAddress: z.string().optional(),
  sellerContact: z.string().optional(),
  urgency: z.enum(['standard', 'urgent', 'flexible']).default('standard'),
  reportDeliveryEmail: z.string().email().optional(),
});

const BookingFormSchema = z.object({
  // Required fields
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(10, 'Please enter a complete address'),
  vehicleRego: z.string().min(1, 'Vehicle registration is required').max(10),
  notes: z.string().min(10, 'Please describe the issue or reason for service (min 10 characters)'),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  policyAgreed: z.boolean().refine(val => val === true, 'You must agree to the terms'),

  // Service selection
  serviceType: ServiceTypeSchema,

  // Conditional fields
  diagnosticFields: DiagnosticFieldsSchema.optional(),
  ppiFields: PPIFieldsSchema.optional(),

  // Add-ons
  addOns: z.array(AddOnTypeSchema).default([]),

  // Weekend specific
  weekendTimeWindow: z.string().optional(),
});

/**
 * Auckland address validation (basic check)
 */
function isAucklandAddress(address: string): boolean {
  const aucklandKeywords = [
    'auckland', 'west auckland', 'north shore', 'east auckland', 'south auckland',
    'henderson', 'massey', 'te atatu', 'hobsonville', 'kumeu', 'huapai',
    'whenuapai', 'swanson', 'ranui', 'glendene', 'new lynn', 'avondale',
    'mt albert', 'mt eden', 'ponsonby', 'grey lynn', 'parnell', 'newmarket',
    'remuera', 'epsom', 'onehunga', 'penrose', 'mt wellington', 'panmure',
    'glen innes', 'st heliers', 'mission bay', 'kohimarama', 'orakei',
    'devonport', 'takapuna', 'milford', 'browns bay', 'albany', 'glenfield',
    'birkenhead', 'northcote', 'manukau', 'papakura', 'pukekohe', 'botany',
    'howick', 'pakuranga', 'flat bush', 'mangere', 'otahuhu', 'papatoetoe',
  ];
  
  const lowerAddress = address.toLowerCase();
  return aucklandKeywords.some(keyword => lowerAddress.includes(keyword)) ||
         lowerAddress.includes('nz') ||
         lowerAddress.includes('new zealand');
}

/**
 * Generate a unique booking reference
 */
function generateBookingRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(4).toUpperCase();
  return `MA-${timestamp}-${random}`;
}

export const prepaidBookingRouter = router({
  /**
   * Get booking configuration (services, add-ons, business hours)
   */
  getConfig: publicProcedure.query(() => {
    return {
      services: getAllServices(),
      addOns: getAllAddOns(),
      businessHours: getFormattedBusinessHours(),
      businessInfo: BUSINESS_INFO,
      cancellationPolicy: CANCELLATION_POLICY,
      preparationInstructions: PREPARATION_INSTRUCTIONS,
      termsAgreement: TERMS_AGREEMENT,
    };
  }),

  /**
   * Get available time slots for a specific date
   */
  getTimeSlots: publicProcedure
    .input(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .query(async ({ input }) => {
      const [year, month, day] = input.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Check if weekend
      if (isWeekend(date)) {
        return {
          isWeekend: true,
          slots: [],
          message: BUSINESS_HOURS_CONFIG.weekendMessage,
        };
      }

      // TODO: Get actual booking count from database
      const existingBookingsCount = 0;
      const slots = getAvailableTimeSlots(date, existingBookingsCount);

      return {
        isWeekend: false,
        slots,
        message: null,
      };
    }),

  /**
   * Get the next available booking date
   */
  getNextAvailableDate: publicProcedure.query(() => {
    return {
      date: getNextAvailableDate(),
    };
  }),

  /**
   * Calculate price for a booking
   */
  calculatePrice: publicProcedure
    .input(z.object({
      serviceType: ServiceTypeSchema,
      addOns: z.array(AddOnTypeSchema).default([]),
    }))
    .query(({ input }) => {
      return calculateBookingTotal(input.serviceType as ServiceType, input.addOns as AddOnType[]);
    }),

  /**
   * Validate booking data (pre-submission check)
   */
  validateBooking: publicProcedure
    .input(BookingFormSchema)
    .mutation(({ input }) => {
      const errors: string[] = [];

      // Validate phone number
      if (!isValidNZPhone(input.phone)) {
        errors.push('Please enter a valid NZ phone number');
      }

      // Validate Auckland address
      if (!isAucklandAddress(input.address)) {
        errors.push('Service is currently only available in the Auckland region');
      }

      // Validate booking time
      const [year, month, day] = input.preferredDate.split('-').map(Number);
      const bookingDate = new Date(year, month - 1, day);
      const isWeekendBooking = isWeekend(bookingDate);

      const timeValidation = validateBookingTime(
        input.preferredDate,
        input.preferredTime,
        isWeekendBooking
      );
      errors.push(...timeValidation.errors);

      // Validate date range
      const dateRangeValidation = validateBookingDateRange(input.preferredDate);
      errors.push(...dateRangeValidation.errors);

      // Validate service-specific fields
      if (input.serviceType === 'mobile_diagnostic' && !input.diagnosticFields) {
        // Diagnostic fields are optional but recommended
      }

      if (input.serviceType === 'pre_purchase_inspection' && !input.ppiFields) {
        // PPI fields are optional but recommended
      }

      // Weekend booking requires time window
      if (isWeekendBooking && !input.weekendTimeWindow) {
        errors.push('Please provide your preferred time window for weekend bookings');
      }

      return {
        valid: errors.length === 0,
        errors,
        isWeekendBooking,
        requiresApproval: isWeekendBooking || hasAddOnsRequiringApproval(input.addOns as AddOnType[]),
      };
    }),

  /**
   * Create booking and initiate Stripe Checkout
   */
  createCheckoutSession: publicProcedure
    .input(BookingFormSchema)
    .mutation(async ({ input }) => {
      // Server-side validation (cannot be bypassed)
      const errors: string[] = [];

      // Validate phone
      if (!isValidNZPhone(input.phone)) {
        errors.push('Invalid NZ phone number');
      }

      // Validate Auckland address
      if (!isAucklandAddress(input.address)) {
        errors.push('Service only available in Auckland region');
      }

      // Validate booking time
      const [year, month, day] = input.preferredDate.split('-').map(Number);
      const bookingDate = new Date(year, month - 1, day);
      const isWeekendBooking = isWeekend(bookingDate);

      const timeValidation = validateBookingTime(
        input.preferredDate,
        input.preferredTime,
        isWeekendBooking
      );
      errors.push(...timeValidation.errors);

      // Validate date range
      const dateRangeValidation = validateBookingDateRange(input.preferredDate);
      errors.push(...dateRangeValidation.errors);

      if (errors.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: errors.join('; '),
        });
      }

      // Calculate total
      const pricing = calculateBookingTotal(
        input.serviceType as ServiceType,
        input.addOns as AddOnType[]
      );

      // Generate booking reference
      const bookingRef = generateBookingRef();

      // Determine booking status
      const requiresApproval = isWeekendBooking || hasAddOnsRequiringApproval(input.addOns as AddOnType[]);
      const initialStatus: BookingStatus = requiresApproval ? 'pending_weekend_approval' : 'pending';

      // Check Stripe availability
      if (!stripe) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payment system not configured. Please contact support.',
        });
      }

      // Get service details
      const service = SERVICES[input.serviceType as ServiceType];

      // Create Stripe Checkout Session with all payment methods
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          customer_email: input.email,
          
          // Enable additional payment methods
          payment_method_options: {
            card: {
              setup_future_usage: undefined, // Don't save card
            },
          },

          line_items: [
            {
              price_data: {
                currency: 'nzd',
                product_data: {
                  name: service.name,
                  description: `Booking Ref: ${bookingRef}`,
                  metadata: {
                    serviceType: input.serviceType,
                    bookingRef,
                  },
                },
                unit_amount: pricing.total * 100, // Convert to cents
              },
              quantity: 1,
            },
          ],

          // Store all booking data in metadata
          metadata: {
            bookingRef,
            serviceType: input.serviceType,
            customerName: input.customerName,
            phone: input.phone,
            email: input.email,
            address: input.address,
            vehicleRego: input.vehicleRego,
            notes: input.notes.substring(0, 500), // Stripe metadata limit
            preferredDate: input.preferredDate,
            preferredTime: input.preferredTime,
            addOns: JSON.stringify(input.addOns),
            isWeekendBooking: isWeekendBooking.toString(),
            weekendTimeWindow: input.weekendTimeWindow || '',
            diagnosticFields: input.diagnosticFields ? JSON.stringify(input.diagnosticFields) : '',
            ppiFields: input.ppiFields ? JSON.stringify(input.ppiFields) : '',
            initialStatus,
            totalAmountCents: (pricing.total * 100).toString(),
          },

          // Redirect URLs
          success_url: `${APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}&ref=${bookingRef}`,
          cancel_url: `${APP_URL}/booking/cancel?ref=${bookingRef}`,

          // Billing address collection
          billing_address_collection: 'auto',

          // Phone number collection
          phone_number_collection: {
            enabled: true,
          },

          // Expiry (30 minutes)
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60,

          // Allow promotion codes
          allow_promotion_codes: true,

          // Locale
          locale: 'en',
        });

        return {
          success: true,
          checkoutUrl: session.url,
          sessionId: session.id,
          bookingRef,
          totalAmount: pricing.total,
          isWeekendBooking,
          requiresApproval,
        };
      } catch (error: any) {
        console.error('[Stripe] Checkout session creation failed:', error.message);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment session. Please try again.',
        });
      }
    }),

  /**
   * Get booking by reference (for success page)
   */
  getByRef: publicProcedure
    .input(z.object({
      bookingRef: z.string(),
      sessionId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // In production, fetch from database
      // For now, verify with Stripe if session ID provided
      if (input.sessionId && stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(input.sessionId);
          
          if (session.metadata?.bookingRef === input.bookingRef) {
            return {
              found: true,
              bookingRef: input.bookingRef,
              status: session.payment_status === 'paid' ? 'confirmed' : 'pending',
              paymentStatus: session.payment_status,
              customerName: session.metadata.customerName,
              email: session.metadata.email,
              serviceType: session.metadata.serviceType,
              preferredDate: session.metadata.preferredDate,
              preferredTime: session.metadata.preferredTime,
              address: session.metadata.address,
              vehicleRego: session.metadata.vehicleRego,
              totalAmount: parseInt(session.metadata.totalAmountCents || '0', 10) / 100,
              isWeekendBooking: session.metadata.isWeekendBooking === 'true',
            };
          }
        } catch (error) {
          console.error('[Booking] Failed to retrieve session:', error);
        }
      }

      return {
        found: false,
        bookingRef: input.bookingRef,
      };
    }),

  /**
   * Admin: List all bookings
   */
  listAll: adminProcedure
    .input(z.object({
      status: z.enum(['all', 'pending', 'confirmed', 'pending_weekend_approval', 'completed', 'cancelled']).default('all'),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      // TODO: Implement database query
      return {
        bookings: [],
        total: 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Admin: Update booking status
   */
  updateStatus: adminProcedure
    .input(z.object({
      bookingRef: z.string(),
      status: z.enum(['confirmed', 'pending_weekend_approval', 'in_progress', 'completed', 'cancelled']),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement database update
      return {
        success: true,
        bookingRef: input.bookingRef,
        newStatus: input.status,
      };
    }),

  /**
   * Admin: Approve weekend booking
   */
  approveWeekendBooking: adminProcedure
    .input(z.object({
      bookingRef: z.string(),
      confirmedTime: z.string(),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement approval logic
      // - Update booking status to confirmed
      // - Send confirmation email to customer
      // - Update calendar
      return {
        success: true,
        bookingRef: input.bookingRef,
        confirmedTime: input.confirmedTime,
      };
    }),
});

export type PrepaidBookingRouter = typeof prepaidBookingRouter;

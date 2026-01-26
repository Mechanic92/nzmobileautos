/**
 * Shared types for the prepaid booking system
 * Mobile Autoworks NZ
 */

// Service types
export type ServiceType = 'mobile_diagnostic' | 'pre_purchase_inspection';

export interface ServiceConfig {
  id: ServiceType;
  name: string;
  description: string;
  priceNZD: number;
  isDeposit: boolean;
  durationMinutes: number;
}

// Add-on types
export type AddOnType = 'priority_same_day' | 'outside_area_surcharge' | 'after_hours';

export interface AddOnConfig {
  id: AddOnType;
  name: string;
  description: string;
  priceNZD: number;
  requiresApproval: boolean;
}

// Booking status
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'pending_weekend_approval' | 'in_progress' | 'completed' | 'cancelled';

// Form data for diagnostic service
export interface DiagnosticFields {
  wontStart: boolean;
  warningLights: boolean;
  batteryAge?: string;
}

// Form data for PPI service
export interface PPIFields {
  sellerAddress?: string;
  sellerContact?: string;
  urgency: 'standard' | 'urgent' | 'flexible';
  reportDeliveryEmail?: string;
}

// Complete booking form data
export interface BookingFormData {
  // Required fields
  customerName: string;
  phone: string;
  email: string;
  address: string;
  vehicleRego: string;
  notes: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:mm
  policyAgreed: boolean;

  // Service selection
  serviceType: ServiceType;

  // Conditional fields based on service
  diagnosticFields?: DiagnosticFields;
  ppiFields?: PPIFields;

  // Add-ons
  addOns: AddOnType[];

  // Weekend specific
  weekendTimeWindow?: string;
}

// Booking record (database)
export interface PrepaidBooking {
  id: string; // UUID
  createdAt: Date;
  serviceType: ServiceType;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  vehicleRego: string;
  vehicleDetails?: string; // JSON: make, model, year from rego lookup
  notes: string;
  preferredDate: string;
  preferredTime: string;
  addOns: string; // JSON array of AddOnType
  totalAmountCents: number;
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  adminNotes?: string;
  
  // Service-specific data
  serviceSpecificData?: string; // JSON: DiagnosticFields | PPIFields
  
  // Weekend booking
  isWeekendBooking: boolean;
  weekendTimeWindow?: string;
}

// Business hours configuration
export interface BusinessHoursConfig {
  timezone: string;
  weekdays: {
    openTime: string; // HH:mm
    closeTime: string; // HH:mm
    lastBookingTime: string; // HH:mm
  };
  defaultJobDurationMinutes: number;
  bufferBetweenBookingsMinutes: number;
  maxBookingsPerDay: number;
  weekendMessage: string;
}

// Time slot for booking
export interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
  reason?: string;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Stripe checkout response
export interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
}

// Notification payload
export interface OwnerNotification {
  type: 'sms' | 'email';
  bookingRef: string;
  serviceType: string;
  amountPaid: number;
  customerName: string;
  phone: string;
  address: string;
  vehicleRego: string;
  preferredDate: string;
  preferredTime: string;
}

export interface CustomerConfirmationEmail {
  bookingRef: string;
  customerName: string;
  email: string;
  serviceType: string;
  pricePaid: number;
  preferredDate: string;
  preferredTime: string;
  address: string;
  vehicleRego: string;
  notes: string;
  isWeekendPendingApproval: boolean;
  preparationInstructions: string[];
  cancellationPolicy: string;
  contactPhone: string;
  contactEmail: string;
}

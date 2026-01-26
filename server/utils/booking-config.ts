/**
 * Booking Configuration for Mobile Autoworks NZ
 * Service pricing, add-ons, and business rules
 */

import { ServiceConfig, AddOnConfig, ServiceType, AddOnType } from '../../shared/types/booking';

// Service configurations
export const SERVICES: Record<ServiceType, ServiceConfig> = {
  mobile_diagnostic: {
    id: 'mobile_diagnostic',
    name: 'Mobile Diagnostic (incl call-out)',
    description: 'Professional on-site vehicle diagnostic scan and fault finding. Includes call-out fee.',
    priceNZD: 140,
    isDeposit: false, // Full payment upfront
    durationMinutes: 90,
  },
  pre_purchase_inspection: {
    id: 'pre_purchase_inspection',
    name: 'Pre-Purchase Inspection',
    description: 'Comprehensive vehicle inspection before purchase. Full mechanical and visual assessment.',
    priceNZD: parseInt(process.env.PPI_PRICE_NZD || '180', 10),
    isDeposit: false, // Full payment upfront
    durationMinutes: 120,
  },
};

// Add-on configurations
export const ADD_ONS: Record<AddOnType, AddOnConfig> = {
  priority_same_day: {
    id: 'priority_same_day',
    name: 'Priority Same-Day Booking',
    description: 'Jump the queue for same-day service (subject to availability)',
    priceNZD: parseInt(process.env.ADDON_PRIORITY_PRICE_NZD || '50', 10),
    requiresApproval: false,
  },
  outside_area_surcharge: {
    id: 'outside_area_surcharge',
    name: 'Outside Core Service Area',
    description: 'Extended travel surcharge for locations outside West Auckland',
    priceNZD: parseInt(process.env.ADDON_OUTSIDE_AREA_PRICE_NZD || '30', 10),
    requiresApproval: false,
  },
  after_hours: {
    id: 'after_hours',
    name: 'After-Hours Service',
    description: 'Service outside standard business hours (requires admin approval)',
    priceNZD: parseInt(process.env.ADDON_AFTER_HOURS_PRICE_NZD || '75', 10),
    requiresApproval: true,
  },
};

/**
 * Calculate total price for a booking
 */
export function calculateBookingTotal(
  serviceType: ServiceType,
  addOns: AddOnType[]
): {
  servicePrice: number;
  addOnsTotal: number;
  total: number;
  breakdown: Array<{ name: string; price: number }>;
} {
  const service = SERVICES[serviceType];
  const servicePrice = service.priceNZD;

  const breakdown: Array<{ name: string; price: number }> = [
    { name: service.name, price: servicePrice },
  ];

  let addOnsTotal = 0;
  for (const addOnId of addOns) {
    const addOn = ADD_ONS[addOnId];
    if (addOn) {
      addOnsTotal += addOn.priceNZD;
      breakdown.push({ name: addOn.name, price: addOn.priceNZD });
    }
  }

  return {
    servicePrice,
    addOnsTotal,
    total: servicePrice + addOnsTotal,
    breakdown,
  };
}

/**
 * Get service by ID
 */
export function getService(serviceType: ServiceType): ServiceConfig | undefined {
  return SERVICES[serviceType];
}

/**
 * Get add-on by ID
 */
export function getAddOn(addOnType: AddOnType): AddOnConfig | undefined {
  return ADD_ONS[addOnType];
}

/**
 * Check if any add-ons require approval
 */
export function hasAddOnsRequiringApproval(addOns: AddOnType[]): boolean {
  return addOns.some(id => ADD_ONS[id]?.requiresApproval);
}

/**
 * Get all services for display
 */
export function getAllServices(): ServiceConfig[] {
  return Object.values(SERVICES);
}

/**
 * Get all add-ons for display
 */
export function getAllAddOns(): AddOnConfig[] {
  return Object.values(ADD_ONS);
}

/**
 * Business contact information
 */
export const BUSINESS_INFO = {
  name: 'Mobile Autoworks NZ',
  phone: '027 642 1824',
  email: 'chris@mobileautoworksnz.com',
  location: 'Auckland, New Zealand',
  serviceArea: 'West Auckland and surrounding areas',
  website: process.env.PUBLIC_APP_URL || 'https://mobileautoworksnz.com',
};

/**
 * Cancellation policy text
 */
export const CANCELLATION_POLICY = `
Cancellation Policy:
- Cancellations made 24+ hours before the appointment: Full refund
- Cancellations made 12-24 hours before: 50% refund
- Cancellations made less than 12 hours before: No refund
- No-shows: No refund

To cancel or reschedule, please contact us at ${BUSINESS_INFO.phone} or ${BUSINESS_INFO.email}.
`.trim();

/**
 * Preparation instructions for customers
 */
export const PREPARATION_INSTRUCTIONS = [
  'Ensure the vehicle is accessible at the service address',
  'Have the vehicle keys available',
  'Provide a safe, level working space (driveway or carpark)',
  'If possible, avoid parking on steep inclines',
  'Ensure adequate lighting if booking late afternoon',
  'Have your driver\'s license available for verification',
];

/**
 * Terms and conditions agreement text
 */
export const TERMS_AGREEMENT = `
By proceeding with this booking, I agree to:
- Pay the full service fee upfront to secure my booking
- Provide accurate vehicle and contact information
- Ensure the vehicle is accessible at the specified address and time
- Accept the cancellation policy as stated
- Understand that weekend bookings require admin approval
`.trim();

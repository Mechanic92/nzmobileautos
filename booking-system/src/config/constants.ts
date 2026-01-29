/**
 * Business Constants
 * All pricing, timing, and business rules
 */

// ============================================
// PRICING BANDS (GST-inclusive, in cents)
// ============================================

export const PRICING = {
  BASIC: {
    PETROL: {
      SMALL: 27500,    // <2000cc
      MEDIUM: 29500,   // 2000-3000cc
      LARGE: 32500,    // >3000cc
    },
    DIESEL: {
      SMALL: 30500,    // <2000cc
      MEDIUM: 31500,   // 2000-3000cc
      LARGE: 34500,    // >3000cc
    },
  },
  COMPREHENSIVE: {
    PETROL: {
      SMALL: 38500,    // <2000cc
      MEDIUM: 40500,   // 2000-3000cc
      LARGE: 44500,    // >3000cc
    },
    DIESEL: {
      SMALL: 41500,    // <2000cc
      MEDIUM: 43500,   // 2000-3000cc
      LARGE: 46500,    // >3000cc
    },
  },
} as const;

// ============================================
// EXTRAS (GST-inclusive, in cents)
// ============================================

export const EXTRAS = {
  ENGINE_FLUSH: {
    name: "Engine Flush",
    priceCents: 4900,
    instantPricing: true,
  },
  AIR_FRAGRANCE: {
    name: "Air Fragrance",
    priceCents: 2000,
    instantPricing: true,
  },
  CABIN_FILTER: {
    name: "Cabin Filter Replacement",
    priceCents: 0, // Requires approval
    instantPricing: false,
  },
  SPARK_PLUGS: {
    name: "Spark Plug Replacement",
    priceCents: 0, // Requires approval
    instantPricing: false,
  },
} as const;

// ============================================
// OIL PRICING
// ============================================

export const OIL = {
  INCLUDED_LITRES: 5,
  EXTRA_LITRE_CENTS: 2200, // $22 per extra litre
} as const;

// ============================================
// SERVICE DURATIONS (minutes)
// ============================================

export const SERVICE_DURATION = {
  BASIC: 60,
  COMPREHENSIVE: 120,
} as const;

// ============================================
// BOOKING HOURS
// ============================================

export const BOOKING_HOURS = {
  START_HOUR: 9,
  START_MINUTE: 0,
  END_HOUR: 17,
  END_MINUTE: 0,
  LAST_START_HOUR: 15,
  LAST_START_MINUTE: 30,
  SLOT_INCREMENT_MINUTES: 30,
  TIMEZONE: "Pacific/Auckland",
} as const;

// Working days (0 = Sunday, 6 = Saturday)
export const WORKING_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri

// ============================================
// LABOUR RATE
// ============================================

export const LABOUR = {
  HOURLY_RATE_CENTS: 11000, // $110/hour
} as const;

// ============================================
// GST
// ============================================

export const GST_RATE = 0.15;

// ============================================
// ENGINE SIZE BANDS (cc)
// ============================================

export const ENGINE_BANDS = {
  SMALL_MAX: 2000,
  MEDIUM_MAX: 3000,
} as const;

// ============================================
// FUEL TYPES (normalized)
// ============================================

export const FUEL_TYPES = {
  PETROL: ["PETROL", "GASOLINE", "UNLEADED", "91", "95", "98", "PREMIUM"],
  DIESEL: ["DIESEL", "TURBO DIESEL", "TDI", "CDI", "HDI", "DTEC"],
  HYBRID: ["HYBRID", "PHEV", "PLUG-IN HYBRID"],
  ELECTRIC: ["ELECTRIC", "EV", "BEV"],
} as const;

// ============================================
// PLATE VALIDATION
// ============================================

export const PLATE_REGEX = /^[A-Z0-9]{1,6}$/i;

// ============================================
// SERVICE TYPES
// ============================================

export type ServiceType = "BASIC" | "COMPREHENSIVE";

export const SERVICE_TYPES: Record<ServiceType, { name: string; description: string }> = {
  BASIC: {
    name: "Basic Service",
    description: "Oil & filter change, fluid top-up, safety check",
  },
  COMPREHENSIVE: {
    name: "Comprehensive Service",
    description: "Full service including brakes, suspension, and detailed inspection",
  },
};

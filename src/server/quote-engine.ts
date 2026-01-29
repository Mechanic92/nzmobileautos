/**
 * Instant Quote Engine
 * Calculates pricing for all service types based on vehicle data
 */

import { prisma } from "./prisma";
import { VehicleLookupResult } from "./carjam";
import { nanoid } from "nanoid";

// ============================================
// Types
// ============================================

export type ServicePackageType = 
  | "DIAGNOSTIC"
  | "PPI"
  | "BRONZE_SERVICE"
  | "SILVER_SERVICE"
  | "GOLD_SERVICE"
  | "BRAKE_PADS_FRONT"
  | "BRAKE_PADS_REAR"
  | "BRAKE_PADS_FULL"
  | "BATTERY_REPLACEMENT"
  | "WOF_REPAIRS"
  | "CUSTOM";

export interface QuoteLineItem {
  description: string;
  category: "PARTS" | "LABOUR" | "CALLOUT" | "GST" | "SURCHARGE";
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  partId?: string;
}

export interface QuoteResult {
  success: boolean;
  quoteId?: string;
  publicId?: string;
  
  // Vehicle info
  plate: string;
  vehicleDescription: string;
  
  // Service info
  servicePackage: ServicePackageType;
  serviceName: string;
  serviceDescription: string;
  
  // Pricing breakdown
  lineItems: QuoteLineItem[];
  subtotalCents: number;
  gstCents: number;
  totalCents: number;
  
  // Formatted for display
  totalFormatted: string;
  
  // Validity
  expiresAt: Date;
  validDays: number;
  
  // Warranty
  warrantyMonths: number;
  warrantyKm: number;
  
  // Errors
  error?: string;
  requiresManualQuote?: boolean;
}

// ============================================
// Pricing Constants
// ============================================

const GST_RATE = 0.15;
const QUOTE_VALIDITY_DAYS = 7;

// Hourly labour rate in cents
const LABOUR_RATE_CENTS = 9500; // $95/hr

// Call-out fee
const CALLOUT_FEE_CENTS = 4000; // $40

// Service package configurations
const SERVICE_CONFIGS: Record<ServicePackageType, {
  name: string;
  description: string;
  labourMinutes: number;
  includedItems: string[];
  warrantyMonths: number;
  warrantyKm: number;
  requiresVehicleData: boolean;
}> = {
  DIAGNOSTIC: {
    name: "Mobile Diagnostics",
    description: "Comprehensive OBD2 scan, fault code analysis, live data review, and written report",
    labourMinutes: 60,
    includedItems: [
      "Full ECU scan (engine, transmission, ABS, SRS, body)",
      "Live data stream analysis",
      "Fault code interpretation",
      "Written diagnostic report",
      "Repair recommendations with pricing",
    ],
    warrantyMonths: 0,
    warrantyKm: 0,
    requiresVehicleData: false,
  },
  PPI: {
    name: "Pre-Purchase Inspection",
    description: "Comprehensive 150+ point inspection before you buy",
    labourMinutes: 90,
    includedItems: [
      "Engine bay inspection",
      "Cooling system check",
      "Brake system assessment",
      "Steering & suspension check",
      "Tyre condition & tread depth",
      "Body & paint inspection",
      "Interior & electronics check",
      "Road test",
      "OBD2 diagnostic scan",
      "Detailed PDF report with photos",
    ],
    warrantyMonths: 0,
    warrantyKm: 0,
    requiresVehicleData: false,
  },
  BRONZE_SERVICE: {
    name: "Oil + Filter Change",
    description: "Quality synthetic oil and filter replacement with a essential safety check",
    labourMinutes: 45,
    includedItems: [
      "Engine oil change (premium synthetic blend up to 5L)",
      "Quality oil filter replacement",
      "Sump plug washer replacement",
      "Essential fluid level check & top-up",
      "Tyre pressure check & adjust",
      "Visual safety inspection",
    ],
    warrantyMonths: 6,
    warrantyKm: 10000,
    requiresVehicleData: true,
  },
  SILVER_SERVICE: {
    name: "Basic Service",
    description: "Our standard maintenance service covering all essential safety points",
    labourMinutes: 75,
    includedItems: [
      "Everything in Oil + Filter Service",
      "Comprehensive brake inspection & report",
      "Tyre rotation & condition report",
      "Battery & charging system test",
      "Suspension & steering component check",
      "Cooling system pressure test",
      "Service light reset",
    ],
    warrantyMonths: 6,
    warrantyKm: 10000,
    requiresVehicleData: true,
  },
  GOLD_SERVICE: {
    name: "Comprehensive Service",
    description: "The ultimate service for total peace of mind and maximum vehicle longevity",
    labourMinutes: 120,
    includedItems: [
      "Everything in Basic Service",
      "Air filter inspection & report",
      "Cabin/pollen filter inspection & report",
      "Spark plug inspection (replacement additional)",
      "Transmission & differential fluid check",
      "Brake fluid condition test",
      "Full electronic diagnostic scan",
      "Road test and detailed performance report",
    ],
    warrantyMonths: 6,
    warrantyKm: 10000,
    requiresVehicleData: true,
  },
  BRAKE_PADS_FRONT: {
    name: "Front Brake Pad Replacement",
    description: "Replace front brake pads with quality aftermarket or OEM parts",
    labourMinutes: 60,
    includedItems: [
      "Remove and inspect front brake rotors",
      "Replace front brake pads",
      "Clean and lubricate caliper slides",
      "Bed-in procedure advice",
    ],
    warrantyMonths: 6,
    warrantyKm: 10000,
    requiresVehicleData: true,
  },
  BRAKE_PADS_REAR: {
    name: "Rear Brake Pad Replacement",
    description: "Replace rear brake pads with quality aftermarket or OEM parts",
    labourMinutes: 60,
    includedItems: [
      "Remove and inspect rear brake rotors",
      "Replace rear brake pads",
      "Clean and lubricate caliper slides",
      "Bed-in procedure advice",
    ],
    warrantyMonths: 6,
    warrantyKm: 10000,
    requiresVehicleData: true,
  },
  BRAKE_PADS_FULL: {
    name: "Full Brake Pad Replacement",
    description: "Replace all brake pads (front and rear)",
    labourMinutes: 105,
    includedItems: [
      "Remove and inspect all brake rotors",
      "Replace front and rear brake pads",
      "Clean and lubricate all caliper slides",
      "Brake fluid level check",
      "Bed-in procedure advice",
    ],
    warrantyMonths: 6,
    warrantyKm: 10000,
    requiresVehicleData: true,
  },
  BATTERY_REPLACEMENT: {
    name: "Battery Replacement",
    description: "Supply and fit new battery with correct specifications",
    labourMinutes: 30,
    includedItems: [
      "Battery health test",
      "Remove old battery",
      "Clean terminals",
      "Install new battery",
      "System reset if required",
      "Old battery disposal",
    ],
    warrantyMonths: 24,
    warrantyKm: 0,
    requiresVehicleData: true,
  },
  WOF_REPAIRS: {
    name: "WOF Remedial Repairs",
    description: "Fix items that failed your WOF inspection",
    labourMinutes: 0, // Variable
    includedItems: [
      "Review WOF failure sheet",
      "Repair failed items",
      "Provide documentation for re-inspection",
    ],
    warrantyMonths: 6,
    warrantyKm: 10000,
    requiresVehicleData: true,
  },
  CUSTOM: {
    name: "Custom Quote",
    description: "Custom repair or service quote",
    labourMinutes: 0,
    includedItems: [],
    warrantyMonths: 6,
    warrantyKm: 10000,
    requiresVehicleData: true,
  },
};

// Oil pricing by engine size
const OIL_PRICE_PER_LITRE_CENTS = 2500; // $25/L for quality synthetic

// Default oil capacities by engine size (if not in lookup)
function estimateOilCapacity(engineCc?: number): number {
  if (!engineCc) return 4.5; // Default
  if (engineCc <= 1300) return 3.5;
  if (engineCc <= 1800) return 4.0;
  if (engineCc <= 2500) return 4.5;
  if (engineCc <= 3500) return 5.5;
  return 6.5;
}

// ============================================
// Parts Lookup
// ============================================

interface PartMatch {
  id: string;
  sku: string;
  name: string;
  category: string;
  priceCents: number; // After markup
}

async function findPartsForVehicle(
  vehicle: VehicleLookupResult,
  categories: string[]
): Promise<Map<string, PartMatch>> {
  const results = new Map<string, PartMatch>();

  // For now, use default parts pricing
  // In production, query the Parts table with vehicle compatibility
  
  const defaultParts: Record<string, PartMatch> = {
    OIL_FILTER: {
      id: "default-oil-filter",
      sku: "OF-GENERIC",
      name: "Oil Filter",
      category: "OIL_FILTER",
      priceCents: 2500, // $25
    },
    DRAIN_WASHER: {
      id: "default-drain-washer",
      sku: "DW-GENERIC",
      name: "Drain Washer",
      category: "DRAIN_WASHER",
      priceCents: 300, // $3
    },
    AIR_FILTER: {
      id: "default-air-filter",
      sku: "AF-GENERIC",
      name: "Air Filter",
      category: "AIR_FILTER",
      priceCents: 4500, // $45
    },
    CABIN_FILTER: {
      id: "default-cabin-filter",
      sku: "CF-GENERIC",
      name: "Cabin/Pollen Filter",
      category: "CABIN_FILTER",
      priceCents: 3500, // $35
    },
    BRAKE_PAD_FRONT: {
      id: "default-brake-front",
      sku: "BP-FRONT-GENERIC",
      name: "Front Brake Pads (set)",
      category: "BRAKE_PAD_FRONT",
      priceCents: 12000, // $120
    },
    BRAKE_PAD_REAR: {
      id: "default-brake-rear",
      sku: "BP-REAR-GENERIC",
      name: "Rear Brake Pads (set)",
      category: "BRAKE_PAD_REAR",
      priceCents: 10000, // $100
    },
    BATTERY: {
      id: "default-battery",
      sku: "BAT-GENERIC",
      name: "Vehicle Battery",
      category: "BATTERY",
      priceCents: 22000, // $220
    },
  };

  for (const cat of categories) {
    if (defaultParts[cat]) {
      results.set(cat, defaultParts[cat]);
    }
  }

  return results;
}

// ============================================
// Quote Calculation
// ============================================

export async function calculateQuote(
  vehicle: VehicleLookupResult,
  servicePackage: ServicePackageType,
  options?: {
    afterHours?: boolean;
    outsideZone?: boolean;
    zoneSurchargeCents?: number;
  }
): Promise<QuoteResult> {
  const config = SERVICE_CONFIGS[servicePackage];
  
  if (!config) {
    return {
      success: false,
      plate: vehicle.plate,
      vehicleDescription: "",
      servicePackage,
      serviceName: "Unknown Service",
      serviceDescription: "",
      lineItems: [],
      subtotalCents: 0,
      gstCents: 0,
      totalCents: 0,
      totalFormatted: "$0.00",
      expiresAt: new Date(),
      validDays: 0,
      warrantyMonths: 0,
      warrantyKm: 0,
      error: "Invalid service package",
    };
  }

  // Check if we need vehicle data but don't have it
  if (config.requiresVehicleData && !vehicle.found) {
    return {
      success: false,
      plate: vehicle.plate,
      vehicleDescription: "Vehicle details required",
      servicePackage,
      serviceName: config.name,
      serviceDescription: config.description,
      lineItems: [],
      subtotalCents: 0,
      gstCents: 0,
      totalCents: 0,
      totalFormatted: "$0.00",
      expiresAt: new Date(),
      validDays: 0,
      warrantyMonths: config.warrantyMonths,
      warrantyKm: config.warrantyKm,
      error: "Please enter vehicle details to get an accurate quote",
      requiresManualQuote: true,
    };
  }

  const vehicleDescription = vehicle.found
    ? `${vehicle.year || ""} ${vehicle.make || ""} ${vehicle.model || ""}`.trim()
    : vehicle.plate;

  const lineItems: QuoteLineItem[] = [];

  // Calculate labour
  if (config.labourMinutes > 0) {
    const labourCents = Math.round((config.labourMinutes / 60) * LABOUR_RATE_CENTS);
    lineItems.push({
      description: `Labour (${config.labourMinutes} mins)`,
      category: "LABOUR",
      quantity: 1,
      unitPriceCents: labourCents,
      totalCents: labourCents,
    });
  }

  // Add call-out fee
  lineItems.push({
    description: "Mobile call-out",
    category: "CALLOUT",
    quantity: 1,
    unitPriceCents: CALLOUT_FEE_CENTS,
    totalCents: CALLOUT_FEE_CENTS,
  });

  // Service-specific parts
  switch (servicePackage) {
    case "BRONZE_SERVICE":
    case "SILVER_SERVICE":
    case "GOLD_SERVICE": {
      // Oil
      const oilCapacity = vehicle.oilCapacityL || estimateOilCapacity(vehicle.engineCc);
      const oilCents = Math.round(oilCapacity * OIL_PRICE_PER_LITRE_CENTS);
      lineItems.push({
        description: `Engine Oil (${oilCapacity}L synthetic)`,
        category: "PARTS",
        quantity: 1,
        unitPriceCents: oilCents,
        totalCents: oilCents,
      });

      // Oil filter
      const parts = await findPartsForVehicle(vehicle, ["OIL_FILTER", "DRAIN_WASHER"]);
      const oilFilter = parts.get("OIL_FILTER");
      if (oilFilter) {
        lineItems.push({
          description: oilFilter.name,
          category: "PARTS",
          quantity: 1,
          unitPriceCents: oilFilter.priceCents,
          totalCents: oilFilter.priceCents,
          partId: oilFilter.id,
        });
      }

      // Drain washer
      const drainWasher = parts.get("DRAIN_WASHER");
      if (drainWasher) {
        lineItems.push({
          description: drainWasher.name,
          category: "PARTS",
          quantity: 1,
          unitPriceCents: drainWasher.priceCents,
          totalCents: drainWasher.priceCents,
          partId: drainWasher.id,
        });
      }

      // Silver/Gold: Air filter
      if (servicePackage === "SILVER_SERVICE" || servicePackage === "GOLD_SERVICE") {
        const airFilter = (await findPartsForVehicle(vehicle, ["AIR_FILTER"])).get("AIR_FILTER");
        if (airFilter) {
          lineItems.push({
            description: airFilter.name,
            category: "PARTS",
            quantity: 1,
            unitPriceCents: airFilter.priceCents,
            totalCents: airFilter.priceCents,
            partId: airFilter.id,
          });
        }
      }

      // Gold: Cabin filter
      if (servicePackage === "GOLD_SERVICE") {
        const cabinFilter = (await findPartsForVehicle(vehicle, ["CABIN_FILTER"])).get("CABIN_FILTER");
        if (cabinFilter) {
          lineItems.push({
            description: cabinFilter.name,
            category: "PARTS",
            quantity: 1,
            unitPriceCents: cabinFilter.priceCents,
            totalCents: cabinFilter.priceCents,
            partId: cabinFilter.id,
          });
        }
      }
      break;
    }

    case "BRAKE_PADS_FRONT": {
      const parts = await findPartsForVehicle(vehicle, ["BRAKE_PAD_FRONT"]);
      const brakePads = parts.get("BRAKE_PAD_FRONT");
      if (brakePads) {
        lineItems.push({
          description: brakePads.name,
          category: "PARTS",
          quantity: 1,
          unitPriceCents: brakePads.priceCents,
          totalCents: brakePads.priceCents,
          partId: brakePads.id,
        });
      }
      break;
    }

    case "BRAKE_PADS_REAR": {
      const parts = await findPartsForVehicle(vehicle, ["BRAKE_PAD_REAR"]);
      const brakePads = parts.get("BRAKE_PAD_REAR");
      if (brakePads) {
        lineItems.push({
          description: brakePads.name,
          category: "PARTS",
          quantity: 1,
          unitPriceCents: brakePads.priceCents,
          totalCents: brakePads.priceCents,
          partId: brakePads.id,
        });
      }
      break;
    }

    case "BRAKE_PADS_FULL": {
      const parts = await findPartsForVehicle(vehicle, ["BRAKE_PAD_FRONT", "BRAKE_PAD_REAR"]);
      const frontPads = parts.get("BRAKE_PAD_FRONT");
      const rearPads = parts.get("BRAKE_PAD_REAR");
      if (frontPads) {
        lineItems.push({
          description: frontPads.name,
          category: "PARTS",
          quantity: 1,
          unitPriceCents: frontPads.priceCents,
          totalCents: frontPads.priceCents,
          partId: frontPads.id,
        });
      }
      if (rearPads) {
        lineItems.push({
          description: rearPads.name,
          category: "PARTS",
          quantity: 1,
          unitPriceCents: rearPads.priceCents,
          totalCents: rearPads.priceCents,
          partId: rearPads.id,
        });
      }
      break;
    }

    case "BATTERY_REPLACEMENT": {
      const parts = await findPartsForVehicle(vehicle, ["BATTERY"]);
      const battery = parts.get("BATTERY");
      if (battery) {
        lineItems.push({
          description: battery.name,
          category: "PARTS",
          quantity: 1,
          unitPriceCents: battery.priceCents,
          totalCents: battery.priceCents,
          partId: battery.id,
        });
      }
      break;
    }

    case "WOF_REPAIRS":
    case "CUSTOM":
      // These require manual quoting
      return {
        success: false,
        plate: vehicle.plate,
        vehicleDescription,
        servicePackage,
        serviceName: config.name,
        serviceDescription: config.description,
        lineItems: [],
        subtotalCents: 0,
        gstCents: 0,
        totalCents: 0,
        totalFormatted: "$0.00",
        expiresAt: new Date(),
        validDays: 0,
        warrantyMonths: config.warrantyMonths,
        warrantyKm: config.warrantyKm,
        requiresManualQuote: true,
        error: "This service requires a custom quote. Please contact us with details.",
      };
  }

  // After-hours surcharge (25% on labour)
  if (options?.afterHours) {
    const labourItem = lineItems.find(i => i.category === "LABOUR");
    if (labourItem) {
      const surchargeCents = Math.round(labourItem.totalCents * 0.25);
      lineItems.push({
        description: "After-hours surcharge (25%)",
        category: "SURCHARGE",
        quantity: 1,
        unitPriceCents: surchargeCents,
        totalCents: surchargeCents,
      });
    }
  }

  // Zone surcharge
  if (options?.outsideZone && options.zoneSurchargeCents) {
    lineItems.push({
      description: "Extended travel surcharge",
      category: "SURCHARGE",
      quantity: 1,
      unitPriceCents: options.zoneSurchargeCents,
      totalCents: options.zoneSurchargeCents,
    });
  }

  // Calculate totals
  const subtotalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0);
  const gstCents = Math.round(subtotalCents * GST_RATE);
  const totalCents = subtotalCents + gstCents;

  // Add GST line item for display
  lineItems.push({
    description: "GST (15%)",
    category: "GST",
    quantity: 1,
    unitPriceCents: gstCents,
    totalCents: gstCents,
  });

  // Expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + QUOTE_VALIDITY_DAYS);

  return {
    success: true,
    plate: vehicle.plate,
    vehicleDescription,
    servicePackage,
    serviceName: config.name,
    serviceDescription: config.description,
    lineItems,
    subtotalCents,
    gstCents,
    totalCents,
    totalFormatted: formatCurrency(totalCents),
    expiresAt,
    validDays: QUOTE_VALIDITY_DAYS,
    warrantyMonths: config.warrantyMonths,
    warrantyKm: config.warrantyKm,
  };
}

// ============================================
// Save Quote to Database
// ============================================

export async function saveQuote(
  email: string,
  phone: string | undefined,
  vehicle: VehicleLookupResult,
  quoteResult: QuoteResult
): Promise<{ quoteId: string; publicId: string }> {
  const publicId = nanoid(12);

  let customer = await prisma.customer.findFirst({ where: { email } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        publicId: nanoid(10),
        email,
        phone,
        fullName: 'Web Quote User',
      }
    });
  }

  let dbVehicle = await prisma.vehicle.findFirst({ where: { plate: vehicle.plate } });
  if (!dbVehicle) {
    dbVehicle = await prisma.vehicle.create({
      data: {
         publicId: nanoid(10),
         plate: vehicle.plate,
         make: vehicle.make,
         model: vehicle.model,
         year: vehicle.year,
         customerId: customer.id
      }
    });
  }

  const quote = await prisma.instantQuote.create({
    data: {
      publicId,
      status: "NEW",
      customerId: customer.id,
      vehicleId: dbVehicle.id,
      pricingSnapshotJson: {
        servicePackage: quoteResult.servicePackage,
        lineItems: quoteResult.lineItems,
        subtotalCents: quoteResult.subtotalCents,
        gstCents: quoteResult.gstCents,
        totalCents: quoteResult.totalCents,
        expiresAt: quoteResult.expiresAt,
      } as any,
    },
  });

  return {
    quoteId: quote.id,
    publicId: quote.publicId,
  };
}

// ============================================
// Helpers
// ============================================

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getServiceConfig(servicePackage: ServicePackageType) {
  return SERVICE_CONFIGS[servicePackage];
}

export function getAllServiceConfigs() {
  return Object.entries(SERVICE_CONFIGS).map(([code, config]) => ({
    code,
    ...config,
  }));
}

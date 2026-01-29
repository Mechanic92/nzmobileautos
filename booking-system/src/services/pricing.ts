/**
 * Pricing Engine
 * Band-based pricing with fuel type and engine size
 */

import {
  PRICING,
  EXTRAS,
  OIL,
  SERVICE_DURATION,
  ENGINE_BANDS,
  GST_RATE,
  type ServiceType,
} from "../config/constants.js";
import type { VehicleData } from "./motorweb.js";

// ============================================
// Types
// ============================================

export type EngineSize = "SMALL" | "MEDIUM" | "LARGE";
export type FuelType = "PETROL" | "DIESEL";

export interface ExtraItem {
  code: string;
  name: string;
  priceCents: number;
}

export interface PricingBreakdown {
  serviceType: ServiceType;
  serviceName: string;
  basePriceCents: number;
  oilSurchargeCents: number;
  extrasCents: number;
  extras: ExtraItem[];
  subtotalCents: number;
  gstCents: number;
  totalIncGstCents: number;
  durationMinutes: number;
  vehicle: {
    plate: string;
    make: string;
    model: string;
    year: number;
    fuel: FuelType;
    cc: number;
    engineSize: EngineSize;
  };
}

export interface PricingRequest {
  vehicle: VehicleData;
  serviceType: ServiceType;
  extras?: string[];
  oilCapacityLitres?: number;
}

export interface PricingResult {
  success: boolean;
  breakdown?: PricingBreakdown;
  error?: string;
  requiresApproval?: boolean;
  approvalReason?: string;
}

// ============================================
// Engine Size Classification
// ============================================

export function getEngineSize(cc: number): EngineSize {
  if (cc <= ENGINE_BANDS.SMALL_MAX) return "SMALL";
  if (cc <= ENGINE_BANDS.MEDIUM_MAX) return "MEDIUM";
  return "LARGE";
}

// ============================================
// Fuel Type Normalization
// ============================================

export function normalizeFuelType(fuel: string): FuelType {
  const upper = fuel.toUpperCase();
  if (upper.includes("DIESEL")) return "DIESEL";
  return "PETROL";
}

// ============================================
// Base Price Lookup
// ============================================

export function getBasePrice(
  serviceType: ServiceType,
  fuel: FuelType,
  engineSize: EngineSize
): number {
  return PRICING[serviceType][fuel][engineSize];
}

// ============================================
// Oil Surcharge Calculation
// ============================================

export function calculateOilSurcharge(oilCapacityLitres?: number): number {
  if (!oilCapacityLitres || oilCapacityLitres <= OIL.INCLUDED_LITRES) {
    return 0;
  }
  
  const extraLitres = oilCapacityLitres - OIL.INCLUDED_LITRES;
  return extraLitres * OIL.EXTRA_LITRE_CENTS;
}

// ============================================
// Extras Calculation
// ============================================

export function calculateExtras(extraCodes: string[]): {
  totalCents: number;
  items: ExtraItem[];
  requiresApproval: boolean;
  approvalItems: string[];
} {
  let totalCents = 0;
  const items: ExtraItem[] = [];
  const approvalItems: string[] = [];
  let requiresApproval = false;

  for (const code of extraCodes) {
    const extra = EXTRAS[code as keyof typeof EXTRAS];
    if (!extra) continue;

    if (!extra.instantPricing) {
      requiresApproval = true;
      approvalItems.push(extra.name);
      continue;
    }

    totalCents += extra.priceCents;
    items.push({
      code,
      name: extra.name,
      priceCents: extra.priceCents,
    });
  }

  return { totalCents, items, requiresApproval, approvalItems };
}

// ============================================
// Main Pricing Function
// ============================================

export function calculatePrice(request: PricingRequest): PricingResult {
  const { vehicle, serviceType, extras = [], oilCapacityLitres } = request;

  // Validate fuel type
  const fuel = normalizeFuelType(vehicle.fuel);
  
  // Check for unsupported fuel types
  if (vehicle.fuel.toUpperCase().includes("ELECTRIC")) {
    return {
      success: false,
      error: "Electric vehicles require a custom quote. Please contact us.",
      requiresApproval: true,
      approvalReason: "Electric vehicle",
    };
  }

  if (vehicle.fuel.toUpperCase().includes("HYBRID")) {
    return {
      success: false,
      error: "Hybrid vehicles require a custom quote. Please contact us.",
      requiresApproval: true,
      approvalReason: "Hybrid vehicle",
    };
  }

  // Validate engine size
  if (!vehicle.cc || vehicle.cc < 100) {
    return {
      success: false,
      error: "Engine size not available. Please contact us for a quote.",
      requiresApproval: true,
      approvalReason: "Unknown engine size",
    };
  }

  const engineSize = getEngineSize(vehicle.cc);

  // Calculate base price
  const basePriceCents = getBasePrice(serviceType, fuel, engineSize);

  // Calculate oil surcharge
  const oilSurchargeCents = calculateOilSurcharge(oilCapacityLitres);

  // Calculate extras
  const extrasResult = calculateExtras(extras);

  if (extrasResult.requiresApproval) {
    return {
      success: false,
      error: `The following extras require approval: ${extrasResult.approvalItems.join(", ")}`,
      requiresApproval: true,
      approvalReason: `Extras requiring approval: ${extrasResult.approvalItems.join(", ")}`,
    };
  }

  // Calculate totals (prices are already GST-inclusive)
  const subtotalCents = basePriceCents + oilSurchargeCents + extrasResult.totalCents;
  
  // GST is already included in prices, calculate for display
  const gstCents = Math.round(subtotalCents * GST_RATE / (1 + GST_RATE));
  
  const breakdown: PricingBreakdown = {
    serviceType,
    serviceName: serviceType === "BASIC" ? "Basic Service" : "Comprehensive Service",
    basePriceCents,
    oilSurchargeCents,
    extrasCents: extrasResult.totalCents,
    extras: extrasResult.items,
    subtotalCents,
    gstCents,
    totalIncGstCents: subtotalCents,
    durationMinutes: SERVICE_DURATION[serviceType],
    vehicle: {
      plate: vehicle.plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      fuel,
      cc: vehicle.cc,
      engineSize,
    },
  };

  return {
    success: true,
    breakdown,
  };
}

// ============================================
// Format Price for Display
// ============================================

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatPriceBreakdown(breakdown: PricingBreakdown): string {
  const lines = [
    `${breakdown.serviceName} (${breakdown.vehicle.fuel} ${breakdown.vehicle.engineSize})`,
    `Base price: ${formatPrice(breakdown.basePriceCents)}`,
  ];

  if (breakdown.oilSurchargeCents > 0) {
    lines.push(`Extra oil: ${formatPrice(breakdown.oilSurchargeCents)}`);
  }

  for (const extra of breakdown.extras) {
    lines.push(`${extra.name}: ${formatPrice(extra.priceCents)}`);
  }

  lines.push(`---`);
  lines.push(`Total (inc GST): ${formatPrice(breakdown.totalIncGstCents)}`);

  return lines.join("\n");
}

import { z } from "zod";

import { classifyVehicle, type VehicleClass } from "@/lib/engines/classification";
import type { MotorWebIdentity } from "@/lib/integrations/motorweb";
import { getRevenueEnginePricingConfig } from "@/lib/config/pricing";

export const ServiceIntentSchema = z.enum(["DIAGNOSTICS", "PPI", "SERVICE"]);
export type ServiceIntent = z.infer<typeof ServiceIntentSchema>;

export const ServiceTierSchema = z.enum(["OIL_FILTER", "BASIC", "COMPREHENSIVE"]).default("BASIC");
export type ServiceTier = z.infer<typeof ServiceTierSchema>;

export const AddOnsSchema = z
  .object({
    prioritySameDay: z.boolean().optional(),
    outsideCoreArea: z.boolean().optional(),
    afterHours: z.boolean().optional(),
    engineOilFlush: z.boolean().optional(),
    fuelAdditive: z.boolean().optional(),
    serviceTier: ServiceTierSchema.optional(), // Allow passing tier here too
  })
  .default({});
export type AddOns = z.infer<typeof AddOnsSchema>;

export type PricingLine = {
  key: string;
  label: string;
  amountCents: number;
};

export type PricingSnapshot = {
  currency: "NZD";
  intent: ServiceIntent;
  serviceTier?: ServiceTier;
  vehicleIdentity: MotorWebIdentity;
  vehicleClass: VehicleClass;
  addOns: AddOns;
  lines: PricingLine[];
  subtotalCents: number;
  gstCents: number;
  totalIncGstCents: number | null;
  isEstimateOnly: boolean;
  disclaimers: string[];
  durationMinutes: number | null;
  oilIncludedLitres?: number;
  extraOilPerLitreCents?: number;
};

function sum(lines: PricingLine[]) {
  return lines.reduce((acc, l) => acc + l.amountCents, 0);
}

function toGstCents(totalIncGstCents: number) {
  // NZ GST 15% included => gst = total * 15/115
  return Math.round((totalIncGstCents * 15) / 115);
}

function includedOilLitres(vClass: VehicleClass, cfg: ReturnType<typeof getRevenueEnginePricingConfig>) {
  if (vClass.body_class === "PERFORMANCE") return cfg.oilPricing.includedLitresByVehicleClass.performance;
  if (vClass.body_class === "SUV") return cfg.oilPricing.includedLitresByVehicleClass.suv;
  if (vClass.body_class === "UTE" || vClass.body_class === "VAN") return cfg.oilPricing.includedLitresByVehicleClass.uteVan;
  if (vClass.body_class === "COMMERCIAL" || vClass.load_class === "HEAVY") return cfg.oilPricing.includedLitresByVehicleClass.heavyCommercial;
  return cfg.oilPricing.includedLitresByVehicleClass.lightCar ?? cfg.oilPricing.defaultIncludedLitres;
}

function getServicePrices(vClass: VehicleClass, cfg: ReturnType<typeof getRevenueEnginePricingConfig>) {
  const isPerformance = vClass.body_class === "PERFORMANCE" || vClass.power_band === "HIGH";
  const isDieselComm = vClass.fuel_class === "DIESEL" && (vClass.body_class === "UTE" || vClass.body_class === "COMMERCIAL" || vClass.load_class === "HEAVY");
  const isMid = vClass.power_band === "MID" || vClass.body_class === "SUV";

  let band: 'petrolSmallCar' | 'petrolMidCar' | 'dieselUte' | 'euroPerformance' = 'petrolSmallCar';
  let bandLabel = "Small Car";

  if (isPerformance) { band = 'euroPerformance'; bandLabel = "Euro / Performance"; }
  else if (isDieselComm) { band = 'dieselUte'; bandLabel = "Diesel Ute / Commercial"; }
  else if (isMid) { band = 'petrolMidCar'; bandLabel = "Mid-Size / SUV"; }

  return {
    oil: cfg.serviceBands.oilFilter[band],
    basic: cfg.serviceBands.basic[band],
    comprehensive: cfg.serviceBands.comprehensive[band],
    bandLabel
  };
}

export function buildPricingSnapshot(input: {
  vehicleIdentity: MotorWebIdentity;
  intent: ServiceIntent;
  addOns?: AddOns;
  tier?: ServiceTier;
}): PricingSnapshot {
  const cfg = getRevenueEnginePricingConfig();
  const vehicleClass = classifyVehicle(input.vehicleIdentity);
  const tier = input.tier || input.addOns?.serviceTier || "BASIC";
  const addOns = { prioritySameDay: false, outsideCoreArea: false, afterHours: false, ...(input.addOns || {}) };

  const disclaimers: string[] = [];
  const lines: PricingLine[] = [];

  const addAddOns = () => {
    if (addOns.prioritySameDay) {
      lines.push({ key: "prioritySameDay", label: "Priority Same-Day", amountCents: cfg.addOns.prioritySameDayCents });
      disclaimers.push("Priority Same-Day is subject to availability and technician confirmation.");
    }
    if (addOns.outsideCoreArea) {
      lines.push({ key: "outsideCoreArea", label: "Outside Core Area", amountCents: cfg.addOns.outsideCoreAreaCents });
      disclaimers.push("Outside Core Area surcharge applies for extended travel.");
    }
    if (addOns.afterHours) {
      lines.push({ key: "afterHours", label: "After-Hours", amountCents: cfg.addOns.afterHoursCents });
      disclaimers.push("After-Hours bookings are request-only and require confirmation.");
    }
    if (addOns.engineOilFlush) {
      lines.push({ key: "engineOilFlush", label: "Engine Oil Flush", amountCents: cfg.addOns.engineOilFlushCents });
      disclaimers.push("Engine oil flush helps remove internal sludge—recommended for higher mileage vehicles.");
    }
    if (addOns.fuelAdditive) {
      lines.push({ key: "fuelAdditive", label: "Fuel System Additive", amountCents: cfg.addOns.fuelAdditiveCents });
      disclaimers.push("Fuel additive cleans injectors and combustion chambers for better efficiency.");
    }
  };

  if (input.intent === "DIAGNOSTICS") {
    lines.push({ key: "diagnostic", label: "Mobile Diagnostics (incl call-out)", amountCents: cfg.diagnosticFixedCents });
    addAddOns();

    const total = sum(lines);
    return {
      currency: "NZD",
      intent: input.intent,
      vehicleIdentity: input.vehicleIdentity,
      vehicleClass,
      addOns,
      lines,
      subtotalCents: total,
      gstCents: toGstCents(total),
      totalIncGstCents: total,
      isEstimateOnly: false,
      disclaimers: [
        "Diagnostics covers fault finding and scan/reporting only. Repairs/parts are quoted separately.",
        "Prices shown are bounded for this service intent and include GST.",
        ...disclaimers,
      ],
      durationMinutes: cfg.serviceDurationsMinutes.diagnostic,
    };
  }

  if (input.intent === "PPI") {
    lines.push({ key: "ppi", label: "Pre-Purchase Inspection (2h)", amountCents: cfg.ppiFixedCents });
    addAddOns();

    const total = sum(lines);
    return {
      currency: "NZD",
      intent: input.intent,
      vehicleIdentity: input.vehicleIdentity,
      vehicleClass,
      addOns,
      lines,
      subtotalCents: total,
      gstCents: toGstCents(total),
      totalIncGstCents: total,
      isEstimateOnly: false,
      disclaimers: [
        "Inspection is visual/mechanical assessment. It is not a WOF inspection.",
        "Prices shown are bounded for this service intent and include GST.",
        ...disclaimers,
      ],
      durationMinutes: cfg.serviceDurationsMinutes.ppi,
    };
  }

  if (input.intent === "SERVICE") {
    const prices = getServicePrices(vehicleClass, cfg);
    const included = includedOilLitres(vehicleClass, cfg);
    
    let basePrice = prices.basic;
    let label = `Basic Service (${prices.bandLabel})`;
    let duration = cfg.serviceDurationsMinutes.basicService;

    if (tier === "OIL_FILTER") {
      basePrice = prices.oil;
      label = `Oil + Filter Change (${prices.bandLabel})`;
      duration = cfg.serviceDurationsMinutes.basicService; // Usually same as basic
    } else if (tier === "COMPREHENSIVE") {
      basePrice = prices.comprehensive;
      label = `Comprehensive Service (${prices.bandLabel})`;
      duration = cfg.serviceDurationsMinutes.comprehensiveService;
    }

    lines.push({ key: "serviceBase", label, amountCents: basePrice });
    addAddOns();

    const total = sum(lines);
    return {
      currency: "NZD",
      intent: input.intent,
      serviceTier: tier,
      vehicleIdentity: input.vehicleIdentity,
      vehicleClass,
      addOns,
      lines,
      subtotalCents: total,
      gstCents: toGstCents(total),
      totalIncGstCents: total,
      isEstimateOnly: false,
      disclaimers: [
        `Service tier: ${tier === "OIL_FILTER" ? "Oil & Filter" : tier === "BASIC" ? "Basic" : "Comprehensive"}.`,
        `Price includes up to ${included} litres of oil. Extra oil charged at $${(cfg.oilPricing.extraOilPerLitreCents / 100).toFixed(0)}/litre if required.`,
        "Final oil quantity confirmed onsite.",
        "Prices shown are bounded for this service intent and include GST.",
        ...disclaimers,
      ],
      durationMinutes: duration,
      oilIncludedLitres: included,
      extraOilPerLitreCents: cfg.oilPricing.extraOilPerLitreCents,
    };
  }

  // Fallback
  return {
    currency: "NZD",
    intent: input.intent,
    vehicleIdentity: input.vehicleIdentity,
    vehicleClass,
    addOns,
    lines: [],
    subtotalCents: 0,
    gstCents: 0,
    totalIncGstCents: null,
    isEstimateOnly: true,
    disclaimers: ["Unable to generate pricing."],
    durationMinutes: null,
  };
}

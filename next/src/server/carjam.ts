/**
 * CarJam API Integration
 * Provides vehicle lookup by NZ registration plate
 * 
 * API Documentation: https://www.carjam.co.nz/api/
 * Requires API key from CarJam
 */

import { prisma } from "./prisma";

const CARJAM_API_KEY = process.env.CARJAM_API_KEY;
const CARJAM_BASE_URL = "https://api.carjam.co.nz/car";

// Cache duration: 30 days (vehicle data rarely changes)
const CACHE_DURATION_DAYS = 30;

export interface VehicleLookupResult {
  found: boolean;
  plate: string;
  make?: string;
  model?: string;
  year?: number;
  engineCc?: number;
  fuel?: string;
  bodyStyle?: string;
  transmission?: string;
  colour?: string;
  vin?: string;
  oilCapacityL?: number;
  oilGrade?: string;
  error?: string;
}

interface CarJamResponse {
  success: boolean;
  message?: string;
  idh?: {
    make?: string;
    model?: string;
    year_of_manufacture?: number;
    engine_cc?: number;
    fuel?: string;
    body_style?: string;
    transmission?: string;
    main_colour?: string;
    vin?: string;
    number_plate?: string;
  };
  // Additional fields from CarJam
  specifications?: {
    engine_oil_capacity_litres?: number;
    engine_oil_grade?: string;
  };
}

/**
 * Normalize plate format: uppercase, remove spaces/hyphens
 */
export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[\s-]/g, "").trim();
}

/**
 * Validate NZ plate format (1-6 alphanumeric characters)
 */
export function isValidNZPlate(plate: string): boolean {
  const normalized = normalizePlate(plate);
  // NZ plates: 1-6 alphanumeric characters
  return /^[A-Z0-9]{1,6}$/.test(normalized);
}

/**
 * Check cache for existing vehicle data
 */
async function getCachedVehicle(plate: string): Promise<VehicleLookupResult | null> {
  const normalized = normalizePlate(plate);
  
  // Using VehicleCache model which uses JSON storage
  const cached = await prisma.vehicleCache.findUnique({
    where: { plate: normalized },
  });

  if (!cached) return null;

  if (cached.expiresAt < new Date()) {
    await prisma.vehicleCache.delete({
      where: { plate: normalized },
    });
    return null;
  }

  const identity: any = cached.identityJson || {};

  return {
    found: true,
    plate: cached.plate,
    make: identity.make,
    model: identity.model,
    year: identity.year,
    engineCc: identity.engineCc,
    fuel: identity.fuel,
    bodyStyle: identity.bodyStyle,
    vin: identity.vin,
    // Other fields might be missing in MotorWeb identity structure but this adapts the legacy code
  };
}

async function cacheVehicle(data: VehicleLookupResult, rawJson: any): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CACHE_DURATION_DAYS);

  await prisma.vehicleCache.upsert({
    where: { plate: data.plate },
    create: {
      plate: data.plate,
      identityJson: {
        make: data.make,
        model: data.model,
        year: data.year,
        fuel: data.fuel,
        bodyStyle: data.bodyStyle,
        vin: data.vin,
        engineCc: data.engineCc,
        ...rawJson
      },
      classificationJson: {}, // Default empty or derive if possible
      expiresAt,
      lastAccessAt: new Date(),
      lookupCount: 1
    },
    update: {
      identityJson: {
        make: data.make,
        model: data.model,
        year: data.year,
        fuel: data.fuel,
        bodyStyle: data.bodyStyle,
        vin: data.vin,
        engineCc: data.engineCc,
        ...rawJson
      },
      lastAccessAt: new Date(),
      expiresAt,
    },
  });
}

/**
 * Fetch vehicle data from CarJam API
 */
async function fetchFromCarJam(plate: string): Promise<VehicleLookupResult> {
  if (!CARJAM_API_KEY) {
    console.warn("[CarJam] API key not configured");
    return {
      found: false,
      plate,
      error: "Vehicle lookup service not configured",
    };
  }

  try {
    const url = `${CARJAM_BASE_URL}?plate=${encodeURIComponent(plate)}&key=${CARJAM_API_KEY}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          found: false,
          plate,
          error: "Vehicle not found in NZ register",
        };
      }
      throw new Error(`CarJam API error: ${response.status}`);
    }

    const data: CarJamResponse = await response.json();

    if (!data.success || !data.idh) {
      return {
        found: false,
        plate,
        error: data.message || "Vehicle not found",
      };
    }

    const result: VehicleLookupResult = {
      found: true,
      plate,
      make: data.idh.make,
      model: data.idh.model,
      year: data.idh.year_of_manufacture,
      engineCc: data.idh.engine_cc,
      fuel: data.idh.fuel,
      bodyStyle: data.idh.body_style,
      transmission: data.idh.transmission,
      colour: data.idh.main_colour,
      vin: data.idh.vin,
      oilCapacityL: data.specifications?.engine_oil_capacity_litres,
      oilGrade: data.specifications?.engine_oil_grade,
    };

    // Cache the result
    await cacheVehicle(result, data);

    return result;
  } catch (error: any) {
    console.error("[CarJam] API error:", error.message);
    return {
      found: false,
      plate,
      error: "Failed to lookup vehicle. Please try again or enter details manually.",
    };
  }
}

/**
 * Main lookup function - checks cache first, then API
 */
export async function lookupVehicle(plate: string): Promise<VehicleLookupResult> {
  const normalized = normalizePlate(plate);

  if (!isValidNZPlate(normalized)) {
    return {
      found: false,
      plate: normalized,
      error: "Invalid plate format. NZ plates are 1-6 alphanumeric characters.",
    };
  }

  // Check cache first
  const cached = await getCachedVehicle(normalized);
  if (cached) {
    console.log(`[CarJam] Cache hit for plate: ${normalized}`);
    return cached;
  }

  // Fetch from API
  console.log(`[CarJam] Fetching from API for plate: ${normalized}`);
  return fetchFromCarJam(normalized);
}

/**
 * Fallback: Manual vehicle entry (when lookup fails)
 */
export interface ManualVehicleInput {
  plate: string;
  make: string;
  model: string;
  year: number;
  engineCc?: number;
  fuel?: string;
}

export async function saveManualVehicle(input: ManualVehicleInput): Promise<VehicleLookupResult> {
  const normalized = normalizePlate(input.plate);
  
  const result: VehicleLookupResult = {
    found: true,
    plate: normalized,
    make: input.make,
    model: input.model,
    year: input.year,
    engineCc: input.engineCc,
    fuel: input.fuel,
  };

  // Cache manual entry with shorter expiry (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.vehicleCache.upsert({
    where: { plate: normalized },
    create: {
      plate: normalized,
      identityJson: {
        make: input.make,
        model: input.model,
        year: input.year,
        engineCc: input.engineCc,
        fuel: input.fuel,
        source: "manual_entry"
      },
      classificationJson: {},
      expiresAt,
      lastAccessAt: new Date(),
      lookupCount: 1
    },
    update: {
      identityJson: {
        make: input.make,
        model: input.model,
        year: input.year,
        engineCc: input.engineCc,
        fuel: input.fuel,
        source: "manual_entry"
      },
      lastAccessAt: new Date(),
      expiresAt,
    },
  });

  return result;
}

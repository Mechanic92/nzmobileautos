/**
 * MotorWeb mTLS Client
 * Secure vehicle lookup with client certificate authentication
 * 
 * Cost: $0.25 per lookup - implement strict controls
 */

import https from "node:https";
import fs from "node:fs";
import { parseStringPromise } from "xml2js";
import { createHash } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { redis, REDIS_KEYS } from "../lib/redis.js";
import { env } from "../config/env.js";
import { addDays, format } from "date-fns";

// ============================================
// Types
// ============================================

export interface VehicleData {
  plate: string;
  make: string;
  model: string;
  year: number;
  fuel: string;
  cc: number;
  vin: string;
  body: string;
  oilCapacityLitres?: number;
}

export interface LookupResult {
  success: boolean;
  source: "CACHE" | "MOTORWEB" | "FALLBACK";
  vehicle?: VehicleData;
  error?: string;
  cached?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// ============================================
// mTLS Agent (singleton)
// ============================================

let mtlsAgent: https.Agent | null = null;

function getMtlsAgent(): https.Agent | null {
  if (mtlsAgent) return mtlsAgent;

  // Check if certificates are configured
  if (!env.MOTORWEB_CERT_PATH || !env.MOTORWEB_KEY_PATH) {
    console.warn("[MotorWeb] Certificates not configured - vehicle lookup will use fallback mode");
    return null;
  }

  try {
    const cert = fs.readFileSync(env.MOTORWEB_CERT_PATH);
    const key = fs.readFileSync(env.MOTORWEB_KEY_PATH);
    const ca = env.MOTORWEB_CA_PATH ? fs.readFileSync(env.MOTORWEB_CA_PATH) : undefined;

    mtlsAgent = new https.Agent({
      cert,
      key,
      ca,
      rejectUnauthorized: true,
    });

    return mtlsAgent;
  } catch (error: any) {
    console.error("[MotorWeb] Failed to load certificates:", error.message);
    return null;
  }
}

// ============================================
// Rate Limiting
// ============================================

export async function checkRateLimit(
  ipAddress: string,
  fingerprint?: string
): Promise<RateLimitResult> {
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = addDays(new Date(), 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Check IP rate limit
  const ipKey = REDIS_KEYS.RATE_LIMIT_IP(ipAddress, today);
  const ipCount = await redis.incr(ipKey);
  
  if (ipCount === 1) {
    // Set expiry on first increment
    await redis.expireat(ipKey, Math.floor(tomorrow.getTime() / 1000));
  }

  if (ipCount > env.MAX_LOOKUPS_PER_IP_PER_DAY) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: tomorrow,
    };
  }

  // Check fingerprint rate limit if provided
  if (fingerprint) {
    const fpKey = REDIS_KEYS.RATE_LIMIT_FP(fingerprint, today);
    const fpCount = await redis.incr(fpKey);
    
    if (fpCount === 1) {
      await redis.expireat(fpKey, Math.floor(tomorrow.getTime() / 1000));
    }

    if (fpCount > env.MAX_LOOKUPS_PER_BROWSER_PER_DAY) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: tomorrow,
      };
    }
  }

  return {
    allowed: true,
    remaining: env.MAX_LOOKUPS_PER_IP_PER_DAY - ipCount,
    resetAt: tomorrow,
  };
}

// ============================================
// Plate Validation
// ============================================

export function validatePlate(plate: string): { valid: boolean; normalized: string; error?: string } {
  const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
  
  if (normalized.length < 1 || normalized.length > 6) {
    return { valid: false, normalized, error: "Plate must be 1-6 characters" };
  }
  
  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return { valid: false, normalized, error: "Plate must contain only letters and numbers" };
  }
  
  return { valid: true, normalized };
}

// ============================================
// Cache Operations
// ============================================

async function getCachedVehicle(plate: string): Promise<VehicleData | null> {
  // Check Redis first (fast)
  const redisKey = REDIS_KEYS.PLATE_CACHE(plate);
  const cached = await redis.get(redisKey);
  
  if (cached) {
    return JSON.parse(cached) as VehicleData;
  }

  // Check Postgres (persistent)
  const dbCache = await prisma.plateCache.findUnique({
    where: { plate: plate.toUpperCase() },
  });

  if (dbCache && dbCache.expiresAt > new Date()) {
    const vehicle = dbCache.vehicleJson as VehicleData;
    
    // Repopulate Redis cache
    const ttlSeconds = Math.floor((dbCache.expiresAt.getTime() - Date.now()) / 1000);
    if (ttlSeconds > 0) {
      await redis.setex(redisKey, ttlSeconds, JSON.stringify(vehicle));
    }
    
    // Increment lookup count
    await prisma.plateCache.update({
      where: { plate: plate.toUpperCase() },
      data: { lookupCount: { increment: 1 } },
    });
    
    return vehicle;
  }

  return null;
}

async function cacheVehicle(vehicle: VehicleData): Promise<void> {
  const expiresAt = addDays(new Date(), env.PLATE_CACHE_DAYS);
  const redisKey = REDIS_KEYS.PLATE_CACHE(vehicle.plate);
  const ttlSeconds = env.PLATE_CACHE_DAYS * 24 * 60 * 60;

  // Store in Redis
  await redis.setex(redisKey, ttlSeconds, JSON.stringify(vehicle));

  // Store in Postgres
  await prisma.plateCache.upsert({
    where: { plate: vehicle.plate.toUpperCase() },
    create: {
      plate: vehicle.plate.toUpperCase(),
      vehicleJson: vehicle as any,
      expiresAt,
      lookupCount: 1,
    },
    update: {
      vehicleJson: vehicle as any,
      cachedAt: new Date(),
      expiresAt,
      lookupCount: { increment: 1 },
    },
  });
}

// ============================================
// MotorWeb API Call
// ============================================

async function callMotorWebApi(plate: string): Promise<VehicleData> {
  const url = `${env.MOTORWEB_API_URL}?plateOrVin=${encodeURIComponent(plate)}`;
  const agent = getMtlsAgent();

  // If no agent configured, throw to trigger fallback
  if (!agent) {
    throw new Error("MotorWeb certificates not configured");
  }

  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent: agent, timeout: 5000 }, (res) => {
      let data = "";
      
      res.on("data", (chunk) => {
        data += chunk;
      });
      
      res.on("end", async () => {
        if (res.statusCode !== 200) {
          reject(new Error(`MotorWeb API returned status ${res.statusCode}`));
          return;
        }

        try {
          const vehicle = await parseMotorWebXml(data, plate);
          resolve(vehicle);
        } catch (parseError: any) {
          reject(new Error(`Failed to parse MotorWeb response: ${parseError.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`MotorWeb request failed: ${error.message}`));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("MotorWeb request timed out"));
    });
  });
}

async function parseMotorWebXml(xml: string, plate: string): Promise<VehicleData> {
  const result = await parseStringPromise(xml, { explicitArray: false });
  
  // Navigate MotorWeb XML structure
  const vehicle = result?.ChassisCheckResponse?.Vehicle;
  
  if (!vehicle) {
    throw new Error("Vehicle not found in MotorWeb response");
  }

  // Extract and normalize fields
  const make = vehicle.Make || vehicle.Manufacturer || "";
  const model = vehicle.Model || "";
  const year = parseInt(vehicle.Year || vehicle.YearOfManufacture || "0", 10);
  const fuel = normalizeFuelType(vehicle.FuelType || vehicle.Fuel || "");
  const cc = parseInt(vehicle.EngineCC || vehicle.CC || vehicle.EngineCapacity || "0", 10);
  const vin = vehicle.VIN || vehicle.Vin || "";
  const body = vehicle.BodyStyle || vehicle.Body || "";

  if (!make || !model || !year) {
    throw new Error("Incomplete vehicle data from MotorWeb");
  }

  return {
    plate: plate.toUpperCase(),
    make,
    model,
    year,
    fuel,
    cc,
    vin,
    body,
  };
}

function normalizeFuelType(fuel: string): string {
  const upper = fuel.toUpperCase();
  
  if (upper.includes("DIESEL")) return "DIESEL";
  if (upper.includes("PETROL") || upper.includes("GASOLINE") || upper.includes("UNLEADED")) return "PETROL";
  if (upper.includes("HYBRID")) return "HYBRID";
  if (upper.includes("ELECTRIC") || upper === "EV") return "ELECTRIC";
  
  return "PETROL"; // Default assumption
}

// ============================================
// Logging
// ============================================

async function logLookup(
  plate: string,
  ipAddress: string,
  source: "CACHE" | "MOTORWEB" | "FALLBACK",
  success: boolean,
  fingerprint?: string
): Promise<void> {
  const plateHash = createHash("sha256").update(plate.toUpperCase()).digest("hex");
  
  await prisma.lookupLog.create({
    data: {
      plateHash,
      ipAddress,
      fingerprint,
      source,
      success,
    },
  });
}

// ============================================
// Main Lookup Function
// ============================================

export async function lookupVehicle(
  plate: string,
  ipAddress: string,
  fingerprint?: string
): Promise<LookupResult> {
  // Validate plate format
  const validation = validatePlate(plate);
  if (!validation.valid) {
    return {
      success: false,
      source: "FALLBACK",
      error: validation.error,
    };
  }

  const normalizedPlate = validation.normalized;

  // Check rate limits
  const rateLimit = await checkRateLimit(ipAddress, fingerprint);
  if (!rateLimit.allowed) {
    return {
      success: false,
      source: "FALLBACK",
      error: "Rate limit exceeded. Please try again tomorrow.",
    };
  }

  // Check cache first (FREE)
  const cached = await getCachedVehicle(normalizedPlate);
  if (cached) {
    await logLookup(normalizedPlate, ipAddress, "CACHE", true, fingerprint);
    return {
      success: true,
      source: "CACHE",
      vehicle: cached,
      cached: true,
    };
  }

  // Call MotorWeb API (COSTS $0.25)
  try {
    const vehicle = await callMotorWebApi(normalizedPlate);
    
    // Cache the result
    await cacheVehicle(vehicle);
    
    // Log successful lookup
    await logLookup(normalizedPlate, ipAddress, "MOTORWEB", true, fingerprint);
    
    return {
      success: true,
      source: "MOTORWEB",
      vehicle,
      cached: false,
    };
  } catch (error: any) {
    console.error(`[MotorWeb] Lookup failed for ${normalizedPlate}:`, error.message);
    
    // Log failed lookup
    await logLookup(normalizedPlate, ipAddress, "MOTORWEB", false, fingerprint);
    
    // Return fallback - user must manually select
    return {
      success: false,
      source: "FALLBACK",
      error: "Vehicle lookup failed. Please enter your vehicle details manually.",
    };
  }
}

// ============================================
// Manual Vehicle Entry (Fallback)
// ============================================

export function createManualVehicle(
  plate: string,
  make: string,
  model: string,
  year: number,
  fuel: string,
  cc: number
): VehicleData {
  return {
    plate: plate.toUpperCase(),
    make,
    model,
    year,
    fuel: normalizeFuelType(fuel),
    cc,
    vin: "",
    body: "",
  };
}

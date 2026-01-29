/**
 * Environment Configuration
 * Validates and exports all environment variables
 */

import { z } from "zod";

// Base schema - always required
const baseSchema = z.object({
  // Server
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("0.0.0.0"),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url(),
  
  // App
  NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  QUOTE_VALIDITY_HOURS: z.coerce.number().default(24),
  SLOT_HOLD_MINUTES: z.coerce.number().default(15),
  PLATE_CACHE_DAYS: z.coerce.number().default(90),
  
  // Rate Limiting
  MAX_LOOKUPS_PER_IP_PER_DAY: z.coerce.number().default(20),
  MAX_LOOKUPS_PER_BROWSER_PER_DAY: z.coerce.number().default(10),
  
  // Email (for confirmations)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default("bookings@mobileautoworksnz.com"),
  
  // Security
  CAPTCHA_SITE_KEY: z.string().optional(),
  CAPTCHA_SECRET_KEY: z.string().optional(),
});

// Production-only required fields
const productionSchema = baseSchema.extend({
  // MotorWeb mTLS
  MOTORWEB_API_URL: z.string().url().default("https://robot.motorweb.co.nz/b2b/chassischeck/generate/4.0"),
  MOTORWEB_CERT_PATH: z.string(),
  MOTORWEB_KEY_PATH: z.string(),
  MOTORWEB_CA_PATH: z.string().optional(),
  MOTORWEB_COST_PER_LOOKUP: z.coerce.number().default(0.25),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_AFTERPAY_ENABLED: z.coerce.boolean().default(true),
  
  // Gearbox
  GEARBOX_API_URL: z.string().url(),
  GEARBOX_API_KEY: z.string(),
});

// Development schema - credentials optional
const developmentSchema = baseSchema.extend({
  // MotorWeb mTLS (optional in dev)
  MOTORWEB_API_URL: z.string().url().default("https://robot.motorweb.co.nz/b2b/chassischeck/generate/4.0"),
  MOTORWEB_CERT_PATH: z.string().optional(),
  MOTORWEB_KEY_PATH: z.string().optional(),
  MOTORWEB_CA_PATH: z.string().optional(),
  MOTORWEB_COST_PER_LOOKUP: z.coerce.number().default(0.25),
  
  // Stripe (optional in dev)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_AFTERPAY_ENABLED: z.coerce.boolean().default(true),
  
  // Gearbox (optional in dev)
  GEARBOX_API_URL: z.string().url().default("https://gearbox-workshop-production.up.railway.app/api/public/bookings/ingest"),
  GEARBOX_API_KEY: z.string().optional(),
});

const envSchema = process.env.NODE_ENV === "production" ? productionSchema : developmentSchema;

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  
  return parsed.data;
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;

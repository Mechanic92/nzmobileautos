/**
 * Redis Client
 * Used for rate limiting and caching
 */

import Redis from "ioredis";
import { env } from "../config/env.js";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Key prefixes
export const REDIS_KEYS = {
  RATE_LIMIT_IP: (ip: string, date: string) => `rl:ip:${ip}:${date}`,
  RATE_LIMIT_FP: (fp: string, date: string) => `rl:fp:${fp}:${date}`,
  SLOT_HOLD: (date: string, time: string) => `slot:hold:${date}:${time}`,
  PLATE_CACHE: (plate: string) => `plate:${plate.toUpperCase()}`,
} as const;

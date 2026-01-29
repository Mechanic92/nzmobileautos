/**
 * Booking Engine
 * Slot-based scheduling with hold mechanism
 */

import {
  addMinutes,
  addDays,
  format,
  parse,
  setHours,
  setMinutes,
  isWeekend,
  isBefore,
  isAfter,
  startOfDay,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma.js";
import { redis, REDIS_KEYS } from "../lib/redis.js";
import { env } from "../config/env.js";
import {
  BOOKING_HOURS,
  WORKING_DAYS,
  SERVICE_DURATION,
  type ServiceType,
} from "../config/constants.js";
import type { PricingBreakdown } from "./pricing.js";

// ============================================
// Types
// ============================================

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
  held?: boolean;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: string;
  isWorkingDay: boolean;
  slots: TimeSlot[];
}

export interface BookingRequest {
  quoteId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  suburb: string;
  slotDate: string; // YYYY-MM-DD
  slotTime: string; // HH:mm
}

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  holdExpiresAt?: Date;
  error?: string;
}

// ============================================
// Time Helpers
// ============================================

function getNzTime(date: Date = new Date()): Date {
  return toZonedTime(date, BOOKING_HOURS.TIMEZONE);
}

function toUtc(nzDate: Date): Date {
  return fromZonedTime(nzDate, BOOKING_HOURS.TIMEZONE);
}

function parseSlotDateTime(date: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const nzDate = parse(date, "yyyy-MM-dd", new Date());
  const withTime = setMinutes(setHours(nzDate, hours), minutes);
  return toUtc(withTime);
}

function getDayOfWeek(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
}

// ============================================
// Slot Generation
// ============================================

function generateSlotsForDay(
  date: Date,
  durationMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dateStr = format(date, "yyyy-MM-dd");

  // Start time
  let currentTime = setMinutes(
    setHours(date, BOOKING_HOURS.START_HOUR),
    BOOKING_HOURS.START_MINUTE
  );

  // Last possible start time
  const lastStart = setMinutes(
    setHours(date, BOOKING_HOURS.LAST_START_HOUR),
    BOOKING_HOURS.LAST_START_MINUTE
  );

  // End of day
  const dayEnd = setMinutes(
    setHours(date, BOOKING_HOURS.END_HOUR),
    BOOKING_HOURS.END_MINUTE
  );

  while (!isAfter(currentTime, lastStart)) {
    const endTime = addMinutes(currentTime, durationMinutes);

    // Ensure job ends by 17:00
    if (isAfter(endTime, dayEnd)) {
      break;
    }

    slots.push({
      date: dateStr,
      startTime: format(currentTime, "HH:mm"),
      endTime: format(endTime, "HH:mm"),
      available: true,
    });

    // Next slot (30-minute increments)
    currentTime = addMinutes(currentTime, BOOKING_HOURS.SLOT_INCREMENT_MINUTES);
  }

  return slots;
}

// ============================================
// Availability Checking
// ============================================

async function getBookedSlots(date: string): Promise<Set<string>> {
  const startOfDayUtc = parseSlotDateTime(date, "00:00");
  const endOfDayUtc = parseSlotDateTime(date, "23:59");

  const bookings = await prisma.booking.findMany({
    where: {
      startTime: {
        gte: startOfDayUtc,
        lte: endOfDayUtc,
      },
      status: {
        in: ["PENDING_PAYMENT", "CONFIRMED"],
      },
    },
    select: {
      startTime: true,
    },
  });

  const bookedTimes = new Set<string>();
  for (const booking of bookings) {
    const nzTime = getNzTime(booking.startTime);
    bookedTimes.add(format(nzTime, "HH:mm"));
  }

  return bookedTimes;
}

async function getHeldSlots(date: string): Promise<Set<string>> {
  const pattern = REDIS_KEYS.SLOT_HOLD(date, "*");
  const keys = await redis.keys(pattern);
  
  const heldTimes = new Set<string>();
  for (const key of keys) {
    const time = key.split(":").pop();
    if (time) heldTimes.add(time);
  }

  return heldTimes;
}

export async function getAvailability(
  serviceType: ServiceType,
  daysAhead: number = 14
): Promise<DayAvailability[]> {
  const durationMinutes = SERVICE_DURATION[serviceType];
  const result: DayAvailability[] = [];
  const now = getNzTime();

  for (let i = 0; i < daysAhead; i++) {
    const date = addDays(startOfDay(now), i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = getDayOfWeek(date);
    const dayNum = date.getDay();

    // Check if working day
    const isWorkingDay = WORKING_DAYS.includes(dayNum);

    if (!isWorkingDay) {
      result.push({
        date: dateStr,
        dayOfWeek,
        isWorkingDay: false,
        slots: [],
      });
      continue;
    }

    // Generate slots
    let slots = generateSlotsForDay(date, durationMinutes);

    // Get booked and held slots
    const [bookedSlots, heldSlots] = await Promise.all([
      getBookedSlots(dateStr),
      getHeldSlots(dateStr),
    ]);

    // Mark unavailable slots
    slots = slots.map((slot) => {
      const isBooked = bookedSlots.has(slot.startTime);
      const isHeld = heldSlots.has(slot.startTime);

      // For today, filter out past slots
      if (i === 0) {
        const slotTime = parse(slot.startTime, "HH:mm", date);
        if (isBefore(slotTime, now)) {
          return { ...slot, available: false };
        }
      }

      return {
        ...slot,
        available: !isBooked && !isHeld,
        held: isHeld,
      };
    });

    result.push({
      date: dateStr,
      dayOfWeek,
      isWorkingDay: true,
      slots,
    });
  }

  return result;
}

// ============================================
// Slot Hold Management
// ============================================

async function holdSlot(date: string, time: string, bookingId: string): Promise<boolean> {
  const key = REDIS_KEYS.SLOT_HOLD(date, time);
  const holdSeconds = env.SLOT_HOLD_MINUTES * 60;

  // Use SET NX to ensure atomic hold
  const result = await redis.set(key, bookingId, "EX", holdSeconds, "NX");
  return result === "OK";
}

async function releaseSlot(date: string, time: string, bookingId: string): Promise<void> {
  const key = REDIS_KEYS.SLOT_HOLD(date, time);
  
  // Only release if we hold it
  const currentHolder = await redis.get(key);
  if (currentHolder === bookingId) {
    await redis.del(key);
  }
}

async function extendHold(date: string, time: string, bookingId: string): Promise<boolean> {
  const key = REDIS_KEYS.SLOT_HOLD(date, time);
  const holdSeconds = env.SLOT_HOLD_MINUTES * 60;

  const currentHolder = await redis.get(key);
  if (currentHolder !== bookingId) {
    return false;
  }

  await redis.expire(key, holdSeconds);
  return true;
}

// ============================================
// Booking Creation
// ============================================

export async function createBooking(request: BookingRequest): Promise<BookingResult> {
  const { quoteId, slotDate, slotTime } = request;

  // Validate quote exists and is not expired
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    return { success: false, error: "Quote not found" };
  }

  if (quote.expiresAt < new Date()) {
    return { success: false, error: "Quote has expired. Please get a new quote." };
  }

  // Parse slot datetime
  const startTime = parseSlotDateTime(slotDate, slotTime);
  const pricing = quote.pricingBreakdownJson as unknown as PricingBreakdown;
  const endTime = addMinutes(startTime, pricing.durationMinutes);

  // Validate slot is in the future
  if (isBefore(startTime, new Date())) {
    return { success: false, error: "Cannot book a slot in the past" };
  }

  // Validate it's a working day
  const nzDate = getNzTime(startTime);
  if (!WORKING_DAYS.includes(nzDate.getDay())) {
    return { success: false, error: "Bookings are only available Monday to Friday" };
  }

  // Check if slot is already booked
  const existingBooking = await prisma.booking.findFirst({
    where: {
      startTime,
      status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
    },
  });

  if (existingBooking) {
    return { success: false, error: "This slot is no longer available" };
  }

  // Try to hold the slot
  const bookingId = nanoid(12);
  const held = await holdSlot(slotDate, slotTime, bookingId);

  if (!held) {
    return { success: false, error: "This slot is currently being booked by someone else" };
  }

  // Calculate hold expiry
  const holdExpiresAt = addMinutes(new Date(), env.SLOT_HOLD_MINUTES);

  // Create booking record
  try {
    await prisma.booking.create({
      data: {
        id: bookingId,
        quoteId,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        address: request.address,
        suburb: request.suburb,
        startTime,
        endTime,
        status: "PENDING_PAYMENT",
        holdExpiresAt,
      },
    });

    return {
      success: true,
      bookingId,
      holdExpiresAt,
    };
  } catch (error: any) {
    // Release hold on failure
    await releaseSlot(slotDate, slotTime, bookingId);
    console.error("[Booking] Failed to create booking:", error.message);
    return { success: false, error: "Failed to create booking. Please try again." };
  }
}

// ============================================
// Booking Status Updates
// ============================================

export async function confirmBooking(bookingId: string): Promise<boolean> {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        holdExpiresAt: null,
      },
    });

    // Release the Redis hold (no longer needed)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (booking) {
      const nzTime = getNzTime(booking.startTime);
      const date = format(nzTime, "yyyy-MM-dd");
      const time = format(nzTime, "HH:mm");
      await releaseSlot(date, time, bookingId);
    }

    return true;
  } catch (error: any) {
    console.error("[Booking] Failed to confirm booking:", error.message);
    return false;
  }
}

export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return false;

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    // Release the slot
    const nzTime = getNzTime(booking.startTime);
    const date = format(nzTime, "yyyy-MM-dd");
    const time = format(nzTime, "HH:mm");
    await releaseSlot(date, time, bookingId);

    return true;
  } catch (error: any) {
    console.error("[Booking] Failed to cancel booking:", error.message);
    return false;
  }
}

export async function expireBooking(bookingId: string): Promise<boolean> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.status !== "PENDING_PAYMENT") return false;

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "EXPIRED" },
    });

    // Release the slot
    const nzTime = getNzTime(booking.startTime);
    const date = format(nzTime, "yyyy-MM-dd");
    const time = format(nzTime, "HH:mm");
    await releaseSlot(date, time, bookingId);

    return true;
  } catch (error: any) {
    console.error("[Booking] Failed to expire booking:", error.message);
    return false;
  }
}

// ============================================
// Expired Hold Cleanup (run periodically)
// ============================================

export async function cleanupExpiredHolds(): Promise<number> {
  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: "PENDING_PAYMENT",
      holdExpiresAt: { lt: new Date() },
    },
  });

  let cleaned = 0;
  for (const booking of expiredBookings) {
    const success = await expireBooking(booking.id);
    if (success) cleaned++;
  }

  if (cleaned > 0) {
    console.log(`[Booking] Cleaned up ${cleaned} expired holds`);
  }

  return cleaned;
}

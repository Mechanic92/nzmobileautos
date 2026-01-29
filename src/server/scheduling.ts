/**
 * Technician Scheduling Service
 * Manages availability, time slots, and booking capacity
 */

import { prisma } from "./prisma";
import { getZoneForSuburb, getZoneConfig, AucklandZoneType } from "./zones";
import { addDays, format, parse, isWeekend, isBefore, startOfDay, addMinutes } from "date-fns";

// ============================================
// Configuration
// ============================================

const BUSINESS_HOURS = {
  start: "09:00",
  end: "17:00",
  lastBookingStart: "15:30", // Last slot starts at 3:30pm
};

const SLOT_DURATION_MINUTES = 90; // 1.5 hours per job
const TRAVEL_BUFFER_MINUTES = 30; // Default travel time between jobs
const MAX_BOOKINGS_PER_DAY = 4;
const BOOKING_LEAD_TIME_HOURS = 24; // Minimum notice required

// ============================================
// Types
// ============================================

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "10:30"
  available: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string; // "2026-01-28"
  dayOfWeek: string;
  isWorkingDay: boolean;
  primaryZone?: AucklandZoneType;
  slots: TimeSlot[];
  remainingCapacity: number;
}

export interface AvailabilityResult {
  success: boolean;
  days: DayAvailability[];
  nextAvailable?: {
    date: string;
    slot: TimeSlot;
  };
}

// ============================================
// Helpers
// ============================================

function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

function timeToMinutes(time: string): number {
  const { hours, minutes } = parseTime(time);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function getDayOfWeek(date: Date): string {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[date.getDay()];
}

// ============================================
// Slot Generation
// ============================================

function generateBaseSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startMinutes = timeToMinutes(BUSINESS_HOURS.start);
  const lastSlotMinutes = timeToMinutes(BUSINESS_HOURS.lastBookingStart);
  
  let currentMinutes = startMinutes;
  
  while (currentMinutes <= lastSlotMinutes) {
    const endMinutes = currentMinutes + SLOT_DURATION_MINUTES;
    slots.push({
      start: minutesToTime(currentMinutes),
      end: minutesToTime(endMinutes),
      available: true,
    });
    currentMinutes = endMinutes + TRAVEL_BUFFER_MINUTES;
  }
  
  return slots;
}

// ============================================
// Availability Checking
// ============================================

/**
 * Get availability for a date range
 */
export async function getAvailability(
  startDate: Date,
  days: number = 14,
  suburb?: string
): Promise<AvailabilityResult> {
  const result: DayAvailability[] = [];
  const zone = suburb ? getZoneForSuburb(suburb) : null;
  
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = getDayOfWeek(date);
    
    // Skip weekends (unless special arrangement)
    if (isWeekend(date)) {
      result.push({
        date: dateStr,
        dayOfWeek,
        isWorkingDay: false,
        slots: [],
        remainingCapacity: 0,
      });
      continue;
    }
    
    // Get schedule for this day
    const schedule = await prisma.technicianSchedule.findUnique({
      where: { date: startOfDay(date) },
    });
    
    // Get existing bookings for this day
    const existingBookings = await prisma.booking.count({
      where: {
        slotStart: {
          gte: startOfDay(date),
          lt: addDays(startOfDay(date), 1),
        },
        status: {
          in: ["CONFIRMED", "PENDING_PAYMENT", "IN_PROGRESS"],
        },
      },
    });
    
    const maxBookings = schedule?.maxBookings || MAX_BOOKINGS_PER_DAY;
    const remainingCapacity = Math.max(0, maxBookings - existingBookings);
    
    // Generate slots
    let slots = generateBaseSlots();
    
    // Mark booked slots as unavailable
    if (schedule?.bookedSlots) {
      const bookedSlots = schedule.bookedSlots as Array<{ start: string; end: string }>;
      slots = slots.map(slot => {
        const isBooked = bookedSlots.some(
          booked => booked.start === slot.start
        );
        return isBooked
          ? { ...slot, available: false, reason: "Already booked" }
          : slot;
      });
    }
    
    // Check if this is a preferred day for the zone
    const primaryZone = schedule?.primaryZone as AucklandZoneType | undefined;
    const isPreferredDay = zone && primaryZone === zone;
    
    // If at capacity, mark all slots unavailable
    if (remainingCapacity === 0) {
      slots = slots.map(slot => ({
        ...slot,
        available: false,
        reason: "Fully booked",
      }));
    }
    
    result.push({
      date: dateStr,
      dayOfWeek,
      isWorkingDay: true,
      primaryZone,
      slots,
      remainingCapacity,
    });
  }
  
  // Find next available slot
  let nextAvailable: { date: string; slot: TimeSlot } | undefined;
  for (const day of result) {
    if (!day.isWorkingDay) continue;
    const availableSlot = day.slots.find(s => s.available);
    if (availableSlot) {
      nextAvailable = { date: day.date, slot: availableSlot };
      break;
    }
  }
  
  return {
    success: true,
    days: result,
    nextAvailable,
  };
}

/**
 * Check if a specific slot is available
 */
export async function isSlotAvailable(
  date: Date,
  startTime: string
): Promise<{ available: boolean; reason?: string }> {
  const dateStr = format(date, "yyyy-MM-dd");
  
  // Check minimum lead time
  const slotDateTime = parse(`${dateStr} ${startTime}`, "yyyy-MM-dd HH:mm", new Date());
  const minBookingTime = addMinutes(new Date(), BOOKING_LEAD_TIME_HOURS * 60);
  
  if (isBefore(slotDateTime, minBookingTime)) {
    return {
      available: false,
      reason: `Bookings require at least ${BOOKING_LEAD_TIME_HOURS} hours notice`,
    };
  }
  
  // Check if weekend
  if (isWeekend(date)) {
    return {
      available: false,
      reason: "Weekend bookings require special arrangement",
    };
  }
  
  // Check capacity
  const existingBookings = await prisma.booking.count({
    where: {
      slotStart: {
        gte: startOfDay(date),
        lt: addDays(startOfDay(date), 1),
      },
      status: {
        in: ["CONFIRMED", "PENDING_PAYMENT", "IN_PROGRESS"],
      },
    },
  });
  
  if (existingBookings >= MAX_BOOKINGS_PER_DAY) {
    return {
      available: false,
      reason: "This day is fully booked",
    };
  }
  
  // Check specific slot
  const schedule = await prisma.technicianSchedule.findUnique({
    where: { date: startOfDay(date) },
  });
  
  if (schedule?.bookedSlots) {
    const bookedSlots = schedule.bookedSlots as Array<{ start: string }>;
    const isBooked = bookedSlots.some(s => s.start === startTime);
    if (isBooked) {
      return {
        available: false,
        reason: "This time slot is already booked",
      };
    }
  }
  
  return { available: true };
}

/**
 * Reserve a slot (mark as pending)
 */
export async function reserveSlot(
  date: Date,
  startTime: string,
  bookingId: string
): Promise<boolean> {
  const { available, reason } = await isSlotAvailable(date, startTime);
  
  if (!available) {
    console.error(`[Scheduling] Cannot reserve slot: ${reason}`);
    return false;
  }
  
  const endTime = minutesToTime(timeToMinutes(startTime) + SLOT_DURATION_MINUTES);
  
  // Upsert schedule record
  await prisma.technicianSchedule.upsert({
    where: { date: startOfDay(date) },
    create: {
      date: startOfDay(date),
      startTime: BUSINESS_HOURS.start,
      endTime: BUSINESS_HOURS.end,
      maxBookings: MAX_BOOKINGS_PER_DAY,
      bookedSlots: [{ start: startTime, end: endTime, bookingId }],
    },
    update: {
      bookedSlots: {
        // Append to existing array
        push: { start: startTime, end: endTime, bookingId },
      },
    },
  });
  
  return true;
}

/**
 * Release a slot (on cancellation)
 */
export async function releaseSlot(
  date: Date,
  startTime: string,
  bookingId: string
): Promise<boolean> {
  const schedule = await prisma.technicianSchedule.findUnique({
    where: { date: startOfDay(date) },
  });
  
  if (!schedule) return true;
  
  const bookedSlots = (schedule.bookedSlots as Array<{ start: string; bookingId: string }>) || [];
  const updatedSlots = bookedSlots.filter(
    s => !(s.start === startTime && s.bookingId === bookingId)
  );
  
  await prisma.technicianSchedule.update({
    where: { date: startOfDay(date) },
    data: { bookedSlots: updatedSlots },
  });
  
  return true;
}

/**
 * Get suggested dates based on zone preferences
 */
export async function getSuggestedDates(
  suburb: string,
  count: number = 3
): Promise<string[]> {
  const zone = getZoneForSuburb(suburb);
  if (!zone) {
    // Return next available dates regardless of zone
    const availability = await getAvailability(new Date(), 14);
    return availability.days
      .filter(d => d.isWorkingDay && d.remainingCapacity > 0)
      .slice(0, count)
      .map(d => d.date);
  }
  
  const config = getZoneConfig(zone);
  const preferredDays = config.preferredDays;
  
  const suggested: string[] = [];
  let checkDate = new Date();
  
  while (suggested.length < count && suggested.length < 10) {
    checkDate = addDays(checkDate, 1);
    const dayOfWeek = getDayOfWeek(checkDate);
    
    if (preferredDays.includes(dayOfWeek)) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      
      // Check if there's capacity
      const existingBookings = await prisma.booking.count({
        where: {
          slotStart: {
            gte: startOfDay(checkDate),
            lt: addDays(startOfDay(checkDate), 1),
          },
          status: {
            in: ["CONFIRMED", "PENDING_PAYMENT", "IN_PROGRESS"],
          },
        },
      });
      
      if (existingBookings < MAX_BOOKINGS_PER_DAY) {
        suggested.push(dateStr);
      }
    }
  }
  
  return suggested;
}

/**
 * Initialize schedule for upcoming days
 */
export async function initializeSchedule(days: number = 30): Promise<void> {
  const zoneRotation: AucklandZoneType[] = [
    "NORTH_SHORE",
    "WEST_AUCKLAND",
    "CENTRAL",
    "EAST_AUCKLAND",
    "SOUTH_AUCKLAND",
  ];
  
  for (let i = 0; i < days; i++) {
    const date = addDays(new Date(), i);
    
    if (isWeekend(date)) continue;
    
    const dayOfWeek = getDayOfWeek(date);
    
    // Determine primary zone based on day
    let primaryZone: AucklandZoneType | undefined;
    for (const zone of zoneRotation) {
      const config = getZoneConfig(zone);
      if (config.preferredDays.includes(dayOfWeek)) {
        primaryZone = zone;
        break;
      }
    }
    
    await prisma.technicianSchedule.upsert({
      where: { date: startOfDay(date) },
      create: {
        date: startOfDay(date),
        startTime: BUSINESS_HOURS.start,
        endTime: BUSINESS_HOURS.end,
        primaryZone,
        maxBookings: MAX_BOOKINGS_PER_DAY,
        bookedSlots: [],
      },
      update: {
        primaryZone,
      },
    });
  }
  
  console.log(`[Scheduling] Initialized schedule for ${days} days`);
}

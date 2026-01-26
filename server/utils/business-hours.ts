/**
 * Business Hours Validation for Mobile Autoworks NZ
 * Timezone: Pacific/Auckland
 * 
 * Rules:
 * - Monday-Friday: 9:00am - 5:00pm
 * - Last bookable start time: 3:30pm (allows 90min job to complete by 5pm)
 * - Saturday & Sunday: By appointment only (no self-serve slots)
 * - Default job duration: 90 minutes
 * - Buffer between bookings: 30 minutes (configurable)
 * - Max bookings per day: 4 (configurable)
 */

import { BusinessHoursConfig, TimeSlot, ValidationResult } from '../../shared/types/booking';

// Configuration - can be overridden via environment variables
export const BUSINESS_HOURS_CONFIG: BusinessHoursConfig = {
  timezone: 'Pacific/Auckland',
  weekdays: {
    openTime: process.env.BUSINESS_OPEN_TIME || '09:00',
    closeTime: process.env.BUSINESS_CLOSE_TIME || '17:00',
    lastBookingTime: process.env.BUSINESS_LAST_BOOKING_TIME || '15:30',
  },
  defaultJobDurationMinutes: parseInt(process.env.JOB_DURATION_MINUTES || '90', 10),
  bufferBetweenBookingsMinutes: parseInt(process.env.BOOKING_BUFFER_MINUTES || '30', 10),
  maxBookingsPerDay: parseInt(process.env.MAX_BOOKINGS_PER_DAY || '4', 10),
  weekendMessage: 'Weekend – By Appointment Only. Please describe your preferred time window and we will contact you to confirm.',
};

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes since midnight to HH:mm
 */
function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Get current date/time in Auckland timezone
 */
export function getNZDateTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: BUSINESS_HOURS_CONFIG.timezone }));
}

/**
 * Convert a date to Auckland timezone
 */
export function toNZDate(date: Date): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: BUSINESS_HOURS_CONFIG.timezone }));
}

/**
 * Check if a given date is a weekend (Saturday = 6, Sunday = 0)
 */
export function isWeekend(date: Date): boolean {
  const nzDate = toNZDate(date);
  const day = nzDate.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if a given date is a weekday
 */
export function isWeekday(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Get the day name for a date
 */
export function getDayName(date: Date): string {
  const nzDate = toNZDate(date);
  return nzDate.toLocaleDateString('en-NZ', { weekday: 'long', timeZone: BUSINESS_HOURS_CONFIG.timezone });
}

/**
 * Generate available time slots for a given date
 * Returns empty array for weekends (by appointment only)
 */
export function getAvailableTimeSlots(date: Date, existingBookingsCount: number = 0): TimeSlot[] {
  const nzDate = toNZDate(date);
  
  // No self-serve slots on weekends
  if (isWeekend(nzDate)) {
    return [];
  }

  // Check if max bookings reached
  if (existingBookingsCount >= BUSINESS_HOURS_CONFIG.maxBookingsPerDay) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const { openTime, lastBookingTime } = BUSINESS_HOURS_CONFIG.weekdays;
  const { bufferBetweenBookingsMinutes } = BUSINESS_HOURS_CONFIG;

  const openMinutes = parseTimeToMinutes(openTime);
  const lastMinutes = parseTimeToMinutes(lastBookingTime);
  const slotInterval = 30; // 30-minute intervals

  for (let minutes = openMinutes; minutes <= lastMinutes; minutes += slotInterval) {
    const time = formatMinutesToTime(minutes);
    slots.push({
      time,
      available: true,
    });
  }

  return slots;
}

/**
 * Validate a booking time against business hours rules
 * This is the SERVER-SIDE validation that cannot be bypassed
 */
export function validateBookingTime(
  preferredDate: string, // YYYY-MM-DD
  preferredTime: string, // HH:mm
  isWeekendBooking: boolean = false
): ValidationResult {
  const errors: string[] = [];

  // Parse the date
  const [year, month, day] = preferredDate.split('-').map(Number);
  const bookingDate = new Date(year, month - 1, day);
  const nzBookingDate = toNZDate(bookingDate);

  // Check if date is in the past
  const now = getNZDateTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const bookingDay = new Date(nzBookingDate.getFullYear(), nzBookingDate.getMonth(), nzBookingDate.getDate());
  
  if (bookingDay < today) {
    errors.push('Booking date cannot be in the past');
  }

  // Check weekend vs weekday
  const weekend = isWeekend(bookingDate);

  if (weekend) {
    // Weekend bookings require admin approval
    if (!isWeekendBooking) {
      errors.push('Weekend bookings require appointment approval. Please select a weekday or indicate this is a weekend booking request.');
    }
    // For weekend bookings, we don't validate the time - it's just a preference
    return { valid: errors.length === 0, errors };
  }

  // Weekday validation
  const { openTime, closeTime, lastBookingTime } = BUSINESS_HOURS_CONFIG.weekdays;
  const requestedMinutes = parseTimeToMinutes(preferredTime);
  const openMinutes = parseTimeToMinutes(openTime);
  const closeMinutes = parseTimeToMinutes(closeTime);
  const lastMinutes = parseTimeToMinutes(lastBookingTime);

  // Check if time is before opening
  if (requestedMinutes < openMinutes) {
    errors.push(`Booking time must be after ${openTime} (business opens at ${openTime})`);
  }

  // Check if time is after last booking slot
  if (requestedMinutes > lastMinutes) {
    errors.push(`Last available booking slot is ${lastBookingTime}. Jobs must complete by ${closeTime}.`);
  }

  // Check if time is after closing (should never happen if lastBookingTime is set correctly)
  if (requestedMinutes >= closeMinutes) {
    errors.push(`Business closes at ${closeTime}. Please select an earlier time.`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if a specific date has capacity for more bookings
 */
export async function checkDailyCapacity(
  date: string,
  getBookingCountForDate: (date: string) => Promise<number>
): Promise<{ hasCapacity: boolean; currentCount: number; maxCount: number }> {
  const currentCount = await getBookingCountForDate(date);
  const maxCount = BUSINESS_HOURS_CONFIG.maxBookingsPerDay;
  
  return {
    hasCapacity: currentCount < maxCount,
    currentCount,
    maxCount,
  };
}

/**
 * Get formatted business hours for display
 */
export function getFormattedBusinessHours(): {
  weekdays: string;
  weekends: string;
  lastBooking: string;
} {
  const { openTime, closeTime, lastBookingTime } = BUSINESS_HOURS_CONFIG.weekdays;
  
  return {
    weekdays: `Monday – Friday: ${formatTime12h(openTime)} – ${formatTime12h(closeTime)}`,
    weekends: BUSINESS_HOURS_CONFIG.weekendMessage,
    lastBooking: `Last available booking: ${formatTime12h(lastBookingTime)}`,
  };
}

/**
 * Format 24h time to 12h format
 */
function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  return minutes === 0 ? `${displayHours}${period}` : `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
}

/**
 * Get the next available booking date (skips weekends for self-serve)
 */
export function getNextAvailableDate(): string {
  const now = getNZDateTime();
  let date = new Date(now);
  
  // If it's past the last booking time today, start from tomorrow
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const lastMinutes = parseTimeToMinutes(BUSINESS_HOURS_CONFIG.weekdays.lastBookingTime);
  
  if (currentMinutes > lastMinutes) {
    date.setDate(date.getDate() + 1);
  }
  
  // Skip weekends
  while (isWeekend(date)) {
    date.setDate(date.getDate() + 1);
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Validate that the booking is not too far in the future (max 60 days)
 */
export function validateBookingDateRange(preferredDate: string): ValidationResult {
  const errors: string[] = [];
  const maxDaysAhead = 60;
  
  const [year, month, day] = preferredDate.split('-').map(Number);
  const bookingDate = new Date(year, month - 1, day);
  const now = getNZDateTime();
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + maxDaysAhead);
  
  if (bookingDate > maxDate) {
    errors.push(`Bookings can only be made up to ${maxDaysAhead} days in advance`);
  }
  
  return { valid: errors.length === 0, errors };
}

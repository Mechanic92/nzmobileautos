import { addMinutes, isBefore, isAfter, setHours, setMinutes, startOfDay } from 'date-fns';

export interface GeneratedSlot {
  start: Date;
  end: Date;
  available: boolean;
}

/**
 * Generate slots for a single business day.
 * Enforces:
 * - Mon-Fri 09:00 - 17:00
 * - Last start: 15:30
 * - Job end must be <= 17:00
 * - Granularity: 30-minute intervals for start times
 */
export function generateAvailableSlots(
  date: Date,
  occupiedRanges: { start: Date; end: Date }[],
  durationMinutes: number = 60
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];
  
  // Boundary calculations
  const businessStart = setMinutes(setHours(startOfDay(date), 9), 0);
  const businessEnd = setMinutes(setHours(startOfDay(date), 17), 0);
  const lastPossibleStart = setMinutes(setHours(startOfDay(date), 15), 30);

  let cursor = new Date(businessStart);

  while (cursor <= lastPossibleStart) {
    const potentialEnd = addMinutes(cursor, durationMinutes);

    // Rule: Cannot extend beyond business hours
    if (potentialEnd > businessEnd) {
      cursor = addMinutes(cursor, 30);
      continue;
    }

    // Overlap check (including a small 5min buffer for safety if desired, but strict for now)
    const isOccupied = occupiedRanges.some(occupied => {
      // Overlap formula: (StartA < EndB) && (EndA > StartB)
      return cursor < occupied.end && potentialEnd > occupied.start;
    });

    slots.push({
      start: new Date(cursor),
      end: new Date(potentialEnd),
      available: !isOccupied
    });

    cursor = addMinutes(cursor, 30);
  }

  return slots;
}

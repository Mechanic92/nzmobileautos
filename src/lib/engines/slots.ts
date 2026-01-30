import { addMinutes, isBefore, isAfter, setHours, setMinutes, startOfDay } from 'date-fns';

export interface GeneratedSlot {
  start: Date;
  end: Date;
  available: boolean;
}

function getTimeZoneOffsetMs(dateUtc: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-NZ", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(dateUtc);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  const y = Number(get("year"));
  const mo = Number(get("month"));
  const d = Number(get("day"));
  const h = Number(get("hour"));
  const mi = Number(get("minute"));
  const s = Number(get("second"));

  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi, s);
  return asIfUtc - dateUtc.getTime();
}

function zonedDateTimeToUtc(
  input: { year: number; month: number; day: number; hour: number; minute: number },
  timeZone: string
) {
  // Start with a UTC date assuming the local components are UTC (we will correct with offset)
  const utcGuess = new Date(Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, 0));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMs);
}

function getZonedYmd(dateUtc: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-NZ", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = dtf.formatToParts(dateUtc);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
  };
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

  // Compute the local calendar date for Pacific/Auckland, then convert desired local times to UTC.
  // This keeps business hours stable even when the server runs in UTC.
  const tz = "Pacific/Auckland";
  const ymd = getZonedYmd(date, tz);

  const businessStart = zonedDateTimeToUtc({ ...ymd, hour: 9, minute: 0 }, tz);
  const businessEnd = zonedDateTimeToUtc({ ...ymd, hour: 17, minute: 0 }, tz);
  const lastPossibleStart = zonedDateTimeToUtc({ ...ymd, hour: 15, minute: 30 }, tz);

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

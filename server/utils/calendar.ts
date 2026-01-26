import { google } from "googleapis";

const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

let calendar: any = null;

function getCalendarClient() {
    if (calendar) return calendar;

    if (!GOOGLE_SERVICE_ACCOUNT_JSON) {
        console.warn("[Calendar] GOOGLE_SERVICE_ACCOUNT_JSON not configured");
        return null;
    }

    try {
        const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/calendar"],
        });

        calendar = google.calendar({ version: "v3", auth });
        return calendar;
    } catch (error) {
        console.error("[Calendar] Failed to initialize:", error);
        return null;
    }
}

export interface CalendarEventData {
    customerName: string;
    phone: string;
    email: string;
    address: string;
    suburb: string;
    vehicleRego: string;
    vehicleMake: string;
    vehicleModel: string;
    serviceType: string;
    appointmentDate: string; // ISO string
    appointmentTime: string;
    notes: string;
    stripeSessionId: string;
    paymentIntentId?: string;
    amountPaid: number;
    paidAt: string;
}

function parsePreferredDateTime(appointmentDate: string, appointmentTime: string): { start: string; end: string } {
    try {
        // Try to parse the appointment date as ISO
        const date = new Date(appointmentDate);

        // If we have a time slot like "08:00-10:00", use the start time
        const timeMatch = appointmentTime.match(/^(\d{2}):(\d{2})/);
        if (timeMatch) {
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);

            // Set to NZ timezone
            const startDate = new Date(date);
            startDate.setHours(hours, minutes, 0, 0);

            const endDate = new Date(startDate);
            endDate.setHours(startDate.getHours() + 2); // Default 2 hour duration

            return {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
            };
        }

        // Fallback: use 9am-11am on the given date
        const startDate = new Date(date);
        startDate.setHours(9, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(11, 0, 0, 0);

        return {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
        };
    } catch (error) {
        // If parsing fails, default to next business day 9am-11am NZ time
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);

        const endTime = new Date(tomorrow);
        endTime.setHours(11, 0, 0, 0);

        return {
            start: tomorrow.toISOString(),
            end: endTime.toISOString(),
        };
    }
}

export async function createCalendarEvent(data: CalendarEventData): Promise<{ eventId: string; eventLink: string } | null> {
    const cal = getCalendarClient();
    if (!cal) {
        console.warn("[Calendar] Calendar client not available");
        return null;
    }

    try {
        const { start, end } = parsePreferredDateTime(data.appointmentDate, data.appointmentTime);

        const event = {
            summary: `Mobile AutoWorks – ${data.serviceType} – ${data.vehicleRego || 'No Rego'}`,
            location: `${data.address}, ${data.suburb}`,
            description: `
PAID BOOKING CONFIRMATION

Customer: ${data.customerName}
Phone: ${data.phone}
Email: ${data.email}
Address: ${data.address}, ${data.suburb}

Vehicle: ${data.vehicleMake} ${data.vehicleModel} (${data.vehicleRego || 'No Rego'})
Service: ${data.serviceType}

Preferred Date/Time: ${data.appointmentDate} ${data.appointmentTime}
Notes: ${data.notes || 'None'}

Payment Details:
- Stripe Session: ${data.stripeSessionId}
- Payment Intent: ${data.paymentIntentId || 'N/A'}
- Amount Paid: $${(data.amountPaid / 100).toFixed(2)} NZD
- Paid At: ${data.paidAt}
      `.trim(),
            start: {
                dateTime: start,
                timeZone: "Pacific/Auckland",
            },
            end: {
                dateTime: end,
                timeZone: "Pacific/Auckland",
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "email", minutes: 24 * 60 }, // 1 day before
                    { method: "popup", minutes: 60 }, // 1 hour before
                ],
            },
        };

        const response = await cal.events.insert({
            calendarId: GOOGLE_CALENDAR_ID,
            requestBody: event,
        });

        console.log("[Calendar] Event created:", response.data.id);

        return {
            eventId: response.data.id!,
            eventLink: response.data.htmlLink!,
        };
    } catch (error: any) {
        console.error("[Calendar] Failed to create event:", error.message);
        return null;
    }
}

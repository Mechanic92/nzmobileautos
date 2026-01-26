/**
 * SMS Notification Service for Mobile Autoworks NZ
 * Uses a configurable SMS provider (default: console logging for development)
 * 
 * Supported providers:
 * - Twilio (set SMS_PROVIDER=twilio)
 * - MessageBird (set SMS_PROVIDER=messagebird)
 * - Console (default, for development)
 */

export interface SMSPayload {
  to: string;
  message: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Owner phone number for notifications
const OWNER_PHONE = process.env.OWNER_PHONE || process.env.SMS_NOTIFY_PHONE || '';
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'console';

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

/**
 * Send SMS via configured provider
 */
export async function sendSMS(payload: SMSPayload): Promise<SMSResult> {
  const { to, message } = payload;

  // Validate phone number format (basic NZ validation)
  if (!isValidNZPhone(to)) {
    return { success: false, error: 'Invalid NZ phone number format' };
  }

  switch (SMS_PROVIDER) {
    case 'twilio':
      return sendViaTwilio(to, message);
    case 'messagebird':
      return sendViaMessageBird(to, message);
    default:
      return sendViaConsole(to, message);
  }
}

/**
 * Send SMS notification to business owner
 */
export async function notifyOwnerViaSMS(data: {
  bookingRef: string;
  serviceType: string;
  amountPaid: number;
  customerName: string;
  phone: string;
  address: string;
  vehicleRego: string;
  preferredDate: string;
  preferredTime: string;
}): Promise<SMSResult> {
  if (!OWNER_PHONE) {
    console.warn('[SMS] Owner phone not configured, skipping SMS notification');
    return { success: false, error: 'Owner phone not configured' };
  }

  const message = `
NEW PAID BOOKING!
Ref: ${data.bookingRef}
Service: ${data.serviceType}
Amount: $${(data.amountPaid / 100).toFixed(2)}
Customer: ${data.customerName}
Phone: ${data.phone}
Rego: ${data.vehicleRego}
When: ${data.preferredDate} ${data.preferredTime}
Address: ${data.address}
`.trim();

  return sendSMS({ to: OWNER_PHONE, message });
}

/**
 * Validate NZ phone number format
 * Accepts: 02X XXX XXXX, +64 2X XXX XXXX, 642XXXXXXXX
 */
export function isValidNZPhone(phone: string): boolean {
  // Remove all whitespace and dashes
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // NZ mobile patterns
  const patterns = [
    /^02[0-9]{7,9}$/,           // 02X XXX XXXX (7-9 digits after 02)
    /^\+642[0-9]{7,9}$/,        // +64 2X XXX XXXX
    /^642[0-9]{7,9}$/,          // 642XXXXXXXX
    /^0800[0-9]{6}$/,           // 0800 numbers
    /^09[0-9]{7}$/,             // Auckland landline
    /^0[3-9][0-9]{7}$/,         // Other NZ landlines
  ];

  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Format phone number to E.164 format for NZ
 */
export function formatToE164(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Already in E.164 format
  if (cleaned.startsWith('+64')) {
    return cleaned;
  }
  
  // Starts with 64 (missing +)
  if (cleaned.startsWith('64') && cleaned.length >= 10) {
    return '+' + cleaned;
  }
  
  // Starts with 0 (local format)
  if (cleaned.startsWith('0')) {
    return '+64' + cleaned.substring(1);
  }
  
  return cleaned;
}

/**
 * Send via Twilio
 */
async function sendViaTwilio(to: string, message: string): Promise<SMSResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.error('[SMS] Twilio credentials not configured');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const formattedTo = formatToE164(to);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: TWILIO_FROM_NUMBER,
        Body: message,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[SMS] Twilio message sent: ${data.sid}`);
      return { success: true, messageId: data.sid };
    } else {
      console.error('[SMS] Twilio error:', data);
      return { success: false, error: data.message || 'Twilio error' };
    }
  } catch (error: any) {
    console.error('[SMS] Twilio exception:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send via MessageBird (placeholder - implement if needed)
 */
async function sendViaMessageBird(to: string, message: string): Promise<SMSResult> {
  console.warn('[SMS] MessageBird not implemented, falling back to console');
  return sendViaConsole(to, message);
}

/**
 * Console logging for development
 */
async function sendViaConsole(to: string, message: string): Promise<SMSResult> {
  console.log('='.repeat(50));
  console.log('[SMS] Development Mode - Message would be sent:');
  console.log(`To: ${to}`);
  console.log(`Message:\n${message}`);
  console.log('='.repeat(50));
  
  return { success: true, messageId: `dev-${Date.now()}` };
}

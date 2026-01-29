/**
 * Gearbox Workshop Management Integration
 * Uses the PUBLIC tRPC API - No authentication required!
 * 
 * Gearbox URL: https://gearbox-workshop-production.up.railway.app
 * API: /api/trpc (public booking endpoints)
 * 
 * Requirements:
 * - GEARBOX_SHOP_ID (Ledger ID from Gearbox settings)
 * - No API key needed - endpoints are public!
 */

interface GearboxBookingPayload {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  vehicle: {
    plate: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    snapshot: any;
  };
  booking: {
    id: string;
    startTime: Date;
    endTime: Date;
    address: string;
    serviceType: string;
    totalAmount: number;
  };
  payment: {
    stripeSessionId: string;
    amount: number;
  };
}

export async function pushToGearbox(payload: GearboxBookingPayload) {
  const GEARBOX_API_URL = process.env.GEARBOX_API_URL || 'https://gearbox-workshop-production.up.railway.app';
  const GEARBOX_SHOP_ID = process.env.GEARBOX_SHOP_ID || process.env.GEARBOX_LEDGER_ID || '3';

  // Construct tRPC endpoint for public booking creation
  const endpoint = `${GEARBOX_API_URL}/api/trpc/publicBooking.create`;

  const makeRequest = async () => {
    // tRPC format: POST with input in query string or body
    const bookingData = {
      shopId: GEARBOX_SHOP_ID,
      customer: {
        name: payload.customer.name,
        email: payload.customer.email,
        phone: payload.customer.phone,
      },
      vehicle: {
        registration: payload.vehicle.plate,
        vin: payload.vehicle.vin || '',
        make: payload.vehicle.make,
        model: payload.vehicle.model,
        year: payload.vehicle.year.toString(),
      },
      service: {
        type: payload.booking.serviceType,
        description: `${payload.booking.serviceType} - Booked via website`,
        scheduledDate: payload.booking.startTime.toISOString(),
        scheduledTime: payload.booking.startTime.toISOString().split('T')[1].substring(0, 5),
        duration: 60, // Default 1 hour
        address: payload.booking.address,
      },
      notes: `Website Booking ID: ${payload.booking.id}\nStripe Session: ${payload.payment.stripeSessionId}\nAmount Paid: $${payload.payment.amount}\nPayment Status: PAID`,
      source: 'WEBSITE',
      externalId: payload.booking.id,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: bookingData
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gearbox API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.result?.data || result;
  };

  // Retry logic (3 attempts with exponential backoff)
  let attempts = 0;
  while (attempts < 3) {
    try {
      const result = await makeRequest();
      console.log(`[Gearbox] Booking created successfully for ${payload.booking.id}`, result);
      
      // Extract job/booking ID from response
      const jobId = result.id || result.bookingId || result.jobId;
      
      return { 
        success: true, 
        jobId,
        message: 'Booking synced to Gearbox'
      };
    } catch (error: any) {
      attempts++;
      console.error(`[Gearbox] Attempt ${attempts} failed:`, error.message);
      
      if (attempts >= 3) {
        // Log error but don't fail the webhook - booking is still confirmed
        console.error(`[Gearbox] Max retries exceeded for booking ${payload.booking.id}`);
        console.error(`[Gearbox] Manual sync may be required`);
        
        return { 
          success: false, 
          error: error.message,
          requiresManualSync: true
        };
      }
      
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts - 1)));
    }
  }

  return { 
    success: false, 
    error: 'MAX_RETRIES_EXCEEDED',
    requiresManualSync: true
  };
}

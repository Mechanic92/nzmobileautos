/**
 * Gearbox SaaS Public Ingestion Client
 * Handles pushing confirmed bookings into the Gearbox system.
 */
export async function pushToGearbox(payload: {
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
}) {
  const GEARBOX_API_URL = process.env.GEARBOX_API_URL || 'https://api.gearbox.io/v1'; // Placeholder
  const GEARBOX_API_KEY = process.env.GEARBOX_API_KEY;

  if (!GEARBOX_API_KEY) {
    console.error('[Gearbox] API Key missing. Skipping ingestion.');
    return { success: false, error: 'API_KEY_MISSING' };
  }

  const endpoint = `${GEARBOX_API_URL}/public/bookings/ingest`;

  const makeRequest = async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEARBOX_API_KEY}`,
      },
      body: JSON.stringify({
        ...payload,
        source: 'WEBSITE_CONVERSION_ENGINE',
        version: '1.0'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gearbox API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  };

  // Simple retry logic (3 attempts)
  let attempts = 0;
  while (attempts < 3) {
    try {
      const result = await makeRequest();
      console.log(`[Gearbox] Ingestion successful for booking ${payload.booking.id}`);
      return { success: true, jobId: result.id };
    } catch (error: any) {
      attempts++;
      console.error(`[Gearbox] Attempt ${attempts} failed:`, error.message);
      if (attempts >= 3) {
        return { success: false, error: error.message };
      }
      // Backoff? Optional for now.
      await new Promise(r => setTimeout(r, 1000 * attempts));
    }
  }

  return { success: false, error: 'MAX_RETRIES_EXCEEDED' };
}

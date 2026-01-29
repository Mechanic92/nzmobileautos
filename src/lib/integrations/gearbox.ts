/**
 * Gearbox Workshop Management Integration
 * 
 * Contract (per product requirements):
 * - Do NOT create bookings in Gearbox.
 * - Only push CONFIRMED + PAID jobs to Gearbox for job flow automation.
 * 
 * This module therefore posts a "paid job" payload to a configurable Gearbox ingest URL.
 */

interface GearboxPaidJobPayload {
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
  job: {
    id: string;
    startTime: Date;
    endTime: Date;
    address: string;
    serviceType: string;
    totalAmountCents: number;
  };
  payment: {
    stripeSessionId: string;
    amountCents: number;
  };
}

export async function pushPaidJobToGearbox(payload: GearboxPaidJobPayload) {
  const endpoint = (process.env.GEARBOX_PAID_JOB_INGEST_URL || process.env.GEARBOX_INGEST_URL || "").trim();

  if (!endpoint) {
    return {
      success: false,
      error: "GEARBOX_PAID_JOB_INGEST_URL not configured",
      requiresManualSync: true,
    };
  }

  const makeRequest = async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kind: "PAID_JOB",
        occurredAt: new Date().toISOString(),
        payload,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gearbox API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  };

  // Retry logic (3 attempts with exponential backoff)
  let attempts = 0;
  while (attempts < 3) {
    try {
      const result = await makeRequest();
      console.log(`[Gearbox] Paid job pushed successfully for ${payload.job.id}`, result);

      const jobId = (result as any)?.id || (result as any)?.jobId || (result as any)?.externalId;
      
      return { 
        success: true, 
        jobId,
        message: 'Paid job pushed to Gearbox'
      };
    } catch (error: any) {
      attempts++;
      console.error(`[Gearbox] Attempt ${attempts} failed:`, error.message);
      
      if (attempts >= 3) {
        // Log error but don't fail the webhook - booking is still confirmed
        console.error(`[Gearbox] Max retries exceeded for paid job ${payload.job.id}`);
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

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "chris@mobileautoworksnz.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "bookings@mobileautoworksnz.com";

export interface BookingConfirmationEmailData {
  bookingRef: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  suburb: string;
  vehicleRego: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  stripeSessionId: string;
  paymentIntentId?: string;
  amountPaid: number;
  paidAt: string;
  calendarEventId?: string;
  calendarEventLink?: string;
  calendarFailed?: boolean;
}

export interface QuoteRequestEmailData {
  customerName: string;
  email: string;
  phone: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  serviceType: string;
  suburb?: string;
  message?: string;
}

export async function sendAdminQuoteEmail(data: QuoteRequestEmailData): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] Resend not configured, logging quote instead");
    console.log("[Email] Quote request:", data);
    return false;
  }

  try {
    const subject = `NEW QUOTE REQUEST – ${data.customerName} – ${data.serviceType}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; margin-top: 20px; border: 1px solid #e5e7eb; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #1f2937; }
    .value { color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 New Quote Request</h1>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Customer Info</h2>
        <p><span class="label">Name:</span> <span class="value">${data.customerName}</span></p>
        <p><span class="label">Email:</span> <span class="value">${data.email}</span></p>
        <p><span class="label">Phone:</span> <span class="value">${data.phone}</span></p>
        <p><span class="label">Suburb:</span> <span class="value">${data.suburb || 'Not specified'}</span></p>
      </div>
      
      <div class="section">
        <h2>Vehicle Info</h2>
        <p><span class="label">Vehicle:</span> <span class="value">${data.vehicleYear || ''} ${data.vehicleMake || ''} ${data.vehicleModel || ''}</span></p>
      </div>
      
      <div class="section">
        <h2>Service Details</h2>
        <p><span class="label">Requested Service:</span> <span class="value">${data.serviceType}</span></p>
        ${data.message ? `<p><span class="label">Message:</span> <br/><span class="value">${data.message.replace(/\n/g, '<br/>')}</span></p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send admin quote email:", error.message);
    return false;
  }
}

export async function sendCustomerQuoteEmail(data: QuoteRequestEmailData): Promise<boolean> {
  if (!resend) return false;

  try {
    const subject = `Quote Request Received – Mobile Autoworks NZ`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>We've Received Your Request</h1>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Thanks for requesting a quote for <strong>${data.serviceType}</strong>. We have received your details and will review them shortly.</p>
      <p>Our team will get back to you as soon as possible with a formal quote or any clarifying questions.</p>
      <p>If you need urgent assistance, feel free to call us at <strong>027 642 1824</strong>.</p>
      <br/>
      <p>Best regards,<br/>Mobile Autoworks NZ</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html,
    });

    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send customer quote email:", error.message);
    return false;
  }
}

export async function sendCustomerBookingReceivedEmail(data: {
  customerName: string;
  email: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  needsPayment: boolean;
}): Promise<boolean> {
  if (!resend) return false;

  try {
    const subject = `Booking Received – Mobile Autoworks NZ`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>We've Received Your Booking</h1>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Thanks for booking <strong>${data.serviceType}</strong> for <strong>${data.appointmentDate}</strong> at <strong>${data.appointmentTime}</strong>.</p>
      
      ${data.needsPayment ? `
      <p>We've received your request. To finalize your booking and secure your slot, please ensure you complete the secure payment through the checkout link provided.</p>
      ` : `
      <p>We've received your details and will be in touch shortly to confirm your booking.</p>
      `}
      
      <p>If you have any questions, feel free to reply to this email or call us at <strong>027 642 1824</strong>.</p>
      <br/>
      <p>Best regards,<br/>Mobile Autoworks NZ</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html,
    });

    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send customer booking received email:", error.message);
    return false;
  }
}

export async function sendAdminBookingAttemptEmail(data: {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
  vehicleRego?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  paymentStatus: string;
}): Promise<boolean> {
  if (!resend) return false;

  try {
    const subject = `NEW BOOKING ATTEMPT – ${data.customerName} – ${data.serviceType}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; margin-top: 20px; border: 1px solid #e5e7eb; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #1f2937; }
    .value { color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 New Booking Attempt</h1>
      <p>Status: <strong>${data.paymentStatus}</strong></p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Customer Info</h2>
        <p><span class="label">Name:</span> <span class="value">${data.customerName}</span></p>
        <p><span class="label">Email:</span> <span class="value">${data.email}</span></p>
        <p><span class="label">Phone:</span> <span class="value">${data.phone}</span></p>
        <p><span class="label">Address:</span> <span class="value">${data.address}, ${data.suburb}</span></p>
      </div>
      
      <div class="section">
        <h2>Vehicle Info</h2>
        <p><span class="label">Vehicle:</span> <span class="value">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel} (${data.vehicleRego || 'No Rego'})</span></p>
      </div>
      
      <div class="section">
        <h2>Appointment Details</h2>
        <p><span class="label">Service:</span> <span class="value">${data.serviceType}</span></p>
        <p><span class="label">Preferred Date:</span> <span class="value">${data.appointmentDate}</span></p>
        <p><span class="label">Preferred Time:</span> <span class="value">${data.appointmentTime}</span></p>
        ${data.notes ? `<p><span class="label">Notes:</span> <span class="value">${data.notes}</span></p>` : ''}
      </div>
      
      <p style="font-size: 0.875rem; color: #6b7280; margin-top: 20px; border-top: 1px solid #e5e7eb; pt: 10px;">
        Note: This email was sent immediately upon form submission. If payment is required, you will receive a <strong>separate confirmation email</strong> once Stripe confirms the transaction.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send admin booking attempt email:", error.message);
    return false;
  }
}

export async function sendAdminBookingConfirmation(data: BookingConfirmationEmailData): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] Resend not configured, logging email instead");
    console.log("[Email] Would send admin confirmation:", data);
    return false;
  }

  try {
    const subject = `PAID BOOKING – ${data.vehicleRego || 'No Rego'} – ${data.bookingRef}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; margin-top: 20px; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #1f2937; }
    .value { color: #4b5563; }
    .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; }
    .success { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ PAID BOOKING CONFIRMED</h1>
      <p>Booking Reference: <strong>${data.bookingRef}</strong></p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Customer Information</h2>
        <p><span class="label">Name:</span> <span class="value">${data.customerName}</span></p>
        <p><span class="label">Phone:</span> <span class="value">${data.phone}</span></p>
        <p><span class="label">Email:</span> <span class="value">${data.email}</span></p>
        <p><span class="label">Address:</span> <span class="value">${data.address}, ${data.suburb}</span></p>
      </div>
      
      <div class="section">
        <h2>Vehicle Details</h2>
        <p><span class="label">Registration:</span> <span class="value">${data.vehicleRego || 'Not provided'}</span></p>
        <p><span class="label">Vehicle:</span> <span class="value">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</span></p>
      </div>
      
      <div class="section">
        <h2>Service Details</h2>
        <p><span class="label">Service Type:</span> <span class="value">${data.serviceType}</span></p>
        <p><span class="label">Preferred Date:</span> <span class="value">${data.appointmentDate}</span></p>
        <p><span class="label">Preferred Time:</span> <span class="value">${data.appointmentTime}</span></p>
        ${data.notes ? `<p><span class="label">Notes:</span> <span class="value">${data.notes}</span></p>` : ''}
      </div>
      
      <div class="section">
        <h2>Payment Information</h2>
        <p><span class="label">Amount Paid:</span> <span class="value">$${(data.amountPaid / 100).toFixed(2)} NZD</span></p>
        <p><span class="label">Paid At:</span> <span class="value">${new Date(data.paidAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}</span></p>
        <p><span class="label">Stripe Session:</span> <span class="value">${data.stripeSessionId}</span></p>
        ${data.paymentIntentId ? `<p><span class="label">Payment Intent:</span> <span class="value">${data.paymentIntentId}</span></p>` : ''}
      </div>
      
      ${data.calendarFailed ? `
      <div class="alert">
        <strong>⚠️ Calendar Event Failed</strong>
        <p>The calendar event could not be created automatically. Please add this booking to your calendar manually.</p>
      </div>
      ` : data.calendarEventId ? `
      <div class="success">
        <strong>✅ Calendar Event Created</strong>
        <p><span class="label">Event ID:</span> ${data.calendarEventId}</p>
        ${data.calendarEventLink ? `<p><a href="${data.calendarEventLink}">View in Google Calendar</a></p>` : ''}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
    `.trim();

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    console.log("[Email] Admin confirmation sent:", result.data?.id);
    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send admin confirmation:", error.message);
    return false;
  }
}

export async function sendCustomerBookingConfirmation(data: BookingConfirmationEmailData): Promise<boolean> {
  if (!resend) return false;

  try {
    const subject = `Booking Confirmed – ${data.serviceType} – ${data.bookingRef}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
    .section { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f3f4f6; }
    .highlight { background: #f0fdf4; border-radius: 8px; padding: 15px; border: 1px solid #dcfce7; }
    h2 { color: #1e293b; font-size: 1.25rem; margin-top: 0; }
    .footer { font-size: 0.875rem; color: #6b7280; text-align: center; margin-top: 30px; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmed!</h1>
      <p>Reference: <strong>${data.bookingRef}</strong></p>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Thank you for choosing Mobile Autoworks NZ. We’ve received your payment and your booking is confirmed.</p>
      
      <div class="highlight section">
        <h2>Appointment Details</h2>
        <p><strong>Service:</strong> ${data.serviceType}</p>
        <p><strong>Date:</strong> ${data.appointmentDate}</p>
        <p><strong>Time:</strong> ${data.appointmentTime}</p>
        <p><strong>Location:</strong> ${data.address}, ${data.suburb}</p>
      </div>

      <div class="section">
        <h2>🚗 Preparation Checklist</h2>
        <p>To ensure we can complete the job efficiently, please ensure:</p>
        <ul>
          <li>The vehicle is parked on reasonably flat, solid ground.</li>
          <li>There is at least 1 meter of space around the vehicle.</li>
          <li>The keys are available at the scheduled time.</li>
          <li>Pets and children are kept clear of the work area for safety.</li>
        </ul>
      </div>

      <div class="section">
        <h2>📜 Cancellation Policy</h2>
        <p>We understand plans change. Here is our policy:</p>
        <ul>
          <li><strong>48+ hours notice:</strong> Full refund or free rescheduling.</li>
          <li><strong>24-48 hours notice:</strong> 50% refund or $50 rescheduling fee.</li>
          <li><strong>Less than 24 hours:</strong> No refund (call-out costs covered).</li>
        </ul>
      </div>

      <p>If you need to make changes, please reply to this email or call us at <strong>027 642 1824</strong>.</p>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Mobile Autoworks NZ. All rights reserved.</p>
        <p>Mobile Mechanical Specialists · West Auckland</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html,
    });

    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send customer confirmation:", error.message);
    return false;
  }
}

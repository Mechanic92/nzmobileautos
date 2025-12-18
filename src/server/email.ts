import { Resend } from "resend";

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getEmailFrom() {
  return process.env.EMAIL_FROM || "Mobile Autoworks <bookings@localhost>";
}

export async function sendBookingCreatedPaymentRequiredEmail(input: {
  bookingId: string;
  toEmail: string;
  checkoutUrl: string;
}) {
  const resend = getResendClient();
  const emailFrom = getEmailFrom();

  const subject = "Complete payment to confirm your booking";

  const html = `
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:640px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">Payment required to confirm</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <p>Thanks for your booking request. To confirm your appointment, please complete payment using the button below.</p>
        <p style="margin:18px 0;">
          <a href="${input.checkoutUrl}" style="display:inline-block;background:#f6c90e;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;">Pay now to confirm</a>
        </p>
        <p style="color:rgba(255,255,255,0.65);font-size:12px;">Booking reference: ${input.bookingId}</p>
      </div>
    </div>
  </div>`;

  if (!resend) {
    // DEV fallback: log to server console
    // eslint-disable-next-line no-console
    console.log("[DEV EMAIL]", { to: input.toEmail, subject, bookingId: input.bookingId, checkoutUrl: input.checkoutUrl });
    return;
  }

  await resend.emails.send({
    from: emailFrom,
    to: [input.toEmail],
    subject,
    html,
  });
}

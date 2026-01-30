import { Resend } from "resend";
import nodemailer from "nodemailer";

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getEmailFrom() {
  return process.env.EMAIL_FROM || "Mobile Autoworks <bookings@localhost>";
}

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

function getSmtpConfig(): SmtpConfig | null {
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();
  if (!user || !pass) return null;

  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number((process.env.SMTP_PORT || "465").trim());
  const secure = String(process.env.SMTP_SECURE || "").trim()
    ? String(process.env.SMTP_SECURE).trim().toLowerCase() === "true"
    : port === 465;

  return { host, port, secure, user, pass };
}

async function sendEmail(input: { to: string; subject: string; html: string }) {
  const emailFrom = getEmailFrom();
  const smtp = getSmtpConfig();

  if (smtp) {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    await transporter.sendMail({
      from: emailFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    // eslint-disable-next-line no-console
    console.log("[DEV EMAIL]", { to: input.to, subject: input.subject });
    return;
  }

  await resend.emails.send({
    from: emailFrom,
    to: [input.to],
    subject: input.subject,
    html: input.html,
  });
}

export async function sendBookingConfirmedBusinessEmail(input: {
  toEmail: string;
  bookingPublicId: string;
  scheduledStartIso: string;
  addressOneLine: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  vehiclePlate: string;
  symptoms: string;
  adminUrl: string;
}) {
  const resend = getResendClient();

  const subject = `New confirmed booking: ${input.bookingPublicId}`;

  const html = `
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:720px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">New booking confirmed (paid)</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <div style="margin-bottom:14px;"><strong>Reference:</strong> ${input.bookingPublicId}</div>
        <div style="margin-bottom:14px;"><strong>Preferred time (ISO):</strong> ${input.scheduledStartIso}</div>
        <div style="margin-bottom:14px;"><strong>Address:</strong> ${input.addressOneLine}</div>
        <div style="margin-bottom:14px;"><strong>Vehicle:</strong> ${input.vehiclePlate}</div>
        <div style="margin-bottom:14px;"><strong>Symptoms:</strong><br/>${(input.symptoms || "").replace(/\n/g, "<br/>")}</div>

        <div style="margin-top:18px;padding:14px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.04);">
          <div style="font-weight:700;color:#fff;margin-bottom:8px;">Customer</div>
          <div><strong>Name:</strong> ${input.customerName}</div>
          <div><strong>Phone:</strong> ${input.customerPhone}</div>
          <div><strong>Email:</strong> ${input.customerEmail || "(not provided)"}</div>
        </div>

        <p style="margin:18px 0;">
          <a href="${input.adminUrl}" style="display:inline-block;background:#f6c90e;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;">Open Admin Dashboard</a>
        </p>
      </div>
    </div>
  </div>`;

  if (!resend && !getSmtpConfig()) {
    // eslint-disable-next-line no-console
    console.log("[DEV EMAIL]", { to: input.toEmail, subject, bookingPublicId: input.bookingPublicId });
    return;
  }

  await sendEmail({ to: input.toEmail, subject, html });
}

export async function sendBookingConfirmedCustomerEmail(input: {
  toEmail: string;
  customerName: string;
  bookingPublicId: string;
  slotStartIso: string;
  addressOneLine: string;
  vehiclePlate: string;
  supportPhoneDisplay?: string;
  supportPhoneE164?: string;
  manageUrl?: string;
}) {
  const subject = `Booking confirmed: ${input.bookingPublicId}`;

  const timeNz = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(input.slotStartIso));

  const supportPhoneDisplay = input.supportPhoneDisplay || "027 642 1824";
  const supportPhoneE164 = input.supportPhoneE164 || "+64276421824";

  const html = `
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:640px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">Your booking is confirmed</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <p>Hi <strong>${input.customerName}</strong>, thanks for your payment — your booking is now confirmed.</p>

        <div style="margin:14px 0;padding:14px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.04);">
          <div style="margin-bottom:8px;"><strong>Reference:</strong> ${input.bookingPublicId}</div>
          <div style="margin-bottom:8px;"><strong>Time:</strong> ${timeNz}</div>
          <div style="margin-bottom:8px;"><strong>Address:</strong> ${input.addressOneLine}</div>
          <div><strong>Vehicle:</strong> ${input.vehiclePlate}</div>
        </div>

        <div style="margin-top:14px;color:rgba(255,255,255,0.75);font-size:13px;">
          <div style="font-weight:700;color:#fff;margin-bottom:6px;">What happens next</div>
          <div>1) You’re confirmed — we’ll arrive within your scheduled window.</div>
          <div>2) Please ensure we have access to the vehicle/keys and any lock codes if needed.</div>
          <div>3) If anything changes, call/text <a style="color:#f6c90e;" href="tel:${supportPhoneE164}">${supportPhoneDisplay}</a>.</div>
        </div>

        ${
          input.manageUrl
            ? `<p style="margin:18px 0;">
                <a href="${input.manageUrl}" style="display:inline-block;background:#f6c90e;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;">View booking</a>
              </p>`
            : ""
        }

        <p style="color:rgba(255,255,255,0.55);font-size:12px;">This is an automated confirmation. Keep this email for your records.</p>
      </div>
    </div>
  </div>`;

  await sendEmail({ to: input.toEmail, subject, html });
}

export async function sendBookingFallbackBusinessEmail(input: {
  toEmail: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  scheduledStartLocal: string;
  address: string;
  vehiclePlate: string;
  symptoms: string;
}) {
  const subject = `Booking request (DB offline): ${input.customerName}`;

  const html = `
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:720px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">Booking request received (database offline)</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <div style="margin-bottom:14px;"><strong>Preferred time (local):</strong> ${input.scheduledStartLocal}</div>
        <div style="margin-bottom:14px;"><strong>Address:</strong> ${input.address}</div>
        <div style="margin-bottom:14px;"><strong>Vehicle plate:</strong> ${input.vehiclePlate}</div>
        <div style="margin-bottom:14px;"><strong>Symptoms:</strong><br/>${(input.symptoms || "").replace(/\n/g, "<br/>")}</div>
        <div style="margin-top:18px;padding:14px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.04);">
          <div style="font-weight:700;color:#fff;margin-bottom:8px;">Customer</div>
          <div><strong>Name:</strong> ${input.customerName}</div>
          <div><strong>Phone:</strong> ${input.customerPhone}</div>
          <div><strong>Email:</strong> ${input.customerEmail || "(not provided)"}</div>
        </div>
      </div>
    </div>
  </div>`;

  await sendEmail({ to: input.toEmail, subject, html });
}

export async function sendStripeOrphanPaymentBusinessEmail(input: {
  toEmail: string;
  stripeEventId: string;
  stripeSessionId: string | null;
  bookingId: string | null;
  amountTotal: number | null;
  currency: string | null;
}) {
  const subject = `Stripe payment received but booking missing: ${input.stripeEventId}`;

  const html = `
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:720px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">Orphan Stripe payment alert</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <div style="margin-bottom:10px;"><strong>Event:</strong> ${input.stripeEventId}</div>
        <div style="margin-bottom:10px;"><strong>Session:</strong> ${input.stripeSessionId || "(unknown)"}</div>
        <div style="margin-bottom:10px;"><strong>bookingId metadata:</strong> ${input.bookingId || "(missing)"}</div>
        <div style="margin-bottom:10px;"><strong>Amount:</strong> ${input.amountTotal != null ? String(input.amountTotal) : "(unknown)"} ${input.currency || ""}</div>
        <div style="margin-top:14px;color:rgba(255,255,255,0.7);">
          Action: check Stripe dashboard for the session/payment intent, then verify booking persistence and reconcile manually.
        </div>
      </div>
    </div>
  </div>`;

  await sendEmail({ to: input.toEmail, subject, html });
}

export async function sendQuoteCreatedBusinessEmail(input: {
  toEmail: string;
  quotePublicId: string;
  category: string;
  urgency: string;
  addressOneLine: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  vehiclePlate: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  description: string;
  symptoms: string[];
  adminUrl: string;
}) {
  const resend = getResendClient();

  const subject = `New quote request: ${input.quotePublicId}`;

  const html = `
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:720px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">New quote request</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <div style="margin-bottom:14px;"><strong>Reference:</strong> ${input.quotePublicId}</div>
        <div style="margin-bottom:14px;"><strong>Category:</strong> ${input.category}</div>
        <div style="margin-bottom:14px;"><strong>Urgency:</strong> ${input.urgency}</div>
        <div style="margin-bottom:14px;"><strong>Address:</strong> ${input.addressOneLine}</div>
        <div style="margin-bottom:14px;"><strong>Vehicle:</strong> ${[
          input.vehiclePlate,
          input.vehicleYear ? String(input.vehicleYear) : null,
          input.vehicleMake,
          input.vehicleModel,
        ]
          .filter(Boolean)
          .join(" ")}</div>
        <div style="margin-bottom:14px;"><strong>Symptoms:</strong> ${(input.symptoms || []).length ? (input.symptoms || []).join(", ") : "(none)"}</div>
        <div style="margin-bottom:14px;"><strong>Description:</strong><br/>${(input.description || "").replace(/\n/g, "<br/>")}</div>

        <div style="margin-top:18px;padding:14px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.04);">
          <div style="font-weight:700;color:#fff;margin-bottom:8px;">Customer</div>
          <div><strong>Name:</strong> ${input.customerName}</div>
          <div><strong>Phone:</strong> ${input.customerPhone}</div>
          <div><strong>Email:</strong> ${input.customerEmail || "(not provided)"}</div>
        </div>

        <p style="margin:18px 0;">
          <a href="${input.adminUrl}" style="display:inline-block;background:#f6c90e;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;">Open Admin Dashboard</a>
        </p>
      </div>
    </div>
  </div>`;

  if (!resend && !getSmtpConfig()) {
    // eslint-disable-next-line no-console
    console.log("[DEV EMAIL]", { to: input.toEmail, subject, quotePublicId: input.quotePublicId });
    return;
  }

  await sendEmail({ to: input.toEmail, subject, html });
}

export async function sendServiceReportReadyEmail(input: {
  toEmail: string;
  reportTitle: string;
  reportUrl: string;
  bookingRef: string;
}) {
  const resend = getResendClient();

  const subject = `${input.reportTitle} is ready`;

  const html = `
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:640px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">Your report is ready</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <p>Your <strong>${input.reportTitle}</strong> is ready to view.</p>
        <p style="margin:18px 0;">
          <a href="${input.reportUrl}" style="display:inline-block;background:#f6c90e;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;">View report</a>
        </p>
        <p style="color:rgba(255,255,255,0.65);font-size:12px;">Booking reference: ${input.bookingRef}</p>
      </div>
    </div>
  </div>`;

  if (!resend && !getSmtpConfig()) {
    // eslint-disable-next-line no-console
    console.log("[DEV EMAIL]", { to: input.toEmail, subject, bookingRef: input.bookingRef, reportUrl: input.reportUrl });
    return;
  }

  await sendEmail({ to: input.toEmail, subject, html });
}

export async function sendBookingCreatedPaymentRequiredEmail(input: {
  bookingId: string;
  toEmail: string;
  checkoutUrl: string;
}) {
  const resend = getResendClient();

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

  if (!resend && !getSmtpConfig()) {
    // DEV fallback: log to server console
    // eslint-disable-next-line no-console
    console.log("[DEV EMAIL]", { to: input.toEmail, subject, bookingId: input.bookingId, checkoutUrl: input.checkoutUrl });
    return;
  }

  await sendEmail({ to: input.toEmail, subject, html });
}

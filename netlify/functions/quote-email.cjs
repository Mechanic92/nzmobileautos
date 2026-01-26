const nodemailer = require("nodemailer");
const { z } = require("zod");

const QuoteEmailSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  vehicleRego: z.string().optional().default(""),
  vehicleMake: z.string().optional().default(""),
  vehicleModel: z.string().optional().default(""),
  vehicleYear: z.string().optional().default(""),
  serviceType: z.string().min(1),
  suburb: z.string().optional().default(""),
  message: z.string().optional().default(""),
});

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function buildEmailHtml(input) {
  const safe = (v) => String(v || "");
  const vehicle = [safe(input.vehicleYear), safe(input.vehicleMake), safe(input.vehicleModel)].filter(Boolean).join(" ");
  return `
    <h2>New Quote Request</h2>
    <p><strong>Customer:</strong> ${safe(input.customerName)}</p>
    <p><strong>Email:</strong> ${safe(input.email)}</p>
    <p><strong>Phone:</strong> ${safe(input.phone)}</p>
    <p><strong>Suburb:</strong> ${safe(input.suburb)}</p>
    <hr />
    <p><strong>Vehicle:</strong> ${vehicle || "(not provided)"}</p>
    <p><strong>Registration:</strong> ${safe(input.vehicleRego) || "(not provided)"}</p>
    <hr />
    <p><strong>Details:</strong></p>
    <p>${safe(input.message || "No specific details provided").replace(/\n/g, "<br/>")}</p>
  `.trim();
}

async function sendWithSmtp({ to, from, replyTo, subject, html }) {
  const user = requireEnv("SMTP_USER").trim();
  const pass = requireEnv("SMTP_PASS").trim();
  const host = String(process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(String(process.env.SMTP_PORT || "465").trim());
  const secure = String(process.env.SMTP_SECURE || "").trim()
    ? String(process.env.SMTP_SECURE).trim().toLowerCase() === "true"
    : port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    replyTo,
    subject,
    html,
  });
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method Not Allowed",
    };
  }

  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  let input;
  try {
    input = QuoteEmailSchema.parse(payload);
  } catch (err) {
    return json(400, { error: "Invalid quote request", details: err?.message });
  }

  const businessEmail = "chris@mobileautoworksnz.com";

  const fromEmail = (
    process.env.EMAIL_FROM ||
    process.env.QUOTE_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    "notifications@mobileautoworksnz.co.nz"
  ).trim();

  const subject = `New Quote Request: ${input.customerName}${input.suburb ? ` (${input.suburb})` : ""}`;
  const html = buildEmailHtml(input);

  try {
    await sendWithSmtp({
      to: businessEmail,
      from: fromEmail,
      replyTo: input.email,
      subject,
      html,
    });

    return json(200, { ok: true, provider: "smtp" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Netlify Quote Function Error]", err);
    return json(500, {
      error: "Failed to send email. Please check server logs.",
      details: String(err?.message || err),
    });
  }
};

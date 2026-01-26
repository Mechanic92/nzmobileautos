import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import nodemailer from "nodemailer";

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

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

function getSmtpConfig(): SmtpConfig {
  const user = requireEnv("SMTP_USER").trim();
  const pass = requireEnv("SMTP_PASS").trim();

  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number((process.env.SMTP_PORT || "465").trim());
  const secure = String(process.env.SMTP_SECURE || "").trim()
    ? String(process.env.SMTP_SECURE).trim().toLowerCase() === "true"
    : port === 465;

  return { host, port, secure, user, pass };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const input = QuoteEmailSchema.parse(req.body);

    const businessEmail = (
      process.env.BUSINESS_EMAIL ||
      process.env.QUOTE_NOTIFY_EMAIL ||
      "chris@mobileautoworksnz.com"
    ).trim();

    const fromEmail = (
      process.env.EMAIL_FROM ||
      process.env.QUOTE_FROM_EMAIL ||
      "notifications@mobileautoworksnz.co.nz"
    ).trim();

    const subject = `New Quote Request: ${input.customerName} (${input.suburb})`;

    const html = `
      <h2>New Quote Request</h2>
      <p><strong>Customer:</strong> ${input.customerName}</p>
      <p><strong>Email:</strong> ${input.email}</p>
      <p><strong>Phone:</strong> ${input.phone}</p>
      <p><strong>Suburb:</strong> ${input.suburb}</p>
      <hr />
      <p><strong>Vehicle:</strong> ${[input.vehicleYear, input.vehicleMake, input.vehicleModel].filter(Boolean).join(" ")}</p>
      <p><strong>Registration:</strong> ${input.vehicleRego}</p>
      <hr />
      <p><strong>Details:</strong></p>
      <p>${(input.message || "No specific details provided").replace(/\n/g, "<br/>")}</p>
    `;

    // Priority 1: Use Resend if API key is present (highly reliable)
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: fromEmail,
        to: businessEmail,
        replyTo: input.email,
        subject,
        html,
      });

      return res.status(200).json({ ok: true, provider: "resend" });
    }

    // Priority 2: Fallback to Nodemailer
    const smtp = getSmtpConfig();
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
      from: fromEmail,
      to: businessEmail,
      replyTo: input.email,
      subject,
      html,
    });

    return res.status(200).json({ ok: true, provider: "nodemailer" });
  } catch (err: any) {
    console.error("[Quote API Error]", err);
    return res.status(500).json({
      error: "Failed to send email. Please check server logs.",
      details: err?.message
    });
  }
}

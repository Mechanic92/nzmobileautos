import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCookieName, signAdminSession } from "@/server/adminSession";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  const secret = process.env.ADMIN_AUTH_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!secret || !adminEmail || !adminPassword) {
    return new NextResponse("Admin auth not configured", { status: 500 });
  }

  const json = await req.json();
  const body = BodySchema.parse(json);

  const ok = timingSafeEq(body.email.trim().toLowerCase(), adminEmail.trim().toLowerCase()) && timingSafeEq(body.password, adminPassword);
  if (!ok) return new NextResponse("Invalid credentials", { status: 401 });

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "admin" as const,
    iat: now,
    exp: now + 60 * 60 * 24 * 14,
  };

  const token = await signAdminSession(payload, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: adminCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}

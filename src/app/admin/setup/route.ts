import { NextResponse } from "next/server";
import { adminCookieName, signAdminSession } from "@/server/adminSession";

function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") || "";

  const secret = process.env.ADMIN_AUTH_SECRET;
  const provisionToken = process.env.ADMIN_PROVISION_TOKEN;

  if (!secret || !provisionToken) {
    return new NextResponse("Admin auth not configured", { status: 500 });
  }

  if (!timingSafeEq(token, provisionToken)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const now = Math.floor(Date.now() / 1000);
  const maxAgeSeconds = 60 * 60 * 24 * 90;

  const payload = {
    sub: "admin" as const,
    iat: now,
    exp: now + maxAgeSeconds,
  };

  const signed = await signAdminSession(payload, secret);

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set({
    name: adminCookieName(),
    value: signed,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return res;
}

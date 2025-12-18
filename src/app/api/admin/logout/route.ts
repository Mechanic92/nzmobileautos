import { NextResponse } from "next/server";
import { adminCookieName } from "@/server/adminSession";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: adminCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

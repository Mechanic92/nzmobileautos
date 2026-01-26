import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCookieName, signAdminSession } from "@/server/adminSession";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const DISABLED_MESSAGE = "Not found";

function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  return new NextResponse(DISABLED_MESSAGE, { status: 404 });
}

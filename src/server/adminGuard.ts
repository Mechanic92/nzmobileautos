import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSession } from "@/server/adminSession";

export async function requireAdminOrThrow() {
  const secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret) throw new Error("Admin auth not configured");

  const token = (await cookies()).get(adminCookieName())?.value;
  const session = token ? await verifyAdminSession(token, secret) : null;
  if (!session) throw new Error("Unauthorized");
  return session;
}

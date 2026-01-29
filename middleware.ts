import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminCookieName, verifyAdminSession } from "./src/server/adminSession";

const PROTECTED_API_PATHS = new Set(["/api/bookings/status", "/api/quotes/status"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isProtectedApi = PROTECTED_API_PATHS.has(pathname);

  // Admin login UI is intentionally disabled. Use /admin/setup?t=... to provision devices.
  if (pathname === "/admin/login") return NextResponse.redirect(new URL("/", req.url));

  if (!isAdminPage && !isProtectedApi) return NextResponse.next();

  const secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret) {
    // Fail-closed: if you haven't configured ADMIN_AUTH_SECRET, do not allow admin.
    return isProtectedApi
      ? NextResponse.json({ error: "Admin auth not configured" }, { status: 500 })
      : NextResponse.redirect(new URL("/", req.url));
  }

  const cookie = req.cookies.get(adminCookieName())?.value;
  const session = cookie ? await verifyAdminSession(cookie, secret) : null;

  if (session) return NextResponse.next();

  if (isProtectedApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fail-closed for admin pages: do not reveal admin flow, do not redirect to login.
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/bookings/status", "/api/quotes/status"],
};

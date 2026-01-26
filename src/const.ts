export const getLoginUrl = () => {
  return "/login";
};

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "";

const DEFAULT_PORTAL_ORIGIN = "https://nzmobileauto.vercel.app";

function normalizeOrigin(input: string) {
  return (input || "").trim().replace(/\/$/, "");
}

function resolvePortalOrigin() {
  const configured = normalizeOrigin((import.meta as any).env?.VITE_APP_PORTAL_ORIGIN || "");

  // If the portal origin is misconfigured to the marketing domain (or to this same origin), fail-safe to Vercel.
  // This prevents customers being sent to the legacy /book page.
  const current = typeof window !== "undefined" ? normalizeOrigin(window.location.origin) : "";
  const marketingDomains = new Set(["https://mobileautoworksnz.com", "https://www.mobileautoworksnz.com"]);

  if (!configured) return DEFAULT_PORTAL_ORIGIN;
  if (marketingDomains.has(configured)) return DEFAULT_PORTAL_ORIGIN;
  if (current && configured === current) return DEFAULT_PORTAL_ORIGIN;

  return configured;
}

export const APP_PORTAL_ORIGIN = resolvePortalOrigin();

export const appPortalUrl = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${APP_PORTAL_ORIGIN}${p}`;
};

export const COMPANY_INFO = {
  name: "Mobile Autoworks NZ",
  phone: "027 642 1824",
  email: "chris@mobileautoworksnz.com",
  address: "West Auckland, New Zealand",
};

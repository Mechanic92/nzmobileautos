const COOKIE_NAME = "admin_session";

function base64UrlEncode(bytes: Uint8Array) {
  const b64 = Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return new Uint8Array(Buffer.from(b64, "base64"));
}

async function hmacSha256(key: string, data: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return new Uint8Array(sig);
}

export type AdminSessionPayload = {
  sub: "admin";
  iat: number;
  exp: number;
};

export function adminCookieName() {
  return COOKIE_NAME;
}

export async function signAdminSession(payload: AdminSessionPayload, secret: string) {
  const json = JSON.stringify(payload);
  const body = base64UrlEncode(new TextEncoder().encode(json));
  const sigBytes = await hmacSha256(secret, body);
  const sig = base64UrlEncode(sigBytes);
  return `${body}.${sig}`;
}

export async function verifyAdminSession(token: string, secret: string): Promise<AdminSessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expected = await hmacSha256(secret, body);
  const provided = base64UrlDecode(sig);

  if (provided.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) diff |= provided[i] ^ expected[i];
  if (diff !== 0) return null;

  try {
    const decoded = new TextDecoder().decode(base64UrlDecode(body));
    const payload = JSON.parse(decoded) as AdminSessionPayload;
    if (payload.sub !== "admin") return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireAdminFromCookieValue(cookieValue: string | undefined, secret: string) {
  if (!cookieValue) return null;
  return verifyAdminSession(cookieValue, secret);
}

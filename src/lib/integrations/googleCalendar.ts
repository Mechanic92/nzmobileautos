import crypto from "crypto";

type ServiceAccountJson = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function base64Url(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwtRs256(payload: Record<string, any>, privateKeyPem: string) {
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = signer.sign(privateKeyPem);

  return `${data}.${base64Url(signature)}`;
}

async function getAccessToken(serviceAccount: ServiceAccountJson) {
  const tokenUri = (serviceAccount.token_uri || "https://oauth2.googleapis.com/token").trim();
  const now = Math.floor(Date.now() / 1000);

  const jwt = signJwtRs256(
    {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/calendar.events",
      aud: tokenUri,
      iat: now,
      exp: now + 60 * 50,
    },
    serviceAccount.private_key
  );

  const form = new URLSearchParams();
  form.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
  form.set("assertion", jwt);

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const json = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(`Google OAuth token error: ${res.status} ${JSON.stringify(json)}`);
  }

  if (!json.access_token) throw new Error("Google OAuth token missing access_token");
  return String(json.access_token);
}

export async function createGoogleCalendarEvent(input: {
  calendarId: string;
  summary: string;
  description?: string;
  location?: string;
  startUtc: Date;
  endUtc: Date;
  timeZone?: string;
}) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return { ok: false as const, error: "Missing GOOGLE_SERVICE_ACCOUNT_JSON" };
  }

  let svc: ServiceAccountJson;
  try {
    svc = JSON.parse(raw);
  } catch {
    return { ok: false as const, error: "Invalid GOOGLE_SERVICE_ACCOUNT_JSON (not valid JSON)" };
  }

  if (!svc?.client_email || !svc?.private_key) {
    return { ok: false as const, error: "GOOGLE_SERVICE_ACCOUNT_JSON missing client_email/private_key" };
  }

  const token = await getAccessToken(svc);

  const tz = input.timeZone || "Pacific/Auckland";
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(input.calendarId)}/events`;

  const payload = {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: {
      dateTime: input.startUtc.toISOString(),
      timeZone: tz,
    },
    end: {
      dateTime: input.endUtc.toISOString(),
      timeZone: tz,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(`Google Calendar API error: ${res.status} ${JSON.stringify(json)}`);
  }

  return { ok: true as const, eventId: String(json.id || ""), htmlLink: String(json.htmlLink || "") };
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CreditCard, Zap, Lock, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SummaryRow } from "@/components/ui/summary-row";

type ServiceIntent = "DIAGNOSTICS" | "PPI" | "SERVICE";

type IdentityResponse = {
  vehicleIdentity: {
    make: string;
    model: string;
    year: number;
    fuel: string;
    power_kw: number;
    body_style: string;
    gvm: number;
    vin: string;
    plate: string;
  };
  cacheHit: boolean;
};

type QuoteResponse = {
  quoteId: string;
  pricingSnapshot: {
    currency: "NZD";
    intent: ServiceIntent;
    addOns: {
      prioritySameDay?: boolean;
      outsideCoreArea?: boolean;
      afterHours?: boolean;
    };
    totalIncGstCents: number | null;
    isEstimateOnly: boolean;
    lines: Array<{ key: string; label: string; amountCents: number }>;
    disclaimers: string[];
    oilIncludedLitres?: number;
    extraOilPerLitreCents?: number;
  };
  totalIncGst: number | null;
  disclaimers: string[];
};

function formatNzd(cents: number) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(cents / 100);
}

async function readJsonSafely(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

function extractError(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const maybe = body as { error?: unknown; message?: unknown };
  if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error;
  if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message;
  return null;
}

function extractRaw(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const maybe = body as { raw?: unknown };
  if (typeof maybe.raw === "string" && maybe.raw.trim()) return maybe.raw;
  return null;
}

export default function InstantQuoteClient() {
  const router = useRouter();

  const [plateOrVin, setPlateOrVin] = useState("");
  const [intent, setIntent] = useState<ServiceIntent>("DIAGNOSTICS");
  const [tier, setTier] = useState<string>("BASIC");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [identity, setIdentity] = useState<IdentityResponse | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const intentOptions = useMemo(
    () => [
      { value: "DIAGNOSTICS", label: "Diagnostics ($140 fixed)" },
      { value: "PPI", label: "Pre-Purchase Inspection ($180 fixed)" },
      { value: "SERVICE", label: "Service / Repair (banded estimate)" },
    ],
    []
  );

  const trustItems = [
    { icon: Lock, label: "Secure payment (Stripe)" },
    { icon: ShieldCheck, label: "Instant confirmation" },
    { icon: CreditCard, label: "Afterpay available" },
  ];

  const handleLookup = async () => {
    setBusy(true);
    setError(null);
    setIdentity(null);
    setQuote(null);

    try {
      const cleaned = plateOrVin.trim();
      if (!cleaned) throw new Error("Enter a plate or VIN");

      const identityRes = await fetch("/api/identity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plateOrVin: cleaned }),
      });

      const identityBody = await readJsonSafely(identityRes);
      if (!identityRes.ok) {
        const msg =
          extractError(identityBody) ||
          (identityRes.status ? `Identity lookup failed (${identityRes.status})` : "Identity lookup failed");
        const raw = extractRaw(identityBody);
        throw new Error(raw ? `${msg}: ${raw}` : msg);
      }

      const i = identityBody as IdentityResponse;
      setIdentity(i);

      const quoteRes = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vehicleIdentity: i.vehicleIdentity,
          intent,
          tier: intent === "SERVICE" ? tier : undefined
        }),
      });

      const quoteBody = await readJsonSafely(quoteRes);
      if (!quoteRes.ok) {
        const msg =
          extractError(quoteBody) ||
          (quoteRes.status ? `Quote generation failed (${quoteRes.status})` : "Quote generation failed");
        const raw = extractRaw(quoteBody);
        throw new Error(raw ? `${msg}: ${raw}` : msg);
      }

      setQuote(quoteBody as QuoteResponse);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const canContinue = Boolean(quote?.quoteId) && !quote?.pricingSnapshot?.isEstimateOnly;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Instant quote</CardTitle>
          <CardDescription>
            Plate/VIN → identity → service classification → bounded price. We do not overpromise—assumptions are shown below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="danger">
              <AlertTitle>Couldn’t generate quote</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted">Plate or VIN</div>
              <Input value={plateOrVin} onChange={(e) => setPlateOrVin(e.target.value.toUpperCase())} placeholder="ABC123 or VIN" />
            </div>
            <div className={`space-y-2 transition-all duration-300 ${intent === "SERVICE" ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted">Service Tier</div>
              <Select 
                value={tier} 
                onChange={(e) => setTier(e.target.value)} 
                options={[
                  { value: "OIL_FILTER", label: "Oil & Filter Change" },
                  { value: "BASIC", label: "Basic Service" },
                  { value: "COMPREHENSIVE", label: "Comprehensive Service" },
                ]} 
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted">Service intent</div>
              <Select value={intent} onChange={(e) => setIntent(e.target.value as ServiceIntent)} options={intentOptions} />
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleLookup}
            disabled={busy}
            className="w-full"
          >
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing…
              </>
            ) : (
              "Get quote"
            )}
          </Button>

          <div className="grid gap-3 md:grid-cols-3">
            {trustItems.map((t) => (
              <div key={t.label} className="rounded-xl border border-border bg-surface2 px-4 py-3 flex items-center gap-3">
                <t.icon className="h-5 w-5 text-primary" />
                <div className="text-sm text-muted">{t.label}</div>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted">
            No WOF inspections. This tool provides pricing bounds based on MotorWeb identity and your chosen service intent.
          </div>
        </CardContent>
      </Card>

      {identity && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Vehicle identity</CardTitle>
                <CardDescription>MotorWeb identity lookup (server-only mTLS). Cache: {identity.cacheHit ? "HIT" : "MISS"}.</CardDescription>
              </div>
              <Badge variant={identity.cacheHit ? "muted" : "default"}>{identity.cacheHit ? "CACHE" : "MOTORWEB"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xl font-semibold">
              {identity.vehicleIdentity.year} {identity.vehicleIdentity.make} {identity.vehicleIdentity.model}
            </div>
            <div className="text-sm text-muted">{identity.vehicleIdentity.plate || plateOrVin.toUpperCase()} • {identity.vehicleIdentity.vin || "VIN unavailable"}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="muted">{identity.vehicleIdentity.fuel || "Fuel unknown"}</Badge>
              <Badge variant="muted">{identity.vehicleIdentity.body_style || "Body unknown"}</Badge>
              <Badge variant="muted">{identity.vehicleIdentity.power_kw ? `${identity.vehicleIdentity.power_kw}kW` : "Power unknown"}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {quote && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Quote summary</CardTitle>
                <CardDescription>Bounded pricing snapshot saved for booking step 2.</CardDescription>
              </div>
              {quote.pricingSnapshot.isEstimateOnly ? (
                <Badge variant="danger">ESTIMATE ONLY</Badge>
              ) : (
                <Badge variant="success">FIXED / BANDED</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {quote.pricingSnapshot.isEstimateOnly ? (
              <Alert>
                <AlertTitle>Estimate request</AlertTitle>
                <AlertDescription>
                  General repair pricing requires diagnosis. Use Diagnostics for a fixed booking, or submit a quote request.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-xl border border-border bg-surface2 p-4 space-y-2">
                {quote.pricingSnapshot.lines.map((l) => (
                  <SummaryRow key={l.key} label={l.label} value={formatNzd(l.amountCents)} />
                ))}
                <div className="h-px bg-border" />
                <SummaryRow
                  label={<span className="text-text">Total (inc GST)</span>}
                  value={<span className="text-primary">{formatNzd(quote.pricingSnapshot.totalIncGstCents || 0)}</span>}
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted">Assumptions & disclaimers</div>
              <div className="space-y-2">
                {quote.disclaimers.map((d, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-muted">
                    <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                    <div>{d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIdentity(null);
                  setQuote(null);
                  setPlateOrVin("");
                  setError(null);
                }}
              >
                Start over
              </Button>

              {canContinue ? (
                <Button
                  variant="primary"
                  onClick={() => router.push(`/book?quoteId=${encodeURIComponent(quote.quoteId)}`)}
                >
                  Continue to booking
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => router.push("/book/quote")}>Request a quote</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

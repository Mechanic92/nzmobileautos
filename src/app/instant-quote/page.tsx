import type { Metadata } from "next";

import InstantQuoteClient from "./InstantQuoteClient";

export const metadata: Metadata = {
  title: "Instant Quote",
  description:
    "Instant quote for mobile diagnostics, pre-purchase inspections, and oil services across Auckland. Plate/VIN identity via MotorWeb (server-only).",
  alternates: {
    canonical: "/instant-quote",
  },
};

export default function InstantQuotePage() {
  return (
    <div className="min-h-screen">
      <div className="container pt-10 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Instant quote. <span className="text-primary">Pay to secure booking.</span>
            </h1>
            <p className="text-muted">
              Enter a plate or VIN, choose your service intent, and we’ll generate a bounded price with explicit assumptions.
              MotorWeb identity lookup is server-only (mTLS).
            </p>
          </div>

          <InstantQuoteClient />

          <div className="text-sm text-muted">
            <div className="font-semibold text-text">Internal links</div>
            <div className="mt-2 flex flex-wrap gap-3">
              <a className="text-primary" href="/book">Book directly</a>
              <a className="text-primary" href="/">Home</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

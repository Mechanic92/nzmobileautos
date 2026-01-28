export default function HomePage() {
  return (
    <div className="container py-12">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            Auckland mobile mechanic • Fast turnaround
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight leading-tight">
            Mobile diagnostics that are fast, clear, and properly documented.
          </h1>
          <p className="mt-4 text-white/70 max-w-xl">
            Book online in minutes. Diagnostics are pay-to-confirm so your time slot is secured. For brakes, WOF repairs,
            and other work, request a quote and we’ll confirm pricing after assessment.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              className="px-5 py-3 rounded-lg bg-brand-yellow text-black font-semibold no-underline hover:bg-brand-yellow/90"
              href="/instant-quote"
            >
              Get Instant Price
            </a>
            <a className="px-5 py-3 rounded-lg border border-white/15 text-white no-underline hover:bg-white/5" href="/book/quote">
              Request a Quote
            </a>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-white/70">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-white font-semibold">Pay to confirm</div>
              <div className="mt-1">Diagnostics secured on payment.</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-white font-semibold">Mobile service</div>
              <div className="mt-1">We come to you across Auckland.</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-white font-semibold">Professional reports</div>
              <div className="mt-1">Secure link + downloadable PDF.</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/70">What you can book</div>
          <div className="mt-4 grid gap-4">
            <div className="rounded-xl border border-white/10 bg-black/40 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Diagnostic Scan & Fault Report</div>
                  <div className="mt-1 text-sm text-white/70">Pay to confirm. Ideal for warning lights, rough idle, misfires, etc.</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">Pay to confirm</div>
                  <div className="text-xs text-white/60">flat rate</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Brakes, WOF repairs, servicing (Quote)</div>
                  <div className="mt-1 text-sm text-white/70">
                    Describe the issue and upload photos. We’ll confirm scope and quote before any major work.
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">Quote</div>
                  <div className="text-xs text-white/60">assessment required</div>
                </div>
              </div>
              <div className="mt-4">
                <a
                  className="inline-flex px-4 py-2 rounded-lg border border-white/15 text-white no-underline hover:bg-white/5"
                  href="/book/quote"
                >
                  Request a Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

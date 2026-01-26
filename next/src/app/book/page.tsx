export default function BookPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Book</h1>
        <p className="mt-2 text-white/70">
          Choose the fastest path. Diagnostics booking is handled via our booking partner. Repairs are quote-first.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <a
          href="/book/diagnostics"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 no-underline hover:bg-white/10 transition-colors"
        >
          <div className="text-sm text-white/60">Recommended</div>
          <div className="mt-2 text-xl font-semibold text-white">Book diagnostics</div>
          <div className="mt-2 text-sm text-white/70">
            Warning lights, no-start, misfires, rough idle, overheating. Includes a clear report.
          </div>
          <div className="mt-4 inline-flex px-4 py-2 rounded-lg bg-brand-yellow text-black font-semibold">
            Continue
          </div>
          <div className="mt-3 text-xs text-white/60">Redirects to online booking</div>
        </a>

        <a
          href="/book/quote"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 no-underline hover:bg-white/10 transition-colors"
        >
          <div className="text-sm text-white/60">Quote-first</div>
          <div className="mt-2 text-xl font-semibold text-white">Request a quote</div>
          <div className="mt-2 text-sm text-white/70">
            Brakes, WOF repairs, servicing, and other work. We’ll confirm scope and pricing after assessment.
          </div>
          <div className="mt-4 inline-flex px-4 py-2 rounded-lg border border-white/15 text-white font-semibold">
            Continue
          </div>
          <div className="mt-3 text-xs text-white/60">No obligation • photos supported next</div>
        </a>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-black/40 p-6">
        <div className="text-sm text-white/70">Prefer to talk?</div>
        <div className="mt-2 text-white font-semibold">Call or text and we’ll guide you</div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <a
            className="px-5 py-3 rounded-lg bg-brand-yellow text-black font-semibold no-underline"
            href="tel:+64276421824"
          >
            Call now
          </a>
          <a className="px-5 py-3 rounded-lg border border-white/15 text-white no-underline" href="/">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

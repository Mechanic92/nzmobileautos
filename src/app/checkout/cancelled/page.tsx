export default function CheckoutCancelledPage() {
  return (
    <div className="container py-12">
      <div className="max-w-xl">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 mb-6">
          <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold">Payment not completed</h1>
        <p className="mt-2 text-white/70">
          Your booking is not confirmed yet. Payment is required to secure your time slot.
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="font-semibold">What you can do</div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>• Try booking again with the same details</li>
            <li>• Use a different payment method</li>
            <li>• Contact us if you're having issues</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a className="px-5 py-3 rounded-lg bg-brand-yellow text-black font-semibold text-center" href="/book/diagnostics">
            Try again
          </a>
          <a className="px-5 py-3 rounded-lg border border-white/15 text-white text-center" href="tel:+64276421824">
            Call us
          </a>
          <a className="px-5 py-3 rounded-lg border border-white/15 text-white text-center" href="/">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

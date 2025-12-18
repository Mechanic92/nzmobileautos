export default function CheckoutCancelledPage() {
  return (
    <div className="container py-12">
      <h1 className="text-2xl font-semibold">Payment not completed</h1>
      <p className="mt-2 text-white/70">Your booking is not confirmed yet. You can try again.</p>
      <div className="mt-8 flex gap-3">
        <a className="px-4 py-2 rounded bg-brand-yellow text-black font-medium" href="/book">
          Return to booking
        </a>
        <a className="px-4 py-2 rounded border border-white/15 text-white" href="/">
          Home
        </a>
      </div>
    </div>
  );
}

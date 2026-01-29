import { db } from "@/server/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ bookingId?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const bookingId = resolved?.bookingId;
  const booking = bookingId ? await db().getBookingById(bookingId) : null;

  const isConfirmed = booking?.status === "CONFIRMED";

  return (
    <div className="container py-12">
      <div className="max-w-xl">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-6">
          <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold">{isConfirmed ? "Booking confirmed" : "Payment received"}</h1>
        <p className="mt-2 text-white/70">
          {isConfirmed
            ? "Your diagnostics appointment is now confirmed."
            : "We’re finalising your booking now. This usually takes a few seconds — please wait or refresh."}
        </p>

        {booking && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Reference</div>
            <div className="mt-1 font-mono text-white">{booking.id.slice(0, 8).toUpperCase()}</div>
            <div className="mt-4 text-sm text-white/60">Status</div>
            <div className="mt-1 text-white font-medium">
              {booking.status === "CONFIRMED" ? "Confirmed" : booking.status}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="font-semibold">What happens next</div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>• We'll contact you to confirm the appointment time</li>
            <li>• Our mechanic will arrive at your location with diagnostic equipment</li>
            <li>• You'll receive a detailed fault report after the scan</li>
          </ul>
        </div>

        <div className="mt-8 flex gap-3">
          <a className="px-5 py-3 rounded-lg bg-brand-yellow text-black font-semibold" href="/">
            Back to home
          </a>
          <a className="px-5 py-3 rounded-lg border border-white/15 text-white" href="/book">
            Book another service
          </a>
        </div>
      </div>
    </div>
  );
}

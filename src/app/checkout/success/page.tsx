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

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-semibold">Booking created</h1>
      <p className="mt-2 text-white/70">We’ve saved your booking request.</p>
      {booking && (
        <div className="mt-6 p-4 rounded border border-white/10 text-sm text-white/70">
          <div>
            <span className="text-white/50">Booking ID:</span> {booking.id}
          </div>
          <div>
            <span className="text-white/50">Status:</span> {booking.status}
          </div>
        </div>
      )}
      <div className="mt-8">
        <a className="px-4 py-2 rounded bg-brand-yellow text-black font-medium" href="/">
          Back to home
        </a>
      </div>
    </div>
  );
}

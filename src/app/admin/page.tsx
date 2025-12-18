import { db, isDevNoDb } from "@/server/db";
import { BookingsTable } from "./BookingsTable";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { QuoteRequestsTable } from "./QuoteRequestsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  await db().expirePendingBookings(new Date());
  const bookings = await db().listBookings(50);
  const quotes = await db().listQuoteRequests(50);

  const bookingRows = bookings.map((b) => ({
    id: b.id,
    publicId: b.publicId,
    kind: b.kind,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    slotStart: b.slotStart.toISOString(),
  }));

  const quoteRows = quotes.map((q) => ({
    id: q.id,
    publicId: q.publicId,
    status: q.status,
    category: q.category,
    urgency: q.urgency,
    createdAt: q.createdAt.toISOString(),
  }));

  return (
    <div className="container py-12">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <AdminLogoutButton />
      </div>
      <p className="mt-2 text-white/70">
        Minimal admin view (authentication to be added next).
        {isDevNoDb() ? " (DEV_NO_DB mode: in-memory data)" : ""}
      </p>

      <h2 className="mt-10 text-xl font-semibold">Bookings</h2>
      <p className="mt-2 text-white/70">Diagnostics bookings (pay-to-confirm). Pending bookings auto-expire.</p>

      <BookingsTable initialBookings={bookingRows} />

      <h2 className="mt-12 text-xl font-semibold">Quote requests</h2>
      <p className="mt-2 text-white/70">Incoming quote leads (repairs are quote-first).</p>

      <QuoteRequestsTable initialQuotes={quoteRows} />
    </div>
  );
}

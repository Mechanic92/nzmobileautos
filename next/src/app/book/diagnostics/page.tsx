import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default function BookDiagnosticsPage() {
  const mechanicDeskUrl =
    (process.env.VITE_MECHANICDESK_BOOKING_URL ||
      process.env.NEXT_PUBLIC_MECHANICDESK_BOOKING_URL ||
      process.env.NEXT_PUBLIC_MECHANICDESK_BOOKING_URL ||
      process.env.MECHANICDESK_BOOKING_URL ||
      "")
      .trim();

  const bookingMode =
    (
      process.env.VITE_MECHANICDESK_BOOKING_MODE ||
      process.env.NEXT_PUBLIC_MECHANICDESK_BOOKING_MODE ||
      process.env.MECHANICDESK_BOOKING_MODE ||
      "redirect"
    )
      .trim()
      .toLowerCase();

  if (mechanicDeskUrl) {
    if (bookingMode === "iframe") {
      return (
        <div className="min-h-[calc(100vh-64px)]">
          <div className="container py-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight">Book diagnostics</h1>
              <p className="mt-2 text-white/70">Complete your booking using our booking partner.</p>
            </div>
          </div>

          <div className="w-full">
            <iframe
              src={mechanicDeskUrl}
              className="w-full h-[80vh] md:h-[85vh]"
              frameBorder={0}
            />
          </div>
        </div>
      );
    }

    redirect(mechanicDeskUrl);
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Book diagnostics</h1>
        <p className="mt-3 text-white/70">
          Online booking is being upgraded. Please call or text to book.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            className="px-5 py-3 rounded-lg bg-brand-yellow text-black font-semibold no-underline"
            href="tel:+64276421824"
          >
            Call 027 642 1824
          </a>
          <a
            className="px-5 py-3 rounded-lg border border-white/15 text-white no-underline"
            href="sms:+64276421824"
          >
            Text 027 642 1824
          </a>
        </div>
      </div>
    </div>
  );
}

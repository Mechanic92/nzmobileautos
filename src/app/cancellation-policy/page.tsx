export const metadata = {
  title: "24-Hour Cancellation Policy",
  description: "24-hour cancellation and rescheduling policy for Mobile Autoworks NZ bookings.",
  alternates: {
    canonical: "/cancellation-policy",
  },
};

export default function CancellationPolicyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">24-Hour Cancellation Policy</h1>
        <p className="mt-4 text-white/70">
          This policy applies to online bookings secured with payment. By booking and paying, you agree to this policy.
        </p>

        <div className="mt-10 space-y-8">
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">1. Cancel or reschedule (no fee)</h2>
            <p className="text-white/70">
              You may cancel or reschedule your appointment up to <strong>24 hours</strong> before the scheduled start time
              without a cancellation fee.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">2. Late cancellations and no-shows</h2>
            <p className="text-white/70">
              Cancellations within 24 hours of the appointment time, or failure to provide access to the vehicle at the agreed
              time/location, may result in the booking fee being retained (in whole or in part) to cover reserved time and
              travel.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">3. If we need to reschedule</h2>
            <p className="text-white/70">
              If we need to reschedule due to circumstances outside our control (for example weather, safety, breakdown, or
              emergency), we will offer the next available time slot. If rescheduling is not suitable, we will provide a
              refund of the booking fee.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">4. How to cancel or reschedule</h2>
            <p className="text-white/70">
              To cancel or reschedule, contact us as soon as possible via phone or the Contact page.
            </p>
            <p className="text-white/70">
              <a className="text-primary" href="/contact">Contact Mobile Autoworks NZ</a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">5. Relationship to Terms</h2>
            <p className="text-white/70">
              This policy forms part of the Terms &amp; Conditions.
            </p>
            <p className="text-white/70">
              <a className="text-primary" href="/terms">View Terms &amp; Conditions</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

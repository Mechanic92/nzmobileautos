export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for Mobile Autoworks NZ bookings and services.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Terms &amp; Conditions</h1>
        <p className="mt-4 text-white/70">
          These Terms &amp; Conditions apply to bookings and services provided by Mobile Autoworks NZ. By booking and/or paying
          for an appointment, you agree to these terms.
        </p>

        <div className="mt-10 space-y-8">
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">1. Services</h2>
            <p className="text-white/70">
              We provide mobile automotive diagnostics, inspections, servicing, and repairs. The scope of work depends on the
              service selected and the vehicle condition at the time of appointment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">2. Booking confirmation</h2>
            <p className="text-white/70">
              A booking is considered confirmed once payment is successfully processed and you receive a confirmation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">3. Pricing and estimates</h2>
            <p className="text-white/70">
              Where a fixed price is shown (for example diagnostics or inspections), it applies to the defined service scope.
              For servicing and repairs, any price shown online may be an estimate and may vary depending on vehicle
              specifications, access, condition, and additional requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">4. Access and safety</h2>
            <p className="text-white/70">
              You must provide safe access to the vehicle at the agreed location and time. If access is not available or the
              working conditions are unsafe, we may be unable to complete the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">5. Cancellation and rescheduling</h2>
            <p className="text-white/70">
              Our cancellation and rescheduling rules are set out in the 24-hour cancellation policy. Please review it before
              booking:
            </p>
            <p className="text-white/70">
              <a className="text-primary" href="/cancellation-policy">View 24-hour cancellation policy</a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">6. Payments</h2>
            <p className="text-white/70">
              Payments are processed securely via Stripe. We do not store full card details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">7. Liability</h2>
            <p className="text-white/70">
              Nothing in these terms limits any rights you may have under the Consumer Guarantees Act 1993 or other
              applicable New Zealand consumer law. To the maximum extent permitted by law, we are not liable for indirect or
              consequential loss.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">8. Contact</h2>
            <p className="text-white/70">
              If you have questions about these terms, contact us via the Contact page.
            </p>
            <p className="text-white/70">
              <a className="text-primary" href="/contact">Contact Mobile Autoworks NZ</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

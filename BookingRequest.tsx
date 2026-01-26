import { Button } from "@/components/ui/button";
import Footer from "./Footer";
import Header from "./Header";
import Seo from "./Seo";
import { COMPANY_INFO } from "@/const";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function BookingRequest() {
  const mechanicDeskBookingUrl = (import.meta as any).env?.VITE_MECHANICDESK_BOOKING_URL as string | undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Booking Request | Mobile Mechanic Auckland"
        description="Submit a booking request to Mobile Autoworks NZ. Requests are reviewed and confirmed by the technician before any work is locked in."
      />
      <Header />

      <main className="flex-1">
        <section className="py-14 md:py-20">
          <div className="container max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold">Booking request</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Submitting a booking request does <span className="font-bold">not</span> lock you into a job.
              Requests are reviewed and confirmed by the technician before any work is scheduled.
            </p>

            <div className="mt-8 rounded-lg border bg-background p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-accent mt-0.5" />
                <div className="text-sm md:text-base">
                  <div className="font-bold">How it works</div>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <div>1. You submit a booking request.</div>
                    <div>2. We review the details and confirm a time.</div>
                    <div>3. Only confirmed jobs are locked into the schedule.</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {mechanicDeskBookingUrl ? (
                  <a href={mechanicDeskBookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                    <Button size="lg" className="w-full sm:w-auto">Open booking request (subject to confirmation)</Button>
                  </a>
                ) : (
                  <a href="tel:0276421824" className="inline-flex">
                    <Button size="lg" className="w-full sm:w-auto">Call/text to request a booking</Button>
                  </a>
                )}

                <a href="tel:0276421824" className="inline-flex">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">Call or text {COMPANY_INFO.phone}</Button>
                </a>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                For urgent breakdown assistance, call/text {COMPANY_INFO.phone}.
              </div>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              Prefer a written estimate first? Use the <Link href="/quote"><a className="underline font-medium">quote request</a></Link> form.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

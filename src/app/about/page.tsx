import { Shield, Award, Users, Clock, CheckCircle, Wrench } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "Learn about Mobile Autoworks NZ - Auckland's trusted mobile mechanic service providing expert diagnostics, pre-purchase inspections, and quality servicing at your location.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-20 pb-24">
      {/* Hero Section */}
      <section className="container pt-12 lg:pt-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your Trusted <span className="text-primary">Mobile Mechanic</span>
          </h1>
          <p className="text-xl text-muted leading-relaxed">
            We bring professional automotive expertise directly to your home or workplace across Auckland. 
            No more wasted time at workshops - just honest, transparent service delivered where you need it.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">Our Story</h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                Mobile Autoworks NZ was founded on a simple belief: quality automotive service shouldn't 
                require you to rearrange your entire day. We saw too many Aucklanders struggling to find 
                time for essential car maintenance and pre-purchase inspections.
              </p>
              <p>
                Today, we're proud to be Auckland's most trusted mobile mechanic service, delivering 
                professional diagnostics, comprehensive pre-purchase inspections, and quality servicing 
                directly to our customers' locations.
              </p>
              <p>
                Every service we provide comes with the same commitment: transparent pricing, detailed 
                reporting, and expert advice you can trust when making important decisions about your vehicle.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-2">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted">Inspections Completed</div>
            </div>
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-2">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted">Customer Satisfaction</div>
            </div>
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-2">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">Same Day</div>
              <div className="text-sm text-muted">Report Delivery</div>
            </div>
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-2">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">Fully</div>
              <div className="text-sm text-muted">Insured Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-surface2 py-20">
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose Mobile Autoworks?</h2>
            <p className="text-muted">
              We're not just another mobile mechanic - we're your trusted automotive partner.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold">MTA Standards</h3>
              <p className="text-muted text-sm leading-relaxed">
                All our inspections and services meet or exceed Motor Trade Association standards, 
                giving you confidence in every report and recommendation.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Transparent Pricing</h3>
              <p className="text-muted text-sm leading-relaxed">
                Fixed-rate pricing with no hidden fees. You'll know exactly what you're paying 
                before we start, with detailed breakdowns in every quote.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Convenient Service</h3>
              <p className="text-muted text-sm leading-relaxed">
                We come to you - home, work, or the seller's location. Book online in minutes 
                and choose a time that works for your schedule.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wrench className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Expert Technicians</h3>
              <p className="text-muted text-sm leading-relaxed">
                Our team brings years of experience across all vehicle makes and models, 
                with ongoing training in the latest diagnostic technology.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Detailed Reports</h3>
              <p className="text-muted text-sm leading-relaxed">
                Every inspection includes a comprehensive PDF report with photos, priority ratings, 
                and clear recommendations - delivered the same day.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Customer First</h3>
              <p className="text-muted text-sm leading-relaxed">
                We're here to help you make informed decisions, not push unnecessary services. 
                Honest advice and clear communication, every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <div className="rounded-[2rem] bg-primary p-12 lg:p-16 text-center space-y-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-primaryText">
            Ready to experience the difference?
          </h2>
          <p className="text-primaryText/80 text-lg max-w-2xl mx-auto">
            Book your mobile inspection or service today. Fixed pricing, same-day reports, and expert advice you can trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="/instant-quote"
              className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-bg text-text font-bold text-xl hover:scale-105 transition-all shadow-2xl"
            >
              Get Instant Quote
            </a>
            <a
              href="/book"
              className="inline-flex items-center justify-center px-10 py-5 rounded-2xl border-2 border-primaryText text-primaryText font-bold text-xl hover:bg-primaryText/10 transition-all"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

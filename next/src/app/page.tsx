import { Check, Shield, Clock, MapPin, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-24">
      {/* Hero Section */}
      <section className="container pt-12 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="w-4 h-4" />
              <span>Auckland's #1 Mobile Mechanic</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              Pro Car Care. <br />
              <span className="text-primary">At Your Door.</span>
            </h1>
            <p className="text-xl text-muted max-w-xl leading-relaxed">
              Skip the workshop. We provide expert mobile diagnostics, pre-purchase inspections, and quality servicing across Auckland. Professional reports, fixed pricing, and easy online booking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primaryText font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                href="/instant-quote"
              >
                Get Instant Quote
              </a>
              <a 
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-border bg-surface hover:bg-surface2 text-text font-bold text-lg transition-all" 
                href="/book"
              >
                Book Now
              </a>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Fully Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Same Day Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>MTA Standards</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/20 rounded-[2rem] blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
            <div className="relative rounded-2xl border border-border bg-surface p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Why Mobile?</h3>
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    "No more taking time off work",
                    "Watch the work being done at your home",
                    "Expert advice directly from the mechanic",
                    "Flat rate call-out fees across Auckland",
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-muted">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">Expert Services</h2>
          <p className="text-muted text-lg">
            Professional automotive solutions delivered to your home or workplace.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Diagnostics */}
          <div className="flex flex-col p-8 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-all group">
            <div className="mb-6 inline-flex p-4 rounded-xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
              < Zap className="w-8 h-8 " />
            </div>
            <h3 className="text-2xl font-bold mb-2">Diagnostics</h3>
            <p className="text-muted mb-6 flex-grow">
              Ideal for warning lights, rough idle, or performance issues. We use professional scan tools to find the root cause.
            </p>
            <div className="text-2xl font-bold text-primary mb-6">$140 <span className="text-sm font-normal text-muted">flat rate</span></div>
            <ul className="space-y-3 mb-8">
              {[
                "Full OBD2 Scan & Clear",
                "Live Data Analysis",
                "Written Diagnostic Report",
                "Recommendations for repair",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a href="/instant-quote?intent=DIAGNOSTICS" className="w-full py-4 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary hover:text-primaryText transition-all text-center">
              Book Diagnostics
            </a>
          </div>

          {/* PPI */}
          <div className="flex flex-col p-8 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-all group relative">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primaryText text-xs font-bold uppercase tracking-widest">Popular</div>
            <div className="mb-6 inline-flex p-4 rounded-xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Pre-Purchase</h3>
            <p className="text-muted mb-6 flex-grow">
              Don't buy a lemon. Our 100+ point inspection gives you full confidence before you commit to a purchase.
            </p>
            <div className="text-2xl font-bold text-primary mb-6">$180 <span className="text-sm font-normal text-muted">flat rate</span></div>
            <ul className="space-y-3 mb-8">
              {[
                "Engine & Drivetrain Check",
                "Photos of critical issues",
                "Body & Rust Assessment",
                "Road Test & Report",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a href="/instant-quote?intent=PPI" className="w-full py-4 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary hover:text-primaryText transition-all text-center">
              Book Inspection
            </a>
          </div>

          {/* Servicing */}
          <div className="flex flex-col p-8 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-all group">
            <div className="mb-6 inline-flex p-4 rounded-xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Servicing</h3>
            <p className="text-muted mb-6 flex-grow">
              Regular maintenance to keep your engine running smoothly and preserve your vehicle's value.
            </p>
            <div className="text-2xl font-bold text-primary mb-6">From $149 <span className="text-sm font-normal text-muted">estimate</span></div>
            <ul className="space-y-3 mb-8">
              {[
                "Oil + Filter Changes",
                "Basic Safety Services",
                "Comprehensive Servicing",
                "Service Light Resets",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a href="/instant-quote?intent=SERVICE" className="w-full py-4 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary hover:text-primaryText transition-all text-center">
              Get Service Quote
            </a>
          </div>
        </div>
      </section>

      {/* Service Tiers Detailed */}
      <section className="bg-surface2 py-20">
        <div className="container space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold">Service Tiers</h2>
            <p className="text-muted">Detailed breakdown of our mobile service levels.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Oil + Filter */}
            <div className="bg-surface border border-border p-8 rounded-2xl space-y-6">
              <div>
                <h4 className="text-xl font-bold">Oil + Filter</h4>
                <p className="text-sm text-muted mt-1">Essential engine protection</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Fresh premium oil (up to 5L)</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Quality oil filter replacement</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Basic under-bonnet safety check</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Fluid level top-ups</span>
                </li>
              </ul>
            </div>

            {/* Basic Service */}
            <div className="bg-surface border border-border p-8 rounded-2xl space-y-6">
              <div>
                <h4 className="text-xl font-bold">Basic Service</h4>
                <p className="text-sm text-muted mt-1">Complete safety & maintenance</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2 font-semibold">
                  <span className="text-primary italic">Everything in Oil + Filter, plus:</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Brake inspection & report</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Tyre pressure & condition check</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Battery & charging system test</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Suspension & steering check</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Service light reset</span>
                </li>
              </ul>
            </div>

            {/* Comprehensive Service */}
            <div className="bg-surface border border-primary/30 p-8 rounded-2xl space-y-6 ring-1 ring-primary/20 shadow-xl">
              <div>
                <h4 className="text-xl font-bold">Comprehensive</h4>
                <p className="text-sm text-muted mt-1">Ultimate peace of mind</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2 font-semibold">
                  <span className="text-primary italic">Everything in Basic Service, plus:</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Air filter inspection & condition report</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Cabin/pollen filter inspection</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Spark plug inspection or replacement*</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Brake clean & adjust</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Full system diagnostic scan</span>
                </li>
              </ul>
              <p className="text-[10px] text-muted italic">*Parts priced separately based on vehicle model</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container">
        <div className="rounded-[2rem] bg-primary p-8 lg:p-16 text-center space-y-6">
          <h2 className="text-4xl lg:text-6xl font-bold text-primaryText tracking-tight">Ready to book?</h2>
          <p className="text-primaryText/80 text-lg max-w-xl mx-auto font-medium">
            Get an instant price for your vehicle and secure your time slot in under 2 minutes.
          </p>
          <div className="pt-4">
            <a 
              href="/instant-quote"
              className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-bg text-text font-bold text-xl hover:scale-105 transition-all shadow-2xl"
            >
              Start Instant Quote
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}


import { Award, CheckCircle, Clock, MapPin, Phone, Shield, Star, Wrench } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mobile Mechanic Auckland | Mobile Diagnostics Auckland",
  description: "Mobile mechanic Auckland. Mobile diagnostics Auckland, servicing and repairs across Central Auckland, West Auckland and the North Shore. Call or text 027 642 1824.",
};

const heroImageUrl = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=2000";

export default function HomePage() {
  const benefits = [
    {
      icon: Clock,
      title: "Saves You Time",
      description: "No workshop visits. We come to your home or workplace.",
    },
    {
      icon: Shield,
      title: "Honest & Transparent",
      description: "Clear communication, no hidden fees.",
    },
    {
      icon: Award,
      title: "Quality Workmanship",
      description: "Experienced mechanics using quality parts and tools.",
    },
    {
      icon: Phone,
      title: "Always Available",
      description: "Quick response times and flexible scheduling.",
    },
  ];

  const services = [
    {
      icon: Wrench,
      title: "General Servicing",
      description: "Bronze, Silver, and Gold service packages tailored to your needs.",
    },
    {
      icon: CheckCircle,
      title: "Pre-Purchase Inspections",
      description: "Comprehensive vehicle assessments before you buy.",
    },
    {
      icon: Shield,
      title: "WOF Remedial Repairs",
      description: "Post-inspection remedial work to get your vehicle WOF-ready (no WOF inspections carried out).",
    },
    {
      icon: Wrench,
      title: "Diagnostics & Repairs",
      description: "From brake work to engine diagnostics, we handle it all.",
    },
  ];

  const faqs = [
    {
      q: "Which areas of Auckland do you cover?",
      a: "We are based in West Auckland and primarily service Massey, Te Atatu, Henderson, Hobsonville, West Harbour, Kumeu, and surrounding areas. For larger jobs, we can travel further across Auckland."
    },
    {
      q: "Do you carry out WOF inspections?",
      a: "No, we do not perform the inspection itself. We specialize in 'WOF Remedial Repairs'—fixing the faults found during your official inspection so your vehicle can pass its re-check without you needing to leave home."
    },
    {
      q: "How much does a mobile diagnostic scan cost?",
      a: "Our flat rate for a mobile diagnostic scan and fault finding is $140. This includes professional tool connection, error code analysis, and a clear explanation of required repairs."
    },
    {
      q: "Can you service my car while I'm at work?",
      a: "Absolutely! As long as we have access to the vehicle and a relatively level space to work, we can complete most servicing and repairs while you're busy at the office or home."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0">
            <img src={heroImageUrl} alt="Mobile mechanic" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/75" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
          </div>

          <div className="container relative py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80">
                <MapPin className="h-4 w-4 text-primary" />
                Mobile mechanic Auckland – Central Auckland, West Auckland, North Shore
              </div>

              <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                Mobile Mechanic Auckland
              </h1>

              <p className="mt-4 text-xl md:text-2xl font-bold text-primary">Mobile Diagnostics Auckland</p>

              <p className="mt-4 text-base md:text-lg text-white/85 max-w-2xl">
                Mobile mechanic across Auckland. On-site diagnostics, servicing and repairs at your home or workplace.
              </p>

              <div className="mt-8 rounded-md border border-white/15 bg-white/5 p-5">
                <div className="text-lg font-bold">Breakdown Assistance – Auckland</div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/85">
                  <div>1. No-start / flat battery</div>
                  <div>2. Warning lights</div>
                  <div>3. Stalling / running issues</div>
                  <div>4. Roadside diagnostics</div>
                </div>
                <div className="mt-4 text-sm">
                  For breakdown assistance, call or text{' '}
                  <a href="tel:0276421824" className="font-bold underline">027 642 1824</a>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center uppercase tracking-wider">
                <Link
                  href="/instant-quote"
                  className="inline-flex items-center justify-center px-8 py-4 text-base md:text-lg bg-primary hover:bg-primary/90 text-black font-bold transition-all"
                >
                  Book Online (Instant Confirmation)
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center px-8 py-4 text-base md:text-lg border border-white/30 hover:bg-white/10 text-white font-medium transition-all"
                >
                  View Services
                </Link>
                <a href="tel:0276421824" className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/60">Call Chris directly</div>
                    <div className="font-bold text-white leading-none">027 642 1824</div>
                  </div>
                </a>
              </div>

              <div className="mt-3 text-xs text-white/75 text-center sm:text-left">
                Booking requests are reviewed and confirmed by the technician before anything is locked in.
                <div className="mt-1">Or call/text 027 642 1824 for urgent jobs</div>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-xs font-bold opacity-80 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Qualified Mechanic</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>100% Mobile Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Guaranteed Workmanship</span>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/75">
                <div className="rounded-[10px] border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Fast callouts</div>
                  <div className="mt-1">We come to your home or workplace.</div>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Clear communication</div>
                  <div className="mt-1">No surprises, just honest advice.</div>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Quality workmanship</div>
                  <div className="mt-1">Experienced mechanics & tools.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Mobile Autoworks NZ?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Professional mobile mechanical services that come to you, saving time without compromising quality.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="text-center border border-white/10 bg-[#0a0a0a] hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-shadow rounded-lg p-6"
                >
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-white/70">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Services */}
        <section className="py-16 md:py-24 bg-[#f5f5f5] text-black">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Popular Services
              </h2>
              <p className="text-lg text-black/70 max-w-2xl mx-auto">
                From routine maintenance to complex diagnostics, we bring professional automotive services to your location.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {services.map((service, index) => (
                <div key={index} className="bg-white border border-black/10 hover:border-primary transition-colors shadow-sm rounded-lg p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                    <service.icon className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-black/70">{service.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-10 py-4 bg-black text-white font-bold hover:bg-black/90 transition-all rounded-md"
              >
                View All Services
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Auckland mobile mechanic, done properly</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Clear communication, mobile diagnostics, and quality workmanship across Central Auckland, West Auckland and the North Shore.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "David S.",
                  location: "Hobsonville",
                  text: "Chris is the only mechanic I trust with my European cars. He has the diagnostics tools that most mobile guys don't, and he actually explains the data. Exceptional service.",
                },
                {
                  name: "Sarah L.",
                  location: "Te Atatu Peninsula",
                  text: "So much easier than dropping my car at a workshop. He fixed my WOF failure items in my own driveway while I worked from home. Professional, honest, and very reasonable.",
                },
                {
                  name: "Mark T.",
                  location: "Henderson",
                  text: "Found a major issue during a pre-purchase inspection that saved me thousands. His report was thorough and he talk me through every detail. Cannot recommend enough.",
                }
              ].map((testimonial, i) => (
                <div key={i} className="border border-white/10 bg-[#0a0a0a] hover:border-primary/50 transition-colors rounded-lg p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{testimonial.name}</h3>
                  <p className="text-sm text-white/70 mb-4">{testimonial.location}</p>
                  <p className="text-white/75 italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 md:py-24 bg-[#f5f5f5] text-black">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Servicing Auckland
              </h2>
              <p className="text-lg text-black/70 max-w-2xl mx-auto">
                Central Auckland, West Auckland and the North Shore.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                "Central Auckland",
                "West Auckland",
                "North Shore",
              ].map((area) => (
                <div key={area} className="inline-flex items-center gap-2 h-10 px-6 rounded-full border border-black/15 bg-white text-black hover:bg-black hover:text-white transition-colors font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-white text-black">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-black/70 max-w-2xl mx-auto">
                Everything you need to know about our mobile mechanical services.
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group border border-black/10 rounded-lg p-6 bg-white hover:border-primary/50 transition-colors">
                  <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                    {faq.q}
                    <span className="text-primary text-2xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-black/70 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to get it sorted?</h2>
              <p className="mt-4 text-lg text-white/70">
                Tell us what's going on and we'll confirm scope before any major work.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/instant-quote"
                  className="inline-flex items-center justify-center px-10 py-4 text-lg bg-primary text-black font-bold hover:bg-primary/90 transition-all rounded-md"
                >
                  Get Instant Quote
                </Link>
                <a
                  href="tel:0276421824"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 text-lg border border-white/30 hover:bg-white/10 text-white font-medium transition-all rounded-md"
                >
                  <Phone className="h-5 w-5" />
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "../../Footer";
import Header from "../../Header";
import Seo from "../../Seo";
import { CheckCircle2, Phone, MapPin, Clock, Shield, Award } from "lucide-react";
import { Link, useParams } from "wouter";
import { COMPANY_INFO } from "@/const";

interface ServiceData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  benefits: string[];
  process: { step: string; description: string }[];
  pricing?: string;
  faqs: { q: string; a: string }[];
}

const SERVICES: Record<string, ServiceData> = {
  "mobile-diagnostics": {
    slug: "mobile-diagnostics",
    title: "Mobile Diagnostics Auckland",
    metaTitle: "Mobile Car Diagnostics Auckland | OBD2 Scan & Fault Finding | Mobile Autoworks NZ",
    metaDescription: "Professional mobile car diagnostics in Auckland. OBD2 scanning, fault code reading, and expert diagnosis at your home or workplace. $140 flat rate. Call 027 642 1824.",
    heroTitle: "Mobile Car Diagnostics Auckland",
    heroSubtitle: "Professional OBD2 scanning and fault diagnosis at your location",
    description: "Is your check engine light on? Strange warning lights appearing? Our mobile diagnostic service brings professional-grade scanning equipment directly to you. We don't just read codes—we diagnose the root cause and explain exactly what repairs are needed.",
    benefits: [
      "Professional OBD2 and manufacturer-specific diagnostic tools",
      "Full fault code reading and interpretation",
      "Live data analysis to pinpoint issues",
      "Clear explanation of findings and repair options",
      "Written diagnostic report provided",
      "No need to drive a potentially unsafe vehicle to a workshop",
    ],
    process: [
      { step: "Book your diagnostic", description: "Call or book online. We'll confirm a time that suits you." },
      { step: "We come to you", description: "Our fully-equipped van arrives at your home or workplace." },
      { step: "Connect & scan", description: "We connect professional diagnostic tools to your vehicle's OBD port." },
      { step: "Analyse & diagnose", description: "We interpret fault codes and run live data tests to find the root cause." },
      { step: "Report & advise", description: "You receive a clear explanation and written report with repair recommendations." },
    ],
    pricing: "$140 flat rate for diagnostic scan and fault finding. This includes travel within our standard service area, professional tool connection, error code analysis, and a clear explanation of required repairs.",
    faqs: [
      { q: "What vehicles can you diagnose?", a: "We can diagnose most petrol and diesel vehicles from 1996 onwards (OBD2 compliant). This includes European, Japanese, and domestic brands." },
      { q: "Will you fix the problem on the spot?", a: "If it's a minor issue we can resolve immediately, yes. For larger repairs, we'll provide a quote and can schedule the work for another visit." },
      { q: "What if no fault codes are found?", a: "Sometimes intermittent faults don't store codes. We'll still perform live data analysis and a visual inspection to help identify the issue." },
    ],
  },
  "pre-purchase-inspection": {
    slug: "pre-purchase-inspection",
    title: "Pre-Purchase Car Inspection Auckland",
    metaTitle: "Pre-Purchase Car Inspection Auckland | Used Car Check | Mobile Autoworks NZ",
    metaDescription: "Don't buy a lemon. Mobile pre-purchase car inspection in Auckland. 150+ point check, written report, expert advice. We come to the seller. Call 027 642 1824.",
    heroTitle: "Pre-Purchase Car Inspection Auckland",
    heroSubtitle: "Comprehensive vehicle assessment before you buy",
    description: "Buying a used car is exciting—but it's also risky. Hidden mechanical problems, accident damage, and deferred maintenance can turn a bargain into a money pit. Our pre-purchase inspection gives you the full picture before you hand over your hard-earned money.",
    benefits: [
      "150+ point comprehensive inspection",
      "Engine, transmission, and drivetrain assessment",
      "Suspension, steering, and brake inspection",
      "Body and structural integrity check",
      "Electrical system and warning light scan",
      "Written report with photos",
      "Expert advice on fair pricing and negotiation",
    ],
    process: [
      { step: "Find a car you like", description: "Browse Trade Me, dealers, or private sellers." },
      { step: "Book the inspection", description: "Give us the details and we'll arrange to meet at the seller's location." },
      { step: "We inspect thoroughly", description: "Our mechanic performs a comprehensive 150+ point inspection." },
      { step: "Receive your report", description: "You get a detailed written report with findings and photos." },
      { step: "Make an informed decision", description: "Buy with confidence, negotiate the price, or walk away." },
    ],
    pricing: "Pre-purchase inspections start from $200-$300 depending on vehicle type and location. Contact us for an exact quote.",
    faqs: [
      { q: "Can you inspect at a dealer?", a: "Yes, we regularly inspect vehicles at dealerships. Most dealers are happy to accommodate a professional inspection." },
      { q: "How long does the inspection take?", a: "A thorough inspection typically takes 45-60 minutes depending on the vehicle." },
      { q: "What if the seller won't allow an inspection?", a: "This is a major red flag. We strongly advise against purchasing any vehicle where the seller refuses an independent inspection." },
    ],
  },
  "wof-repairs": {
    slug: "wof-repairs",
    title: "WOF Repairs Auckland",
    metaTitle: "WOF Repairs Auckland | Mobile WOF Remedial Work | Mobile Autoworks NZ",
    metaDescription: "Failed your WOF? Mobile WOF remedial repairs in Auckland. We fix suspension, brakes, lights, and more at your home. No workshop visit needed. Call 027 642 1824.",
    heroTitle: "WOF Remedial Repairs Auckland",
    heroSubtitle: "Fix what failed your WOF—at your location",
    description: "Failed your Warrant of Fitness? Don't stress about getting your car to a workshop. We come to you and fix the issues so you can get your vehicle re-checked and back on the road. Note: We do not perform WOF inspections—we fix the faults found during your official inspection.",
    benefits: [
      "Mobile repairs at your home or workplace",
      "Common WOF failure items fixed on-site",
      "Brakes, suspension, lights, wipers, and more",
      "Quality parts with warranty",
      "No need to drive an unsafe vehicle",
      "Fast turnaround to meet your 28-day deadline",
    ],
    process: [
      { step: "Get your WOF inspection", description: "Take your vehicle to a VTNZ, VINZ, or approved testing station." },
      { step: "Note the failure items", description: "The inspector will list exactly what needs fixing." },
      { step: "Contact us with the list", description: "Send us your failure sheet and we'll provide a quote." },
      { step: "We fix it on-site", description: "Our mobile mechanic comes to you and completes the repairs." },
      { step: "Get your re-check", description: "Return to the testing station within 28 days for a free re-check." },
    ],
    pricing: "Pricing varies based on the repairs needed. Contact us with your WOF failure sheet for an accurate quote.",
    faqs: [
      { q: "Do you do WOF inspections?", a: "No, we do not perform the WOF inspection itself. We specialize in fixing the issues found during your inspection so you can pass the re-check." },
      { q: "What WOF failures can you fix?", a: "Most common failures including brakes, suspension bushes, ball joints, tie rod ends, lights, wipers, exhaust repairs, and more." },
      { q: "How quickly can you come?", a: "We understand the 28-day deadline. We prioritize WOF repairs and can usually schedule within a few days." },
    ],
  },
  "car-servicing": {
    slug: "car-servicing",
    title: "Mobile Car Servicing Auckland",
    metaTitle: "Mobile Car Service Auckland | Oil Change & Full Service | Mobile Autoworks NZ",
    metaDescription: "Mobile car servicing in Auckland. Bronze, Silver, and Gold service packages at your home or workplace. Quality parts, qualified mechanic. Call 027 642 1824.",
    heroTitle: "Mobile Car Servicing Auckland",
    heroSubtitle: "Professional vehicle servicing at your doorstep",
    description: "Regular servicing keeps your car running smoothly, maintains its value, and prevents costly breakdowns. Our mobile service brings the workshop to you—no need to take time off work or arrange alternative transport.",
    benefits: [
      "Servicing at your home or workplace",
      "Bronze, Silver, and Gold packages available",
      "Quality oils and filters",
      "Comprehensive safety checks included",
      "Service book stamped",
      "Flexible scheduling around your calendar",
    ],
    process: [
      { step: "Choose your service level", description: "Bronze (essential), Silver (standard), or Gold (comprehensive)." },
      { step: "Book a time", description: "We work around your schedule—mornings, afternoons, or weekends." },
      { step: "We arrive fully equipped", description: "Our van carries everything needed for a complete service." },
      { step: "Service completed on-site", description: "Oil, filters, fluids, and safety checks—all done in your driveway." },
      { step: "Documentation provided", description: "Service book stamped and invoice with work completed." },
    ],
    pricing: "Bronze Service from $180 | Silver Service from $250 | Gold Service from $350. Exact pricing depends on your vehicle's requirements. Contact us for a quote.",
    faqs: [
      { q: "What's included in each service level?", a: "Bronze: Oil + filter, basic fluid check. Silver: Bronze + full fluid top-ups, tyre pressure, safety inspection. Gold: Silver + air/cabin filter, lights, battery test, steering & suspension check, road test." },
      { q: "Do you use genuine parts?", a: "We use quality aftermarket parts that meet or exceed OEM specifications. Genuine parts available on request." },
      { q: "Will this void my warranty?", a: "No. Under NZ law, you can have your vehicle serviced by any qualified mechanic without voiding the manufacturer's warranty, as long as quality parts are used." },
    ],
  },
  "brake-repairs": {
    slug: "brake-repairs",
    title: "Mobile Brake Repairs Auckland",
    metaTitle: "Mobile Brake Repairs Auckland | Brake Pads & Rotors | Mobile Autoworks NZ",
    metaDescription: "Mobile brake repairs in Auckland. Brake pads, rotors, and brake fluid service at your home or workplace. Squealing or grinding brakes? Call 027 642 1824.",
    heroTitle: "Mobile Brake Repairs Auckland",
    heroSubtitle: "Expert brake service at your location",
    description: "Your brakes are your most important safety system. If you're hearing squealing, grinding, or feeling vibration when braking, don't ignore it. Our mobile brake service means you don't have to drive an unsafe vehicle to a workshop—we come to you.",
    benefits: [
      "Brake pad replacement",
      "Brake rotor/disc machining or replacement",
      "Brake fluid flush and bleed",
      "Brake caliper service",
      "Handbrake adjustment",
      "Quality parts with warranty",
    ],
    process: [
      { step: "Describe the symptoms", description: "Squealing, grinding, soft pedal, vibration—tell us what you're experiencing." },
      { step: "We provide a quote", description: "Based on your vehicle and symptoms, we'll estimate the repair cost." },
      { step: "Book your repair", description: "We schedule a time at your home or workplace." },
      { step: "Inspection and repair", description: "We inspect the brake system and complete the necessary repairs." },
      { step: "Test and verify", description: "We road test to ensure brakes are working perfectly." },
    ],
    pricing: "Brake pad replacement from $250 per axle (parts and labour). Brake pad + rotor replacement from $450 per axle. Exact pricing depends on your vehicle. Contact us for a quote.",
    faqs: [
      { q: "How do I know if my brakes need replacing?", a: "Warning signs include squealing or grinding noises, vibration when braking, soft or spongy pedal, car pulling to one side, or brake warning light on." },
      { q: "Can you machine my rotors instead of replacing?", a: "If the rotors have enough material and aren't warped beyond specification, machining is an option. We'll advise what's best for your situation." },
      { q: "How long do brake pads last?", a: "Typically 30,000-70,000km depending on driving style, vehicle weight, and conditions. City driving wears brakes faster than highway driving." },
    ],
  },
};

export default function ServicePage() {
  const params = useParams<{ slug: string }>();
  const service = SERVICES[params.slug || ""];

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <Link href="/services">
              <Button>View All Services</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.description,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Mobile Autoworks NZ",
      "telephone": "+64276421824",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Auckland",
        "addressRegion": "Auckland",
        "addressCountry": "NZ"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": "Auckland"
    },
    "serviceType": service.title
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={service.metaTitle}
        description={service.metaDescription}
        canonical={`https://www.mobileautoworksnz.com/services/${service.slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-black text-white">
          <div className="container relative py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80">
                <MapPin className="h-4 w-4 text-primary" />
                Mobile service across Auckland
              </div>

              <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                {service.heroTitle}
              </h1>

              <p className="mt-4 text-xl md:text-2xl font-bold text-primary">{service.heroSubtitle}</p>

              <p className="mt-4 text-base md:text-lg text-white/85 max-w-2xl">
                Professional mobile mechanical services that come to you.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center uppercase tracking-wider">
                <Link href="/quote">
                  <Button size="lg" className="text-base md:text-lg px-8 bg-accent hover:bg-accent/90 text-white font-bold rounded-none">
                    Quote request
                  </Button>
                </Link>
                <a href="tel:0276421824" className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/60">Call Chris directly</div>
                    <div className="font-bold text-white leading-none">{COMPANY_INFO.phone}</div>
                  </div>
                </a>
              </div>

              <div className="mt-3 text-xs text-white/75">
                Booking requests are reviewed and confirmed by the technician.
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {service.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-background rounded-lg border">
                  <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              {service.process.map((step, i) => (
                <div key={i} className="flex gap-4 mb-8 last:mb-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{step.step}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        {service.pricing && (
          <section className="py-16 bg-muted/30">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">Pricing</h2>
                <Card className="border-2 border-accent">
                  <CardContent className="pt-6">
                    <p className="text-lg">{service.pricing}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* FAQs - matching Home.tsx accordion style */}
        <section className="py-16 md:py-24 bg-white text-black">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-black/70 max-w-2xl mx-auto">
                Common questions about our {service.title.toLowerCase()} service.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {service.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-black/70 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Mobile Autoworks NZ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent/15 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Saves You Time</h3>
                <p className="text-muted-foreground text-sm">We come to your home or workplace. No waiting rooms.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent/15 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Honest & Transparent</h3>
                <p className="text-muted-foreground text-sm">Clear communication, no hidden fees, no unnecessary work.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent/15 flex items-center justify-center">
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Quality Workmanship</h3>
                <p className="text-muted-foreground text-sm">Qualified mechanic with professional tools and quality parts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <MapPin className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Service Areas</h2>
              <p className="text-muted-foreground mb-6">
                We provide {service.title.toLowerCase()} services across Auckland including West Auckland, North Shore, and Central Auckland.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {["Henderson", "Massey", "Hobsonville", "Te Atatū", "Kumeu", "Albany", "Northcote", "Glenfield"].map(area => (
                  <span key={area} className="px-3 py-1 bg-muted rounded-full text-sm">{area}</span>
                ))}
              </div>
              <Link href="/areas">
                <Button variant="outline">View Full Coverage Map</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Book?</h2>
            <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Get in touch today for professional {service.title.toLowerCase()} at your location.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get a Quote
                </Button>
              </Link>
              <a href="tel:0276421824">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Phone className="mr-2 h-5 w-5" />
                  Call {COMPANY_INFO.phone}
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

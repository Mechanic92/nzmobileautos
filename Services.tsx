import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "./Footer";
import Header from "./Header";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { COMPANY_INFO } from "@/const";
import Seo from "./Seo";
import SelfDiagnosis from "@/components/SelfDiagnosis";

export default function Services() {
  const mechanicDeskBookingUrl = (import.meta as any).env?.VITE_MECHANICDESK_BOOKING_URL as string | undefined;
  const serviceDetailPages = [
    {
      title: "Mobile Diagnostics",
      description: "OBD2 scan + fault finding at your home or workplace.",
      href: "/services/mobile-diagnostics",
    },
    {
      title: "Car Servicing",
      description: "Bronze, Silver, and Gold service packages on-site.",
      href: "/services/car-servicing",
    },
    {
      title: "Brake Repairs",
      description: "Brake pads, rotors, and brake system checks.",
      href: "/services/brake-repairs",
    },
    {
      title: "WOF Remedial Repairs",
      description: "Fix WOF failure items after your inspection (no WOFs issued).",
      href: "/services/wof-repairs",
    },
    {
      title: "Pre-Purchase Inspections",
      description: "Comprehensive checks before you buy a used car.",
      href: "/services/pre-purchase-inspection",
    },
  ];
  const serviceTiers = [
    {
      name: "BRONZE",
      subtitle: "Essential",
      features: [
        "Oil + Filter",
        "Basic fluid check",
        "General condition review",
      ],
      color: "border-amber-700",
    },
    {
      name: "SILVER",
      subtitle: "Essential + Safety",
      features: [
        "Everything in Bronze",
        "Full fluid top-ups",
        "Tyre pressure",
        "Basic safety inspection",
      ],
      color: "border-gray-400",
    },
    {
      name: "GOLD",
      subtitle: "Comprehensive",
      features: [
        "Everything in Silver",
        "Air & cabin filter check",
        "Lights, wipers, battery test",
        "Tyre tread",
        "Steering & suspension overview",
        "Road test",
      ],
      color: "border-yellow-500",
      featured: true,
    },
  ];

  const mechanicalRepairs = [
    "Brakes",
    "Rotors",
    "Suspension",
    "Steering",
    "Water pumps",
    "Radiators",
    "Hoses",
    "Alternators & starters",
    "Timing belts",
    "Clutches",
    "Overheating repairs",
    "General faults",
  ];

  const specializedServices = [
    {
      title: "Diagnostics",
      description:
        "Professional fault finding with clear next-step recommendations. Includes scan, interpretation, resets where applicable.",
    },
    {
      title: "Pre-Purchase Inspections",
      description:
        "Complete on-site inspection including mechanical, safety, fluids, suspension, engine bay, tyres, and road test. Written summary included.",
    },
    {
      title: "WOF Remedial Repairs",
      description:
        "Targeted repairs to fix issues found during a WOF inspection so your vehicle can pass when re-tested. We do not carry out WOF inspections.",
    },
    {
      title: "Fleet Servicing",
      description:
        "Flexible, reliable mobile servicing for small business fleets. Predictable scheduling, on-site servicing, minimal disruption, tailored plans.",
    },
  ];

  const quoteHref = (_preset: string) => "/quote";
  const quoteSymptomHref = (_symptom: string) => "/quote";

  const popularPresets = [
    "Diagnostics",
    "Basic Service",
    "Comprehensive Service",
    "Brakes",
    "Battery/No start",
    "Overheating",
    "Suspension",
    "WOF Remedial Repairs",
  ];

  const serviceCategories = [
    {
      title: "Servicing",
      items: [
        { label: "Vehicle servicing (packages)", href: "#servicing" },
        { label: "Bronze service", href: "#servicing" },
        { label: "Silver service", href: "#servicing" },
        { label: "Gold service", href: "#servicing" },
        { label: "Mobile car servicing (details)", href: "/services/car-servicing" },
      ],
    },
    {
      title: "Repairs",
      items: [
        { label: "Mechanical repairs", href: "#repairs" },
        { label: "Brakes", href: quoteHref("Brakes") },
        { label: "Suspension", href: quoteHref("Suspension") },
        { label: "Cooling / overheating", href: quoteHref("Overheating") },
        { label: "Starter / alternator", href: quoteHref("Alternator & starter") },
        { label: "Mobile brake repairs (details)", href: "/services/brake-repairs" },
      ],
    },
    {
      title: "Diagnostics",
      items: [
        { label: "Diagnostic scan & report", href: quoteHref("Diagnostics") },
        { label: "Check engine / warning light", href: quoteSymptomHref("Check engine light on") },
        { label: "Rough idle / misfire", href: quoteSymptomHref("Rough idle / misfire") },
        { label: "Loss of power", href: quoteSymptomHref("Loss of power") },
        { label: "Mobile diagnostics (details)", href: "/services/mobile-diagnostics" },
      ],
    },
    {
      title: "Inspections",
      items: [
        { label: "Pre-purchase inspection", href: quoteHref("Pre-Purchase Inspection") },
        { label: "WOF remedial repairs", href: quoteHref("WOF Remedial Repairs") },
        { label: "Specialized services", href: "#specialized" },
        { label: "Pre-purchase inspection (details)", href: "/services/pre-purchase-inspection" },
        { label: "WOF remedial repairs (details)", href: "/services/wof-repairs" },
      ],
    },
  ];

  const symptoms = [
    "Check engine light on",
    "Car won’t start",
    "Battery keeps going flat",
    "Overheating",
    "Brake noise / grinding",
    "Vibration at speed",
    "Oil / fluid leak",
    "Strange engine noise",
    "Warning light (ABS / airbag)",
    "Rough idle / misfire",
    "Loss of power",
    "AC not cold",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Mobile Mechanic Auckland Services | Mobile Diagnostics Auckland"
        description="Mobile mechanic Auckland services: mobile diagnostics, servicing and repairs across Central Auckland, West Auckland and the North Shore."
      />
      <Header />

      <main className="flex-1">
        {/* Quick navigation (sticky) */}
        <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
          <div className="container">
            <div className="py-3 flex items-center justify-between gap-4 flex-wrap">
              <nav aria-label="Services quick navigation" className="flex flex-wrap items-center gap-2">
                <a
                  href="#servicing"
                  className="rounded-full border px-3 py-2 text-sm hover:border-accent transition-colors"
                >
                  Servicing
                </a>
                <a
                  href="#repairs"
                  className="rounded-full border px-3 py-2 text-sm hover:border-accent transition-colors"
                >
                  Repairs
                </a>
                <a
                  href="#categories"
                  className="rounded-full border px-3 py-2 text-sm hover:border-accent transition-colors"
                >
                  Categories
                </a>
                <a
                  href="#symptoms"
                  className="rounded-full border px-3 py-2 text-sm hover:border-accent transition-colors"
                >
                  Describe the problem
                </a>
                <a
                  href="#specialized"
                  className="rounded-full border px-3 py-2 text-sm hover:border-accent transition-colors"
                >
                  Specialized
                </a>
              </nav>

              <Link href="/quote">
                <Button size="sm" className="rounded-full px-5">
                  Get a Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary to-accent text-primary-foreground py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=2000"
              alt="Professional car service"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container relative text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Professional mobile mechanical services delivered to your location
              across Central Auckland, West Auckland and the North Shore.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <Button size="lg" className="text-base md:text-lg px-10">Quote request</Button>
              </Link>
              {mechanicDeskBookingUrl ? (
                <Link href="/book">
                  <a className="inline-flex justify-center">
                    <Button size="lg" variant="outline" className="text-base md:text-lg px-10">Booking request (subject to confirmation)</Button>
                  </a>
                </Link>
              ) : null}
              <a href="tel:0276421824" className="inline-flex justify-center">
                <Button size="lg" variant="outline" className="text-base md:text-lg px-10">
                  Call Now
                </Button>
              </a>
            </div>

            <div className="mt-3 text-sm text-primary-foreground/90">
              Booking requests are reviewed and confirmed by the technician before anything is locked in. For urgent jobs, call or text{' '}
              <a className="font-bold underline" href="tel:0276421824">{COMPANY_INFO.phone}</a>.
            </div>
          </div>
        </section>

        {/* Popular services quick links */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Popular services</h2>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                  Jump straight to a quote request with a preset. If you’re unsure, choose Diagnostics.
                </p>
              </div>
              <Link href="/quote">
                <Button variant="outline">Quote request</Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {popularPresets.map((preset) => (
                <Link key={preset} href={quoteHref(preset)}>
                  <Button
                    variant="outline"
                    className="rounded-full h-10 bg-card hover:border-accent"
                  >
                    {preset}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Service detail pages */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Service details</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Learn more about our most-requested mobile services in Auckland.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {serviceDetailPages.map((p) => (
                <Card key={p.href} className="rounded-[10px] border-2 hover:border-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-5">{p.description}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={p.href}>
                        <Button variant="outline">Learn more</Button>
                      </Link>
                      <Link href="/quote">
                        <Button>Quote request</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle Servicing Tiers */}
        <section id="servicing" className="py-16 md:py-24 bg-background scroll-mt-24">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Vehicle Servicing
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Choose a service level that suits your vehicle. All options are
              performed on-site.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {serviceTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`rounded-[10px] border-2 ${tier.color} ${tier.featured ? "ring-2 ring-accent shadow-lg scale-105" : ""
                    }`}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                      {tier.name}
                    </CardTitle>
                    <p className="text-muted-foreground">{tier.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/quote"><Button size="lg">Quote request</Button></Link>
            </div>
          </div>
        </section>

        {/* Mechanical Repairs */}
        <section id="repairs" className="py-16 md:py-24 bg-muted/30 scroll-mt-24">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Mechanical Repairs
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Expert repairs for all common mechanical issues, completed on-site
              with quality parts.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {mechanicalRepairs.map((repair, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-4 bg-card rounded-[10px] border hover:border-accent transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="font-medium">{repair}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/quote"><Button size="lg">Quote request</Button></Link>
            </div>
          </div>
        </section>

        {/* Service categories accordion */}
        <section id="categories" className="py-12 md:py-16 bg-background scroll-mt-24">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">Service categories</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                Browse by category, or describe the problem below and we’ll diagnose it properly.
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid gap-3">
              {serviceCategories.map((cat) => (
                <details
                  key={cat.title}
                  className="group rounded-[10px] border bg-card p-4"
                >
                  <summary className="cursor-pointer list-none select-none flex items-center justify-between gap-4">
                    <span className="font-semibold text-base md:text-lg">{cat.title}</span>
                    <span className="text-sm text-muted-foreground group-open:hidden">Expand</span>
                    <span className="text-sm text-muted-foreground hidden group-open:inline">Collapse</span>
                  </summary>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {cat.items.map((item) => {
                      const isAnchor = item.href.startsWith("#");
                      if (isAnchor) {
                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            className="inline-flex items-center rounded-full border px-4 py-2 text-sm hover:border-accent transition-colors"
                          >
                            {item.label}
                          </a>
                        );
                      }
                      return (
                        <Link key={item.label} href={item.href}>
                          <a className="inline-flex items-center rounded-full border px-4 py-2 text-sm hover:border-accent transition-colors">
                            {item.label}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Describe the problem (Self Diagnosis) */}
        <section id="symptoms" className="py-16 md:py-24 bg-muted/30 scroll-mt-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Not sure what the problem is?</h2>
              <p className="text-center text-muted-foreground max-w-3xl mx-auto">
                Use our guided diagnosis tool to identify common issues and get an instant recommendation.
              </p>
            </div>

            <SelfDiagnosis />
          </div>
        </section>

        {/* Specialized Services */}
        <section id="specialized" className="py-16 md:py-24 bg-background scroll-mt-24">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Specialized Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {specializedServices.map((service, index) => (
                <Card key={index} className="rounded-[10px] border-2 hover:border-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    {mechanicDeskBookingUrl ? (
                      <a href={mechanicDeskBookingUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">Booking request</Button>
                      </a>
                    ) : (
                      <a href="tel:0276421824">
                        <Button variant="outline">Call to book</Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need a Custom Service?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Not sure what you need? Get in touch and we'll help you find the
              right solution for your vehicle.
            </p>
            <Link href="/quote">
              <Button size="lg" variant="secondary" className="text-lg px-8">Quote request</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

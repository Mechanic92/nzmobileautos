import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "../../Footer";
import Header from "../../Header";
import Seo from "../../Seo";
import { MapPin, Phone, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "wouter";
import { COMPANY_INFO } from "@/const";

interface LocationData {
  slug: string;
  name: string;
  regionLabel: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  body: string[];
  nearby: string[];
}

const LOCATIONS: Record<string, LocationData> = {
  henderson: {
    slug: "henderson",
    name: "Henderson",
    regionLabel: "West Auckland",
    title: "Mobile Mechanic Henderson",
    metaTitle: "Mobile Mechanic Henderson | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Henderson, West Auckland. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Professional mobile mechanical services in Henderson — we come to your home or workplace.",
    body: [
      "If you're looking for a reliable mobile mechanic in Henderson, Mobile Autoworks NZ provides workshop-quality diagnostics, servicing and repairs without you needing to drive anywhere.",
      "Whether you're dealing with warning lights, overdue servicing, brake noise, or WOF failure items, we’ll confirm the scope and give clear advice before any major work.",
    ],
    nearby: ["Massey", "Te Atatū", "Glendene", "Ranui", "Swanson", "Lincoln"],
  },
  massey: {
    slug: "massey",
    name: "Massey",
    regionLabel: "West Auckland",
    title: "Mobile Mechanic Massey",
    metaTitle: "Mobile Mechanic Massey | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Massey, West Auckland. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Mobile mechanic services in Massey — fast callouts and clear communication.",
    body: [
      "Mobile Autoworks NZ services Massey with professional mobile diagnostics, servicing and repairs.",
      "We’re set up for on-site work, so you can keep your day moving while we handle your vehicle.",
    ],
    nearby: ["Henderson", "West Harbour", "Hobsonville", "Ranui", "Te Atatū", "Whenuapai"],
  },
  hobsonville: {
    slug: "hobsonville",
    name: "Hobsonville",
    regionLabel: "West Auckland",
    title: "Mobile Mechanic Hobsonville",
    metaTitle: "Mobile Mechanic Hobsonville | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Hobsonville. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Convenient mobile mechanic services in Hobsonville — we come to you.",
    body: [
      "If you’re in Hobsonville and need a mechanic without the workshop hassle, Mobile Autoworks NZ can service and repair your vehicle at your location.",
      "From fault finding and warning lights to brakes and servicing packages, you’ll get a clear explanation and next steps.",
    ],
    nearby: ["West Harbour", "Whenuapai", "Massey", "Greenhithe"],
  },
  "te-atatu": {
    slug: "te-atatu",
    name: "Te Atatū",
    regionLabel: "West Auckland",
    title: "Mobile Mechanic Te Atatū",
    metaTitle: "Mobile Mechanic Te Atatū | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Te Atatū (Peninsula & South). Diagnostics, servicing, brake repairs and WOF remedial work at your home. Call 027 642 1824.",
    intro: "Mobile mechanic services across Te Atatū Peninsula and Te Atatū South.",
    body: [
      "Mobile Autoworks NZ provides professional mobile mechanical services across Te Atatū — ideal for busy households and professionals.",
      "We handle diagnostics, servicing, repairs and WOF remedial work after your official inspection.",
    ],
    nearby: ["Henderson", "Glendene", "Massey", "Avondale"],
  },
  kumeu: {
    slug: "kumeu",
    name: "Kumeu",
    regionLabel: "West Auckland",
    title: "Mobile Mechanic Kumeu",
    metaTitle: "Mobile Mechanic Kumeu | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Kumeu. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Mobile mechanical services in Kumeu — convenient for rural and lifestyle properties.",
    body: [
      "Kumeu and surrounding areas can be a drive to the nearest workshop. Our mobile service brings professional diagnostics and repairs to you.",
      "Contact us with your issue and we’ll confirm scope before any major work.",
    ],
    nearby: ["Huapai", "Riverhead", "Whenuapai", "Hobsonville"],
  },
  albany: {
    slug: "albany",
    name: "Albany",
    regionLabel: "North Shore",
    title: "Mobile Mechanic Albany",
    metaTitle: "Mobile Mechanic Albany | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Albany, North Shore. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Mobile mechanic services in Albany — service your car while you work.",
    body: [
      "Mobile Autoworks NZ services Albany and the North Shore with on-site diagnostics, servicing and repairs.",
      "We can often complete common servicing and repairs at workplaces (with access to the vehicle and a safe work area).",
    ],
    nearby: ["Rosedale", "Glenfield", "Northcote", "Greenhithe"],
  },
  "north-shore": {
    slug: "north-shore",
    name: "North Shore",
    regionLabel: "Auckland",
    title: "Mobile Mechanic North Shore",
    metaTitle: "Mobile Mechanic North Shore Auckland | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic across the North Shore Auckland. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Professional mobile mechanical services across the North Shore.",
    body: [
      "If you’re on the North Shore and want workshop-quality work without losing half a day, Mobile Autoworks NZ can come to you.",
      "We provide diagnostics, servicing packages, brake repairs and WOF remedial repairs after your inspection.",
    ],
    nearby: ["Albany", "Glenfield", "Northcote", "Birkenhead", "Beach Haven"],
  },
  "west-auckland": {
    slug: "west-auckland",
    name: "West Auckland",
    regionLabel: "Auckland",
    title: "Mobile Mechanic West Auckland",
    metaTitle: "Mobile Mechanic West Auckland | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic across West Auckland. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "West Auckland mobile mechanic — fast callouts and transparent advice.",
    body: [
      "Mobile Autoworks NZ is based in West Auckland and services the wider area with on-site diagnostics, servicing and repairs.",
      "Contact us with your issue or book a quote request and we’ll confirm scope and next steps.",
    ],
    nearby: ["Henderson", "Massey", "Te Atatū", "Hobsonville", "Kumeu", "Swanson"],
  },
  takapuna: {
    slug: "takapuna",
    name: "Takapuna",
    regionLabel: "North Shore",
    title: "Mobile Mechanic Takapuna",
    metaTitle: "Mobile Mechanic Takapuna | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Takapuna, North Shore. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Professional mobile mechanic services in Takapuna — we come to your home or workplace.",
    body: [
      "Mobile Autoworks NZ provides convenient mobile mechanical services in Takapuna and surrounding North Shore suburbs.",
      "Whether you need diagnostics for warning lights, routine servicing, or brake repairs, we bring the workshop to you.",
    ],
    nearby: ["Milford", "Devonport", "Northcote", "Birkenhead", "Albany"],
  },
  "ponsonby": {
    slug: "ponsonby",
    name: "Ponsonby",
    regionLabel: "Central Auckland",
    title: "Mobile Mechanic Ponsonby",
    metaTitle: "Mobile Mechanic Ponsonby | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Ponsonby, Central Auckland. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Mobile mechanic services in Ponsonby — convenient car care without leaving your neighbourhood.",
    body: [
      "Parking and traffic in Ponsonby can make getting to a workshop a hassle. Mobile Autoworks NZ comes to you instead.",
      "We provide professional diagnostics, servicing and repairs at your home or workplace in Ponsonby and surrounding areas.",
    ],
    nearby: ["Grey Lynn", "Herne Bay", "Freemans Bay", "Westmere", "Mt Eden"],
  },
  "grey-lynn": {
    slug: "grey-lynn",
    name: "Grey Lynn",
    regionLabel: "Central Auckland",
    title: "Mobile Mechanic Grey Lynn",
    metaTitle: "Mobile Mechanic Grey Lynn | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Grey Lynn, Auckland. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Mobile mechanic services in Grey Lynn — professional car care at your doorstep.",
    body: [
      "Grey Lynn residents can now get workshop-quality mechanical services without leaving home.",
      "Mobile Autoworks NZ offers diagnostics, servicing, brake repairs and WOF remedial work at your location.",
    ],
    nearby: ["Ponsonby", "Westmere", "Kingsland", "Mt Albert", "Sandringham"],
  },
  "mt-eden": {
    slug: "mt-eden",
    name: "Mt Eden",
    regionLabel: "Central Auckland",
    title: "Mobile Mechanic Mt Eden",
    metaTitle: "Mobile Mechanic Mt Eden | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Mt Eden, Auckland. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Mobile mechanic services in Mt Eden — convenient and professional.",
    body: [
      "Mobile Autoworks NZ services Mt Eden with on-site diagnostics, servicing and repairs.",
      "Skip the workshop queue and get your car serviced while you're at home or work.",
    ],
    nearby: ["Epsom", "Newmarket", "Kingsland", "Sandringham", "Greenlane"],
  },
  newmarket: {
    slug: "newmarket",
    name: "Newmarket",
    regionLabel: "Central Auckland",
    title: "Mobile Mechanic Newmarket",
    metaTitle: "Mobile Mechanic Newmarket | Car Service & Repairs | Mobile Autoworks NZ",
    metaDescription: "Mobile mechanic in Newmarket, Auckland. Diagnostics, servicing, brake repairs and WOF remedial work at your home or workplace. Call 027 642 1824.",
    intro: "Mobile mechanic services in Newmarket — we come to your office or home.",
    body: [
      "Working in Newmarket? Mobile Autoworks NZ can service your car while you're at the office.",
      "We provide professional diagnostics, servicing and repairs at your location — no need to take time off.",
    ],
    nearby: ["Epsom", "Remuera", "Parnell", "Mt Eden", "Greenlane"],
  },
};

const SERVICE_LINKS = [
  { title: "Mobile Diagnostics", href: "/services/mobile-diagnostics" },
  { title: "Car Servicing", href: "/services/car-servicing" },
  { title: "Brake Repairs", href: "/services/brake-repairs" },
  { title: "WOF Remedial Repairs", href: "/services/wof-repairs" },
  { title: "Pre-Purchase Inspections", href: "/services/pre-purchase-inspection" },
];

export default function LocationPage() {
  const params = useParams<{ slug: string }>();
  const location = LOCATIONS[params.slug || ""];

  if (!location) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Service Area Not Found</h1>
            <Link href="/areas">
              <Button>View service areas</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Mobile Autoworks NZ",
    "url": `https://www.mobileautoworksnz.com/areas/${location.slug}`,
    "telephone": "+64276421824",
    "email": "chris@mobileautoworksnz.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Auckland",
      "addressRegion": "Auckland",
      "addressCountry": "NZ"
    },
    "areaServed": {
      "@type": "Place",
      "name": location.name
    },
    "description": location.intro
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={location.metaTitle}
        description={location.metaDescription}
        canonical={`https://www.mobileautoworksnz.com/areas/${location.slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-black text-white">
          <div className="container relative py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80">
                <MapPin className="h-4 w-4 text-primary" />
                {location.regionLabel}
              </div>

              <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                {location.title}
              </h1>

              <p className="mt-4 text-xl md:text-2xl font-bold text-primary">
                {location.intro}
              </p>

              <p className="mt-4 text-base md:text-lg text-white/85 max-w-2xl">
                Mobile diagnostics, servicing and repairs at your home or workplace.
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

        <section className="py-16 bg-background">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-4">
              {location.body.map((p, i) => (
                <p key={i} className="text-lg text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular services in {location.name}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Learn more about each service, or request a quote and we’ll confirm scope before any major work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {SERVICE_LINKS.map((s) => (
                <Card key={s.href} className="rounded-[10px] border-2 hover:border-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <Link href={s.href}>
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

        <section className="py-16 bg-background">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Nearby areas</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {location.nearby.map((a) => (
                  <div key={a} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm bg-card">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/areas">
                  <Button variant="outline" size="lg">View full coverage map</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-black text-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to get it sorted?</h2>
              <p className="mt-4 text-lg text-white/70">
                Tell us what’s going on and we’ll confirm scope before any major work.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/quote">
                  <Button size="lg" className="text-lg px-10 bg-accent hover:bg-accent/90 text-white font-bold rounded-none">Quote request</Button>
                </Link>
                <a href="tel:0276421824">
                  <Button size="lg" variant="outline" className="text-lg px-10 border-white/50 text-white hover:bg-white hover:text-black rounded-none">
                    Call {COMPANY_INFO.phone}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

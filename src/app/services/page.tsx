import Link from "next/link";

import { Check, Clock, MapPin, Search, Settings, Shield, Sparkles, Wrench, Zap } from "lucide-react";

export const metadata = {
  title: "Mobile Mechanic Services Auckland | Diagnostics, Pre-Purchase Inspections & Servicing",
  description:
    "Premium mobile mechanic services across Auckland. Fixed-price diagnostics, detailed pre-purchase inspections, and quality servicing at your home or workplace. Book online in minutes.",
  keywords: [
    "mobile mechanic auckland",
    "car diagnostics auckland",
    "pre purchase inspection auckland",
    "mobile car service",
    "vehicle inspection auckland",
    "west auckland mechanic",
  ],
  alternates: {
    canonical: "/services",
  },
};

const SERVICES = [
  {
    intent: "DIAGNOSTICS" as const,
    icon: <Wrench className="w-6 h-6" />,
    title: "Diagnostics (Fixed Price)",
    price: "$140",
    lead:
      "Ideal for warning lights, rough running, no-start issues, or intermittent faults. We use professional scan tools to find the root cause — not guess.",
    bullets: [
      "Full OBD2 scan + clear (where appropriate)",
      "Live data review and fault isolation",
      "Clear explanation of next steps",
      "Written diagnostic notes",
    ],
  },
  {
    intent: "PPI" as const,
    icon: <Search className="w-6 h-6" />,
    title: "Pre-Purchase Inspection",
    price: "$180",
    lead:
      "Buying privately or from a dealer? Get a professional assessment before you commit. Designed to surface costly surprises early.",
    bullets: [
      "100+ point inspection across major systems",
      "Road test (where possible)",
      "Photos of issues and risk items",
      "Clear pass/concern summary",
    ],
    badge: "Most popular",
  },
  {
    intent: "SERVICE" as const,
    icon: <Settings className="w-6 h-6" />,
    title: "Servicing & Maintenance",
    price: "From $149",
    lead:
      "On-site servicing that keeps your car reliable and protects resale value. We tailor the service level to your vehicle and usage.",
    bullets: [
      "Oil + filter options",
      "Safety checks and consumables review",
      "Service light resets (where supported)",
      "Maintenance plan guidance",
    ],
  },
];

const FAQS = [
  {
    q: "What areas do you cover?",
    a: "We service Auckland. Most bookings are in West Auckland, North Shore, and Central. If you’re unsure, request an instant quote and we’ll confirm coverage.",
  },
  {
    q: "Do you do WOF inspections?",
    a: "No — we do WOF remedial repairs only (fixing faults identified by the official inspection).",
  },
  {
    q: "How fast can I book?",
    a: "You can select a time slot and pay online to secure the booking. The checkout confirms instantly.",
  },
  {
    q: "Is pricing fixed?",
    a: "Diagnostics and inspections are fixed-price. For servicing/repairs, you’ll receive a quote based on your vehicle and requirements.",
  },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col pb-24">
      <section className="container pt-12 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80">
              <Sparkles className="h-4 w-4 text-primary" />
              Premium mobile mechanic services — Auckland
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Services & pricing that feel
              <span className="text-primary"> effortless</span>.
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-2xl leading-relaxed">
              Choose the service you need, get a clear price, and secure a time slot online. We come to your home or workplace —
              no workshop drop-offs, no waiting rooms.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/instant-quote"
                className="no-underline inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primaryText font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Get instant quote
              </Link>
              <Link
                href="/book"
                className="no-underline inline-flex items-center justify-center px-8 py-4 rounded-xl border border-border bg-surface hover:bg-surface2 text-text font-bold text-lg transition-colors"
              >
                Book a time slot
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-4 text-sm">
              <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Shield className="w-4 h-4 text-primary" />
                  Fully insured
                </div>
                <div className="mt-1 text-white/70">Professional, accountable work.</div>
              </div>
              <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Clock className="w-4 h-4 text-primary" />
                  Fast turnaround
                </div>
                <div className="mt-1 text-white/70">Clear next steps, same-day where possible.</div>
              </div>
              <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-primary" />
                  No surprises
                </div>
                <div className="mt-1 text-white/70">Transparent scope and pricing.</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[22px] border border-border bg-surface p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted">How booking works</div>
                  <div className="mt-2 text-2xl font-bold">3 steps. Fully online.</div>
                </div>
                <div className="rounded-xl bg-primary/15 border border-primary/30 p-3 text-primary">
                  <Zap className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                {[{
                  n: "01",
                  t: "Choose a service",
                  d: "Diagnostics, inspection, or servicing — we’ll guide you to the right fit.",
                }, {
                  n: "02",
                  t: "Confirm vehicle + location",
                  d: "We price accurately and plan the job properly.",
                }, {
                  n: "03",
                  t: "Secure your time slot",
                  d: "Pay online via Stripe to lock in the appointment.",
                }].map((s) => (
                  <div key={s.n} className="flex gap-4 rounded-[14px] border border-white/10 bg-white/5 p-4">
                    <div className="font-mono text-primary font-bold">{s.n}</div>
                    <div>
                      <div className="font-semibold">{s.t}</div>
                      <div className="mt-1 text-white/70">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[14px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin className="w-4 h-4 text-primary" />
                  Mobile across Auckland
                </div>
                <div className="mt-1 text-white/70">
                  West Auckland, North Shore, Central — and beyond depending on the job.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mt-16" id="services">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Choose your service</h2>
          <p className="mt-3 text-muted text-lg">
            Tap into clear pricing and professional diagnostics. Book online to secure your spot.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.intent} className="relative rounded-[22px] border border-border bg-surface p-8 shadow-xl">
              {s.badge && (
                <div className="absolute right-5 top-5 rounded-full bg-primary text-primaryText text-xs font-bold uppercase tracking-widest px-3 py-1">
                  {s.badge}
                </div>
              )}

              <div className="inline-flex items-center justify-center rounded-xl bg-primary/15 border border-primary/30 p-3 text-primary">
                {s.icon}
              </div>

              <div className="mt-5">
                <h3 className="text-2xl font-bold">{s.title}</h3>
                <div className="mt-2 text-primary font-bold text-2xl">{s.price}</div>
                <p className="mt-3 text-muted leading-relaxed">{s.lead}</p>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span className="text-white/80">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={`/instant-quote?intent=${s.intent}`}
                  className="no-underline inline-flex w-full items-center justify-center h-12 rounded-xl bg-primary text-primaryText font-bold hover:bg-primary/90 transition-colors"
                >
                  Get price & availability
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mt-16">
        <div className="rounded-[26px] border border-white/10 bg-white/5 p-8 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted">What you get</div>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold">Dealer-level clarity. Mobile convenience.</h2>
              <p className="mt-4 text-muted text-lg leading-relaxed">
                You’re not just paying for time — you’re paying for certainty. We document what we find, explain it in plain
                language, and tell you what matters now vs later.
              </p>
            </div>

            <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: <Wrench className="w-5 h-5" />,
                  title: "Root-cause diagnostics",
                  desc: "We don’t guess. We test and confirm.",
                },
                {
                  icon: <Shield className="w-5 h-5" />,
                  title: "Workmanship you can trust",
                  desc: "Fully insured and transparent scope.",
                },
                {
                  icon: <Clock className="w-5 h-5" />,
                  title: "Time-saving mobile service",
                  desc: "Home or workplace — you stay productive.",
                },
                {
                  icon: <MapPin className="w-5 h-5" />,
                  title: "Auckland coverage",
                  desc: "West, North Shore, Central and beyond.",
                },
              ].map((f) => (
                <div key={f.title} className="rounded-[18px] border border-white/10 bg-black/30 p-5">
                  <div className="inline-flex items-center justify-center rounded-xl bg-primary/15 border border-primary/30 p-2 text-primary">
                    {f.icon}
                  </div>
                  <div className="mt-4 font-semibold">{f.title}</div>
                  <div className="mt-1 text-sm text-white/70">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mt-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted">FAQ</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">Common questions</h2>
            <p className="mt-4 text-muted text-lg">
              Quick answers so you can book with confidence.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-[18px] border border-border bg-surface p-6">
                <div className="font-semibold">{f.q}</div>
                <div className="mt-2 text-sm text-white/70 leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mt-16">
        <div className="rounded-[28px] bg-primary p-10 lg:p-16 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primaryText">
              Ready when you are
            </div>
            <h2 className="mt-6 text-4xl lg:text-6xl font-bold text-primaryText tracking-tight">
              Secure a booking in minutes.
            </h2>
            <p className="mt-4 text-primaryText/80 text-lg font-medium">
              Get an instant quote for your vehicle and lock in a time slot online.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/instant-quote"
                className="no-underline inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-bg text-text font-bold text-xl hover:scale-[1.02] transition-transform shadow-2xl"
              >
                Start instant quote
              </Link>
              <Link
                href="/contact"
                className="no-underline inline-flex items-center justify-center px-10 py-5 rounded-2xl border border-black/25 text-primaryText font-bold text-xl hover:bg-black/10 transition-colors"
              >
                Ask a question
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


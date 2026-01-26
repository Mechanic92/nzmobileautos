/**
 * SEO-Optimized Pre-Purchase Inspection Auckland Page
 * Target keywords: pre purchase car inspection auckland, vehicle inspection before buying, used car check auckland
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { 
  CheckCircle2, 
  Phone, 
  Clock, 
  MapPin, 
  FileText, 
  AlertTriangle,
  Car,
  Shield,
  Star,
  ChevronRight,
  ArrowRight,
  ClipboardCheck,
  Eye,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '../../Header';
import Footer from '../../Footer';

// JSON-LD Structured Data
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://mobileautoworksnz.com/#business",
      "name": "Mobile Autoworks NZ",
      "description": "Professional mobile mechanic services in Auckland. We come to you for pre-purchase vehicle inspections, car diagnostics, and repairs.",
      "url": "https://mobileautoworksnz.com",
      "telephone": "+64-27-642-1824",
      "email": "chris@mobileautoworksnz.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Auckland",
        "addressRegion": "Auckland",
        "addressCountry": "NZ"
      },
      "areaServed": [
        { "@type": "City", "name": "Auckland" },
        { "@type": "City", "name": "West Auckland" },
        { "@type": "City", "name": "North Shore" }
      ],
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "17:00"
        }
      ],
      "priceRange": "$180-$500"
    },
    {
      "@type": "Service",
      "@id": "https://mobileautoworksnz.com/pre-purchase-inspection-auckland#service",
      "name": "Pre-Purchase Car Inspection Auckland",
      "description": "Comprehensive mobile pre-purchase vehicle inspection service in Auckland. We inspect used cars at the seller's location before you buy, checking mechanical condition, safety, and identifying hidden problems.",
      "provider": { "@id": "https://mobileautoworksnz.com/#business" },
      "areaServed": { "@type": "City", "name": "Auckland" },
      "serviceType": "Pre-Purchase Vehicle Inspection",
      "offers": {
        "@type": "Offer",
        "price": "180",
        "priceCurrency": "NZD",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does a pre-purchase car inspection cost in Auckland?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our pre-purchase inspection costs $180 NZD. This includes a comprehensive mechanical inspection, road test, diagnostic scan, and a detailed written report. We come to wherever the vehicle is located in Auckland."
          }
        },
        {
          "@type": "Question",
          "name": "What does a pre-purchase inspection include?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our inspection covers over 100 checkpoints including: engine condition, transmission, brakes, suspension, steering, electrical systems, body condition, rust check, fluid levels, tyre condition, and a diagnostic scan. You receive a detailed report with photos."
          }
        },
        {
          "@type": "Question",
          "name": "Can you inspect a car at the seller's location?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! We're a mobile service so we come to wherever the vehicle is located - whether that's a private seller's home, a car dealership, or a car yard. We cover all of Auckland."
          }
        },
        {
          "@type": "Question",
          "name": "How long does a pre-purchase inspection take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A thorough pre-purchase inspection typically takes 90-120 minutes. This includes a visual inspection, mechanical checks, road test, and diagnostic scan. We don't rush - we want to find any issues before you buy."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mobileautoworksnz.com" },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://mobileautoworksnz.com/services" },
        { "@type": "ListItem", "position": 3, "name": "Pre-Purchase Inspection Auckland", "item": "https://mobileautoworksnz.com/pre-purchase-inspection-auckland" }
      ]
    }
  ]
};

export default function PrePurchaseInspectionAuckland() {
  return (
    <>
      <Helmet>
        <title>Pre-Purchase Car Inspection Auckland | $180 | Mobile Autoworks NZ</title>
        <meta name="description" content="Professional pre-purchase vehicle inspection in Auckland. We come to the seller's location to inspect used cars before you buy. $180 includes full report. Book online today." />
        <meta name="keywords" content="pre purchase car inspection auckland, vehicle inspection before buying, used car check auckland, mobile car inspection, pre purchase inspection nz" />
        <link rel="canonical" href="https://mobileautoworksnz.com/pre-purchase-inspection-auckland" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Pre-Purchase Car Inspection Auckland | $180 | Mobile Autoworks NZ" />
        <meta property="og:description" content="Don't buy a lemon! Professional mobile pre-purchase inspection service. We check used cars at the seller's location. Book online, pay securely." />
        <meta property="og:url" content="https://mobileautoworksnz.com/pre-purchase-inspection-auckland" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_NZ" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Header />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-green-200 mb-6">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/services" className="hover:text-white">Services</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Pre-Purchase Inspection</span>
              </nav>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Pre-Purchase Car Inspection Auckland
              </h1>
              
              <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl">
                Don't buy a lemon. Our comprehensive mobile inspection service checks used cars at the seller's location, giving you peace of mind before you commit to buying.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>$180 Full Inspection</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  <span>Detailed Report</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span>We Come to You</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-6">
                    Book Inspection – $180
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href="tel:0276421824">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                    <Phone className="mr-2 w-5 h-5" />
                    027 642 1824
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* What We Check */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                What Our Pre-Purchase Inspection Covers
              </h2>
              <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Our comprehensive 100+ point inspection leaves no stone unturned. We check everything that matters so you can buy with confidence.
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: Car, title: "Engine & Transmission", desc: "Compression, leaks, noises, fluid condition, gear changes" },
                  { icon: Shield, title: "Brakes & Safety", desc: "Pad thickness, rotor condition, brake lines, handbrake" },
                  { icon: Gauge, title: "Suspension & Steering", desc: "Shocks, bushings, ball joints, wheel bearings, alignment" },
                  { icon: Eye, title: "Body & Rust Check", desc: "Panel condition, accident damage, rust, paint quality" },
                  { icon: AlertTriangle, title: "Electrical Systems", desc: "Battery, alternator, lights, sensors, warning lights" },
                  { icon: ClipboardCheck, title: "Road Test", desc: "Driving assessment, noise check, performance evaluation" },
                ].map((item, i) => (
                  <Card key={i} className="border-2 hover:border-green-200 transition-colors">
                    <CardContent className="pt-6">
                      <item.icon className="w-10 h-10 text-green-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Get an Inspection */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Why You Need a Pre-Purchase Inspection
              </h2>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-red-600">Without an Inspection</h3>
                  <ul className="space-y-3">
                    {[
                      "Hidden mechanical problems",
                      "Undisclosed accident damage",
                      "Expensive repairs after purchase",
                      "Safety issues you can't see",
                      "Overpaying for a faulty car",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-green-600">With Our Inspection</h3>
                  <ul className="space-y-3">
                    {[
                      "Know exactly what you're buying",
                      "Negotiate a fair price",
                      "Avoid costly surprises",
                      "Buy with confidence",
                      "Professional written report",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-12 bg-blue-50 rounded-xl p-6 text-center">
                <p className="text-lg text-blue-800">
                  <strong>Did you know?</strong> The average cost of unexpected repairs on a used car purchase is over $2,000. 
                  A $180 inspection could save you thousands.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                How Our Pre-Purchase Inspection Works
              </h2>

              <div className="grid gap-8 md:grid-cols-4">
                {[
                  { step: "1", title: "Book Online", desc: "Select your date, pay $180 securely to confirm" },
                  { step: "2", title: "We Visit", desc: "We go to the seller's location to inspect the car" },
                  { step: "3", title: "Full Check", desc: "100+ point inspection plus road test" },
                  { step: "4", title: "Get Report", desc: "Detailed findings with photos sent to you" },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                Pre-Purchase Inspection Service Areas
              </h2>
              <p className="text-lg text-gray-600 text-center mb-12">
                We travel to wherever the vehicle is located across Auckland. Whether it's a private seller, dealership, or car yard – we come to you.
              </p>

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[
                  "West Auckland", "Henderson", "Massey", "Te Atatū",
                  "Hobsonville", "Kumeu", "North Shore", "Takapuna",
                  "Albany", "Browns Bay", "Central Auckland", "Ponsonby",
                  "Grey Lynn", "Mt Eden", "East Auckland", "Howick",
                  "Pakuranga", "Botany", "South Auckland", "Manukau"
                ].map((area, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transparent Pricing
              </h2>
              <div className="bg-white/10 rounded-2xl p-8 mb-8">
                <div className="text-6xl font-bold mb-2">$180</div>
                <div className="text-xl text-green-100 mb-6">Complete Pre-Purchase Inspection</div>
                <ul className="text-left max-w-md mx-auto space-y-3">
                  {[
                    "100+ point mechanical inspection",
                    "Full road test assessment",
                    "Diagnostic scan of all systems",
                    "Detailed written report with photos",
                    "Verbal explanation of findings",
                    "Repair cost estimates if needed",
                    "No travel charges in Auckland",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/booking">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6">
                  Book Your Inspection Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>

              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="cost" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    How much does a pre-purchase car inspection cost in Auckland?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Our pre-purchase inspection costs $180 NZD. This includes a comprehensive mechanical inspection covering 100+ checkpoints, a road test, diagnostic scan, and a detailed written report with photos. We come to wherever the vehicle is located in Auckland at no extra charge.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="includes" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    What does a pre-purchase inspection include?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Our inspection covers: engine condition and compression, transmission operation, brakes and rotors, suspension and steering components, electrical systems and battery, body condition and rust check, fluid levels and condition, tyre wear and condition, interior and exterior assessment, diagnostic scan for fault codes, and a comprehensive road test. You receive a detailed report with photos highlighting any issues found.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="location" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Can you inspect a car at the seller's location?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Yes! We're a fully mobile service, which means we come to wherever the vehicle is located. This could be a private seller's home, a car dealership, a car yard, or even a workplace. We cover all of Auckland and can usually arrange same-day or next-day inspections.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="time" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    How long does a pre-purchase inspection take?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    A thorough pre-purchase inspection typically takes 90-120 minutes. This includes time for a detailed visual inspection, mechanical checks, diagnostic scan, and a road test. We don't rush – our goal is to find any issues before you commit to buying the vehicle.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="report" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    What kind of report do I receive?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    You receive a comprehensive digital report that includes: overall vehicle condition rating, detailed findings for each inspection area, photos of any issues found, estimated repair costs for problems identified, and our professional recommendation on whether to proceed with the purchase. The report is emailed to you and can be shared with others.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="negotiate" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Can I use the report to negotiate the price?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Absolutely! Many of our customers use our inspection reports to negotiate a better price. If we find issues that need repair, the report provides estimated costs that you can use as leverage in negotiations. Even if the car passes with flying colors, you have peace of mind knowing exactly what you're buying.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Buy with Confidence?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Book your pre-purchase inspection today. We'll check the car so you don't have to worry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/booking">
                  <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-lg px-8 py-6">
                    Book Inspection – $180
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href="tel:0276421824">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                    <Phone className="mr-2 w-5 h-5" />
                    Call 027 642 1824
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

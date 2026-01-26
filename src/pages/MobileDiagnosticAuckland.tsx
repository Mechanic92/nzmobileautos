/**
 * SEO-Optimized Mobile Diagnostic Auckland Page
 * Target keywords: mobile mechanic auckland, mobile car diagnostic auckland, car won't start auckland
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { 
  CheckCircle2, 
  Phone, 
  Clock, 
  MapPin, 
  Wrench, 
  AlertTriangle,
  Car,
  Zap,
  Shield,
  Star,
  ChevronRight,
  ArrowRight
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
      "description": "Professional mobile mechanic services in Auckland. We come to you for car diagnostics, repairs, and servicing.",
      "url": "https://mobileautoworksnz.com",
      "telephone": "+64-27-642-1824",
      "email": "chris@mobileautoworksnz.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Auckland",
        "addressRegion": "Auckland",
        "addressCountry": "NZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -36.8509,
        "longitude": 174.7645
      },
      "areaServed": [
        { "@type": "City", "name": "Auckland" },
        { "@type": "City", "name": "West Auckland" },
        { "@type": "City", "name": "North Shore" },
        { "@type": "City", "name": "Henderson" },
        { "@type": "City", "name": "Massey" }
      ],
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "17:00"
        }
      ],
      "priceRange": "$140-$500",
      "image": "https://mobileautoworksnz.com/logo.png",
      "sameAs": [
        "https://www.facebook.com/mobileautoworksnz"
      ]
    },
    {
      "@type": "Service",
      "@id": "https://mobileautoworksnz.com/mobile-diagnostic-auckland#service",
      "name": "Mobile Car Diagnostic Auckland",
      "description": "Professional mobile vehicle diagnostic service in Auckland. We come to your location with professional scan tools to diagnose check engine lights, warning lights, and vehicle faults.",
      "provider": { "@id": "https://mobileautoworksnz.com/#business" },
      "areaServed": { "@type": "City", "name": "Auckland" },
      "serviceType": "Mobile Vehicle Diagnostic",
      "offers": {
        "@type": "Offer",
        "price": "140",
        "priceCurrency": "NZD",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does a mobile car diagnostic cost in Auckland?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our mobile diagnostic service costs $140 NZD, which includes the call-out fee and a comprehensive vehicle scan using professional diagnostic equipment. This flat fee covers travel to your location anywhere in Auckland and a detailed explanation of any faults found."
          }
        },
        {
          "@type": "Question",
          "name": "What areas do you cover for mobile diagnostics in Auckland?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We cover all of Auckland including West Auckland (Henderson, Massey, Te Atatū, Hobsonville, Kumeu), North Shore (Takapuna, Albany, Browns Bay), Central Auckland, East Auckland, and South Auckland. We come to your home, workplace, or wherever your vehicle is located."
          }
        },
        {
          "@type": "Question",
          "name": "How long does a mobile diagnostic take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A typical diagnostic scan takes 60-90 minutes. This includes connecting our professional scan tools, reading all fault codes, performing live data analysis, and providing you with a clear explanation of what's wrong and recommended repairs."
          }
        },
        {
          "@type": "Question",
          "name": "Can you diagnose why my car won't start?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! We specialize in no-start diagnostics. Whether it's a dead battery, faulty starter motor, fuel system issue, or electrical problem, we have the tools and expertise to diagnose the cause on-site and often fix it the same day."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mobileautoworksnz.com" },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://mobileautoworksnz.com/services" },
        { "@type": "ListItem", "position": 3, "name": "Mobile Diagnostic Auckland", "item": "https://mobileautoworksnz.com/mobile-diagnostic-auckland" }
      ]
    }
  ]
};

export default function MobileDiagnosticAuckland() {
  return (
    <>
      <Helmet>
        <title>Mobile Car Diagnostic Auckland | $140 | Same-Day Service | Mobile Autoworks NZ</title>
        <meta name="description" content="Professional mobile car diagnostic service in Auckland. We come to you! $140 flat fee includes call-out. Check engine light? Warning lights? Book online and pay securely." />
        <meta name="keywords" content="mobile mechanic auckland, mobile car diagnostic auckland, car won't start auckland, check engine light auckland, mobile vehicle scan, on-site mechanic auckland" />
        <link rel="canonical" href="https://mobileautoworksnz.com/mobile-diagnostic-auckland" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Mobile Car Diagnostic Auckland | $140 | Mobile Autoworks NZ" />
        <meta property="og:description" content="Professional mobile vehicle diagnostic service. We come to your location in Auckland with professional scan tools. Book online, pay securely." />
        <meta property="og:url" content="https://mobileautoworksnz.com/mobile-diagnostic-auckland" />
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
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/services" className="hover:text-white">Services</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Mobile Diagnostic</span>
              </nav>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Mobile Car Diagnostic Auckland
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl">
                Professional vehicle diagnostics at your location. We come to your home or workplace with industry-leading scan tools to find out exactly what's wrong with your car.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>$140 Flat Fee</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span>Same-Day Available</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span>All Auckland</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button size="lg" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-6">
                    Book Now – Pay $140 Online
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

        {/* What We Diagnose */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                What We Diagnose
              </h2>
              <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Our professional diagnostic equipment can identify issues across all vehicle systems. Here's what we commonly diagnose:
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: AlertTriangle, title: "Check Engine Light", desc: "Identify the exact cause of your check engine warning" },
                  { icon: Car, title: "Car Won't Start", desc: "Battery, starter, fuel, or electrical fault diagnosis" },
                  { icon: Zap, title: "Electrical Issues", desc: "Sensor faults, wiring problems, module failures" },
                  { icon: Wrench, title: "Engine Problems", desc: "Misfires, rough running, loss of power" },
                  { icon: Shield, title: "ABS & Traction", desc: "Brake system warnings and stability control" },
                  { icon: Star, title: "Transmission", desc: "Gear shifting issues and transmission faults" },
                ].map((item, i) => (
                  <Card key={i} className="border-2 hover:border-blue-200 transition-colors">
                    <CardContent className="pt-6">
                      <item.icon className="w-10 h-10 text-blue-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                How Our Mobile Diagnostic Service Works
              </h2>

              <div className="grid gap-8 md:grid-cols-3">
                {[
                  { step: "1", title: "Book Online", desc: "Select your preferred date and time, pay $140 securely online to confirm your booking." },
                  { step: "2", title: "We Come to You", desc: "Our qualified mechanic arrives at your location with professional diagnostic equipment." },
                  { step: "3", title: "Get Answers", desc: "We scan your vehicle, explain the faults found, and provide repair recommendations." },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                Mobile Diagnostic Service Areas in Auckland
              </h2>
              <p className="text-lg text-gray-600 text-center mb-12">
                We provide mobile car diagnostic services across the entire Auckland region. Our mechanic comes to your home, workplace, or wherever your vehicle is located.
              </p>

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[
                  "West Auckland", "Henderson", "Massey", "Te Atatū",
                  "Hobsonville", "Whenuapai", "Kumeu", "Huapai",
                  "North Shore", "Takapuna", "Albany", "Browns Bay",
                  "Central Auckland", "Ponsonby", "Grey Lynn", "Mt Eden",
                  "East Auckland", "Howick", "Pakuranga", "Botany",
                  "South Auckland", "Manukau", "Papakura", "Pukekohe"
                ].map((area, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transparent Pricing – No Hidden Fees
              </h2>
              <div className="bg-white/10 rounded-2xl p-8 mb-8">
                <div className="text-6xl font-bold mb-2">$140</div>
                <div className="text-xl text-blue-100 mb-6">Flat fee – includes call-out</div>
                <ul className="text-left max-w-md mx-auto space-y-3">
                  {[
                    "Professional diagnostic scan",
                    "All fault codes read and explained",
                    "Live data analysis",
                    "Written report of findings",
                    "Repair recommendations",
                    "No travel charges within Auckland",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/booking">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                  Book Your Diagnostic Now
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
                    How much does a mobile car diagnostic cost in Auckland?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Our mobile diagnostic service costs $140 NZD, which includes the call-out fee and a comprehensive vehicle scan using professional diagnostic equipment. This flat fee covers travel to your location anywhere in Auckland and a detailed explanation of any faults found. There are no hidden charges – the price you see is the price you pay.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="areas" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    What areas do you cover for mobile diagnostics in Auckland?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    We cover all of Auckland including West Auckland (Henderson, Massey, Te Atatū, Hobsonville, Kumeu), North Shore (Takapuna, Albany, Browns Bay), Central Auckland, East Auckland, and South Auckland. We come to your home, workplace, or wherever your vehicle is located. For locations outside our core service area, a small travel surcharge may apply.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="time" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    How long does a mobile diagnostic take?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    A typical diagnostic scan takes 60-90 minutes. This includes connecting our professional scan tools, reading all fault codes across all vehicle systems, performing live data analysis where needed, and providing you with a clear explanation of what's wrong and our recommended repairs. Complex issues may take longer to fully diagnose.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="nostart" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Can you diagnose why my car won't start?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Yes! We specialize in no-start diagnostics. Whether it's a dead battery, faulty starter motor, fuel system issue, immobilizer problem, or electrical fault, we have the tools and expertise to diagnose the cause on-site. In many cases, we can fix the issue the same day or arrange for parts and return to complete the repair.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="equipment" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    What diagnostic equipment do you use?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    We use professional-grade diagnostic scan tools that can communicate with all vehicle systems – not just basic code readers. Our equipment can read manufacturer-specific codes, perform bi-directional testing, view live sensor data, and diagnose issues that cheaper tools miss. We invest in quality equipment to provide accurate diagnoses.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="repair" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Can you repair the issue after diagnosing it?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    In many cases, yes! Simple repairs like replacing sensors, spark plugs, or batteries can often be done on the spot. For more complex repairs, we'll provide you with a detailed quote and can schedule a follow-up visit. The diagnostic fee is a standalone service – you're under no obligation to have us complete the repairs.
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
                Ready to Find Out What's Wrong?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Book your mobile diagnostic today. Pay securely online and we'll come to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/booking">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                    Book Online – $140
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

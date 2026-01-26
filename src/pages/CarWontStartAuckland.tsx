/**
 * SEO-Optimized "Car Won't Start" Emergency Page
 * Target keywords: car won't start auckland, car not starting, mobile mechanic emergency
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { 
  CheckCircle2, 
  Phone, 
  Clock, 
  MapPin, 
  Battery,
  AlertTriangle,
  Car,
  Zap,
  Key,
  Fuel,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '../../Header';
import Footer from '../../Footer';

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://mobileautoworksnz.com/#business",
      "name": "Mobile Autoworks NZ",
      "description": "Emergency mobile mechanic service in Auckland. Car won't start? We come to you to diagnose and fix the problem on-site.",
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
      "priceRange": "$140-$300"
    },
    {
      "@type": "Service",
      "@id": "https://mobileautoworksnz.com/car-wont-start-auckland#service",
      "name": "Car Won't Start Diagnostic & Repair Auckland",
      "description": "Emergency mobile service for cars that won't start. We diagnose and fix battery, starter, fuel, and electrical problems on-site at your location in Auckland.",
      "provider": { "@id": "https://mobileautoworksnz.com/#business" },
      "areaServed": { "@type": "City", "name": "Auckland" },
      "serviceType": "Emergency Vehicle Repair",
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
          "name": "Why won't my car start?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The most common reasons a car won't start are: dead or weak battery (especially in cold weather), faulty starter motor, fuel system problems, ignition issues, or electrical faults. Our mobile diagnostic service can identify the exact cause on-site."
          }
        },
        {
          "@type": "Question",
          "name": "How much does it cost to diagnose a car that won't start?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our mobile diagnostic service costs $140 NZD, which includes coming to your location and identifying why your car won't start. If it's a simple fix like a battery replacement, we can often repair it on the spot for an additional parts cost."
          }
        },
        {
          "@type": "Question",
          "name": "Can you fix my car on the spot?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In many cases, yes! Common no-start issues like dead batteries, loose connections, faulty sensors, and starter problems can often be repaired on-site. We carry common parts and tools. For more complex repairs, we'll provide a quote and can arrange follow-up service."
          }
        },
        {
          "@type": "Question",
          "name": "How quickly can you come out?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We aim to respond to emergency call-outs within 2-4 hours during business hours (Mon-Fri 9am-5pm). Same-day service is often available. Call us directly on 027 642 1824 for the fastest response."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mobileautoworksnz.com" },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://mobileautoworksnz.com/services" },
        { "@type": "ListItem", "position": 3, "name": "Car Won't Start Auckland", "item": "https://mobileautoworksnz.com/car-wont-start-auckland" }
      ]
    }
  ]
};

export default function CarWontStartAuckland() {
  return (
    <>
      <Helmet>
        <title>Car Won't Start Auckland | Emergency Mobile Mechanic | $140 Diagnostic</title>
        <meta name="description" content="Car won't start? We come to you in Auckland! Mobile mechanic diagnoses battery, starter, fuel & electrical problems on-site. $140 diagnostic fee. Call 027 642 1824." />
        <meta name="keywords" content="car won't start auckland, car not starting, mobile mechanic emergency auckland, dead battery auckland, starter motor repair, car breakdown service" />
        <link rel="canonical" href="https://mobileautoworksnz.com/car-wont-start-auckland" />
        
        <meta property="og:title" content="Car Won't Start Auckland | Emergency Mobile Mechanic" />
        <meta property="og:description" content="Stranded with a car that won't start? Our mobile mechanic comes to your location in Auckland to diagnose and fix the problem. Call now!" />
        <meta property="og:url" content="https://mobileautoworksnz.com/car-wont-start-auckland" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_NZ" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Header />

      <main className="min-h-screen">
        {/* Hero Section - Emergency Focused */}
        <section className="bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <nav className="flex items-center gap-2 text-sm text-red-200 mb-6">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/services" className="hover:text-white">Services</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Car Won't Start</span>
              </nav>

              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-10 h-10 text-yellow-400" />
                <span className="bg-yellow-400 text-red-900 px-3 py-1 rounded-full text-sm font-bold">
                  EMERGENCY SERVICE
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Car Won't Start in Auckland?
              </h1>
              
              <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-3xl">
                Don't panic. Our mobile mechanic comes to your location to diagnose and fix the problem. 
                Battery dead? Starter issues? We'll get you back on the road.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span>Same-Day Service</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>$140 Diagnostic</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span>We Come to You</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="tel:0276421824">
                  <Button size="lg" className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-red-900 text-lg px-8 py-6 font-bold">
                    <Phone className="mr-2 w-5 h-5" />
                    Call Now: 027 642 1824
                  </Button>
                </a>
                <Link href="/booking">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                    Book Online
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Common Causes */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                Why Won't Your Car Start?
              </h2>
              <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                There are several common reasons why a car won't start. Our mobile diagnostic service identifies the exact cause so we can fix it fast.
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: Battery, title: "Dead Battery", desc: "The #1 cause of no-starts. Batteries fail in cold weather or after 3-5 years. We test and replace on-site.", color: "text-yellow-600" },
                  { icon: Zap, title: "Starter Motor", desc: "Clicking sound when you turn the key? The starter motor may be failing. We diagnose and can often replace same-day.", color: "text-blue-600" },
                  { icon: Key, title: "Ignition Problems", desc: "Faulty ignition switch, worn key, or immobilizer issues can prevent starting. We have the tools to diagnose.", color: "text-purple-600" },
                  { icon: Fuel, title: "Fuel System", desc: "No fuel reaching the engine? Could be fuel pump, filter, or injector issues. We check the complete fuel system.", color: "text-green-600" },
                  { icon: Car, title: "Alternator Failure", desc: "If your battery keeps dying, the alternator may not be charging it. We test charging system output.", color: "text-orange-600" },
                  { icon: AlertTriangle, title: "Electrical Faults", desc: "Corroded connections, blown fuses, or wiring issues can prevent starting. We trace electrical problems.", color: "text-red-600" },
                ].map((item, i) => (
                  <Card key={i} className="border-2 hover:border-red-200 transition-colors">
                    <CardContent className="pt-6">
                      <item.icon className={`w-10 h-10 ${item.color} mb-4`} />
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What to Do */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                What to Do When Your Car Won't Start
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-green-600">✓ Do This</h3>
                  <ul className="space-y-3">
                    {[
                      "Stay calm and ensure you're in a safe location",
                      "Turn off all accessories (lights, radio, AC)",
                      "Try starting again after waiting 30 seconds",
                      "Check if dashboard lights come on",
                      "Listen for clicking or cranking sounds",
                      "Call a mobile mechanic for diagnosis",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-red-600">✗ Avoid This</h3>
                  <ul className="space-y-3">
                    {[
                      "Don't keep cranking – you'll drain the battery",
                      "Don't jump start without checking the cause",
                      "Don't ignore warning signs before breakdown",
                      "Don't leave lights on while waiting",
                      "Don't attempt repairs you're not sure about",
                      "Don't wait – problems often get worse",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                Emergency Service Areas
              </h2>
              <p className="text-lg text-gray-600 text-center mb-12">
                Stranded? We come to you anywhere in Auckland. Home, work, supermarket car park – wherever you are.
              </p>

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[
                  "West Auckland", "Henderson", "Massey", "Te Atatū",
                  "Hobsonville", "Kumeu", "North Shore", "Takapuna",
                  "Albany", "Browns Bay", "Central Auckland", "Ponsonby",
                  "Grey Lynn", "Mt Eden", "Newmarket", "Parnell"
                ].map((area, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-red-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transparent Emergency Pricing
              </h2>
              <div className="bg-white/10 rounded-2xl p-8 mb-8">
                <div className="text-6xl font-bold mb-2">$140</div>
                <div className="text-xl text-red-100 mb-6">Diagnostic Call-Out Fee</div>
                <ul className="text-left max-w-md mx-auto space-y-3">
                  {[
                    "We come to your location",
                    "Full diagnostic scan",
                    "Identify the exact problem",
                    "Provide repair options & quote",
                    "Many repairs done on-site",
                    "Parts extra if needed",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a href="tel:0276421824">
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-6 font-bold">
                  <Phone className="mr-2 w-5 h-5" />
                  Call Now: 027 642 1824
                </Button>
              </a>
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
                <AccordionItem value="why" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Why won't my car start?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    The most common reasons a car won't start are: dead or weak battery (especially in cold weather or after 3-5 years), faulty starter motor (you'll hear clicking), fuel system problems (fuel pump or filter), ignition issues (worn key or faulty switch), or electrical faults (corroded connections, blown fuses). Our mobile diagnostic service identifies the exact cause on-site so we can fix it properly.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cost" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    How much does it cost to diagnose a car that won't start?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Our mobile diagnostic service costs $140 NZD, which includes coming to your location anywhere in Auckland and identifying exactly why your car won't start. If it's a simple fix like a battery replacement or loose connection, we can often repair it on the spot – you just pay for parts. For more complex repairs, we'll provide a detailed quote before proceeding.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="fix" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Can you fix my car on the spot?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    In many cases, yes! Common no-start issues like dead batteries, loose or corroded connections, faulty sensors, and some starter problems can often be repaired on-site. We carry common parts and tools in our service vehicle. For more complex repairs requiring special parts, we'll diagnose the problem, provide a quote, and can arrange follow-up service – often the same day or next day.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="time" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    How quickly can you come out?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    We aim to respond to emergency call-outs within 2-4 hours during business hours (Monday to Friday, 9am-5pm). Same-day service is often available depending on our schedule. For the fastest response, call us directly on 027 642 1824 rather than booking online. Weekend appointments are available by arrangement.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="battery" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Should I try jump-starting my car?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Jump-starting can work if you have a flat battery, but it's not always the right solution. If your battery is old or damaged, jump-starting is just a temporary fix and the car may not start again. If the problem isn't the battery (e.g., starter motor or fuel issue), jump-starting won't help and could cause damage. We recommend getting a proper diagnosis to identify and fix the root cause.
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
                Stranded? We're Here to Help
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Don't wait for a tow truck. Our mobile mechanic comes to you, diagnoses the problem, and gets you back on the road.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:0276421824">
                  <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-lg px-8 py-6 font-bold">
                    <Phone className="mr-2 w-5 h-5" />
                    Call 027 642 1824
                  </Button>
                </a>
                <Link href="/booking">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                    Book Online
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

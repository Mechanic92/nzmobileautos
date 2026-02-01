import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact Mobile Autoworks NZ | Book Your Auckland Mechanic",
  description: "Get in touch with Auckland's #1 mobile mechanic. Book car diagnostics, pre-purchase inspections, or ask questions. Serving West Auckland, North Shore, and Central.",
  keywords: ["contact mobile mechanic auckland", "book car inspection auckland", "mobile autoworks phone number", "mechanic available now auckland"],
};

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-16 pb-24">
      {/* Hero */}
      <section className="container pt-12 lg:pt-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-xl text-muted leading-relaxed">
            Have questions about our services? Ready to book? We're here to help. 
            Choose the quickest way to get started below.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container">
        <div className="grid md:grid-cols-2 gap-6">
          <a
            href="/instant-quote"
            className="group p-8 rounded-2xl bg-primary hover:bg-primary/90 transition-all border border-primary shadow-lg shadow-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primaryText/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6 text-primaryText" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primaryText mb-2">Get Instant Quote</h3>
                <p className="text-primaryText/80 mb-4">
                  Enter your vehicle details and get an instant price estimate in seconds. 
                  Book online and choose your preferred time slot.
                </p>
                <div className="text-primaryText font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                  Start Now →
                </div>
              </div>
            </div>
          </a>

          <a
            href="tel:0276421824"
            className="group p-8 rounded-2xl bg-surface hover:bg-surface2 transition-all border border-border"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Call Us Directly</h3>
                <p className="text-muted mb-4">
                  Prefer to speak with someone? Give us a call and we'll answer any questions 
                  and help you book the right service.
                </p>
                <div className="text-primary font-semibold text-xl">
                  027 642 1824
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Contact Info */}
      <section className="container">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <p className="text-muted leading-relaxed">
                We're available Monday through Friday to serve all of Auckland. 
                Choose the contact method that works best for you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Phone</div>
                  <a href="tel:0276421824" className="text-muted hover:text-primary transition-colors">
                    027 642 1824
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Email</div>
                  <a href="mailto:chris@mobileautoworks.com" className="text-muted hover:text-primary transition-colors">
                    chris@mobileautoworks.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Service Area</div>
                  <div className="text-muted">
                    All of Auckland<br />
                    Mobile service - we come to you
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Hours</div>
                  <div className="text-muted">
                    Monday - Friday: 9:00 AM - 5:00 PM<br />
                    Saturday - Sunday: Closed<br />
                    <span className="text-xs">Last appointment: 3:30 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border p-8 lg:p-10 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Frequently Asked Questions</h3>
              <p className="text-muted text-sm">Quick answers to common questions</p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">How quickly can you come out?</h4>
                <p className="text-sm text-muted leading-relaxed">
                  We typically have availability within 24-48 hours. For urgent diagnostics, 
                  we often have same-day slots available. Check our instant quote page for 
                  real-time availability.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">What areas do you cover?</h4>
                <p className="text-sm text-muted leading-relaxed">
                  We service all of Auckland with flat-rate call-out fees. From North Shore 
                  to South Auckland, we'll come to your home, workplace, or the seller's location.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Do you provide quotes before starting work?</h4>
                <p className="text-sm text-muted leading-relaxed">
                  Absolutely. Our instant quote system gives you fixed pricing upfront for 
                  diagnostics and pre-purchase inspections. For servicing, we provide detailed 
                  estimates before any work begins.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted leading-relaxed">
                  We accept all major credit cards, debit cards, Apple Pay, Google Pay, and 
                  Afterpay through our secure online booking system.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Can I get a report the same day?</h4>
                <p className="text-sm text-muted leading-relaxed">
                  Yes! All our inspection reports are delivered the same day via email as a 
                  detailed PDF with photos, priority ratings, and clear recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <div className="rounded-[2rem] bg-surface2 p-12 text-center space-y-6 border border-border">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to book your service?
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Get started with an instant quote or give us a call. We're here to make car maintenance easy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="/instant-quote"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primaryText font-bold text-lg hover:bg-primary/90 transition-all"
            >
              Get Instant Quote
            </a>
            <a
              href="tel:0276421824"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-border bg-surface hover:bg-surface2 font-bold text-lg transition-all"
            >
              Call 027 642 1824
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

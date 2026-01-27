import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "./Footer";
import Header from "./Header";
import { Award, CheckCircle, Clock, Heart, MapPin, Phone, Shield, Star, Users, Wrench } from "lucide-react";
import { Link } from "wouter";
import { appPortalUrl } from "@/const";
import Seo from "./Seo";

// Professional mechanic story image
const storyImageUrl = "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&q=80&w=1000";

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Honest & Transparent",
      description:
        "We believe in straightforward communication and honest assessments. No unnecessary work, no hidden fees.",
    },
    {
      icon: Award,
      title: "Quality Workmanship",
      description:
        "Every job is completed to the highest standard using quality parts and proven techniques.",
    },
    {
      icon: Clock,
      title: "Reliable Service",
      description:
        "We respect your time. On-time arrivals, efficient work, and clear timelines you can count on.",
    },
    {
      icon: Heart,
      title: "Customer-Focused",
      description:
        "Your satisfaction is our priority. We go the extra mile to ensure you're completely happy with our service.",
    },
  ];

  const services = [
    "Mobile Diagnostics",
    "WOF Remedial Repairs (post-inspection fixes only)",
    "General Servicing",
    "Brake Repairs",
    "Suspension Work",
    "Pre-Purchase Inspections",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="About Us | Trusted Mobile Mechanic West Auckland"
        description="Learn more about Mobile Autoworks NZ. We are dedicated to providing honest, transparent, and high-quality mobile mechanical services across Auckland."
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary to-secondary text-primary-foreground py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Mobile Autoworks NZ
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90">
                Your trusted mobile mechanic serving West Auckland with professional diagnostics, repairs, and WOF remedial work after inspection.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>Mobile Autoworks NZ</strong> was founded by Chris, a trade-qualified mechanic with a passion for excellence and a vision to redefine automotive service in Auckland. We understand that your time is your most valuable asset, and that taking your vehicle to a traditional workshop is a disruption you don't need.
                  </p>
                  <p>
                    Chris brings over 15 years of hands-on experience across the automotive spectrum—from prestige European cars and everyday family vehicles to heavy-duty 4x4s and commercial fleets. Unlike many mobile services, Chris invests in the same high-end diagnostic technology used by main dealers, ensuring we find the root cause of issues, not just the symptoms.
                  </p>
                  <p>
                    Today, Mobile Autoworks is the go-to choice for West Auckland professionals who demand the highest standards of workmanship and the ultimate convenience of on-site service. Every job Chris performs is backed by a commitment to total transparency—meaning you'll always know exactly what's being done and why.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src={storyImageUrl}
                  alt="Mobile mechanic service"
                  className="rounded-lg shadow-xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-2 hover:border-accent transition-colors">
                  <CardContent className="pt-6">
                    <value.icon className="h-12 w-12 text-accent mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <Wrench className="h-16 w-16 text-accent mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                What We Do
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We bring the workshop to you. From routine servicing to complex diagnostics and repairs, our fully-equipped mobile service means you don't have to disrupt your day.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="p-4 bg-card border rounded-lg hover:border-accent transition-colors"
                  >
                    <span className="font-medium">{service}</span>
                  </div>
                ))}
              </div>
              <Link href="/services">
                <Button size="lg">View All Services</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <Users className="h-16 w-16 text-accent mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Experienced & Qualified
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our team brings years of hands-on experience working with all vehicle makes and models. We stay current with the latest automotive technology and diagnostic techniques to provide you with expert service every time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-accent mb-2">10+</div>
                    <p className="text-muted-foreground">Years Experience</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-accent mb-2">500+</div>
                    <p className="text-muted-foreground">Happy Customers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-accent mb-2">100%</div>
                    <p className="text-muted-foreground">Satisfaction Rate</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Get in touch today for professional mobile mechanical services you can trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <a>
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Get a Quote
                  </Button>
                </a>
              </Link>
              <a href="tel:0276421824">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Call 027 642 1824
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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Footer from "./Footer";
import Header from "./Header";
import { CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Seo from "./Seo";

export default function Quote() {
  const formspreeEndpoint = (import.meta as any).env?.VITE_FORMSPREE_QUOTE_ENDPOINT as string | undefined;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    registration: "",
    descriptionOfWork: "",
    locationSuburb: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const description = params.get("description");
    const service = params.get("service");

    if (description || service) {
      setFormData(prev => ({
        ...prev,
        descriptionOfWork: description || (service ? `Requesting quote for: ${service}` : "")
      }));
    }
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Use internal API instead of Formspree for better control and custom formatting
      const res = await fetch("/api/quote-email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          customerName: formData.name,
          email: formData.email,
          phone: formData.phone,
          vehicleRego: formData.registration,
          vehicleMake: formData.vehicleMake,
          vehicleModel: formData.vehicleModel,
          vehicleYear: formData.vehicleYear,
          serviceType: "Quote Request",
          suburb: formData.locationSuburb,
          message: formData.descriptionOfWork,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit quote request");
      setSubmitted(true);
      toast.success("Thanks — your quote request has been sent. We’ll be in touch shortly.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit quote request");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Seo
          title="Quote Request | Mobile Mechanic Auckland"
          description="Request a quote from a mobile mechanic in Auckland. Quote requests are reviewed and we’ll respond shortly."
        />
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <Card className="max-w-md mx-auto border-2 border-accent">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Thanks — your quote request has been sent.</h2>
              <p className="text-muted-foreground mb-6">
                We’ll be in touch shortly.
              </p>
              <Button onClick={() => setSubmitted(false)}>
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Quote Request | Mobile Mechanic Auckland"
        description="Quote requests are sent to Mobile Autoworks NZ by email and reviewed manually. No website payments."
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary to-accent text-primary-foreground py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1600712242805-5f78671b24da?auto=format&fit=crop&q=80&w=2000"
              alt="Car engine close up"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container relative text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Quote Request
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Quote requests are reviewed manually. We’ll confirm details and respond by phone or email.
            </p>
            <p className="text-lg mt-4 text-primary-foreground/90">
              Or call us directly: <a href="tel:0276421824" className="font-bold underline hover:text-secondary">027 642 1824</a>
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="py-16 bg-background">
          <div className="container max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Request a Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locationSuburb">Location / suburb</Label>
                      <Input
                        id="locationSuburb"
                        value={formData.locationSuburb}
                        onChange={(e) => setFormData({ ...formData, locationSuburb: e.target.value })}
                        placeholder="e.g., Henderson"
                      />
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Vehicle Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleMake">Make</Label>
                        <Input
                          id="vehicleMake"
                          placeholder="e.g., Toyota"
                          value={formData.vehicleMake}
                          onChange={(e) =>
                            setFormData({ ...formData, vehicleMake: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Model</Label>
                        <Input
                          id="vehicleModel"
                          placeholder="e.g., Corolla"
                          value={formData.vehicleModel}
                          onChange={(e) =>
                            setFormData({ ...formData, vehicleModel: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleYear">Year</Label>
                        <Input
                          id="vehicleYear"
                          type="number"
                          placeholder="e.g., 2018"
                          value={formData.vehicleYear}
                          onChange={(e) =>
                            setFormData({ ...formData, vehicleYear: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registration">Registration</Label>
                      <Input
                        id="registration"
                        value={formData.registration}
                        onChange={(e) => setFormData({ ...formData, registration: e.target.value.toUpperCase() })}
                        placeholder="e.g., ABC123"
                      />
                    </div>
                  </div>

                  {/* Additional Message */}
                  <div className="space-y-2">
                    <Label htmlFor="descriptionOfWork">Description of work</Label>
                    <Textarea
                      id="descriptionOfWork"
                      placeholder="Describe the issue / work required..."
                      rows={4}
                      value={formData.descriptionOfWork}
                      onChange={(e) =>
                        setFormData({ ...formData, descriptionOfWork: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Submit Quote Request"}
                  </Button>

                  <div className="text-xs text-muted-foreground">
                    If the form doesn’t work, email us directly:{" "}
                    <a
                      className="underline"
                      href={`mailto:chris@mobileautoworksnz.com?subject=${encodeURIComponent("Quote request")}`}
                    >
                      chris@mobileautoworksnz.com
                    </a>
                    .
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

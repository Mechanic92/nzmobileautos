import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Car, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "./Header";
import Footer from "./Footer";

const timeSlots = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
];

const serviceTypes = [
  "Mobile Diagnostics",
  "WOF remedial repairs (post-inspection fixes only)",
  "Pre-Purchase Inspection",
  "General Service",
  "Brake Service",
  "Engine Diagnostics",
  "Oil Change",
  "Battery Replacement",
  "Other Repairs",
];

const servicePackages = ["Bronze", "Silver", "Gold"];

export default function BookingCalendar() {
  const [step, setStep] = useState(1);
  const mechanicDeskBookingUrl = (import.meta as any).env?.VITE_MECHANICDESK_BOOKING_URL as string | undefined;
  const mechanicDeskBookingMode = ((import.meta as any).env?.VITE_MECHANICDESK_BOOKING_MODE as string | undefined) ?? "redirect";
  const bookingFlow = (((import.meta as any).env?.VITE_BOOKING_FLOW as string | undefined) ?? "stripe").toLowerCase();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: new Date().getFullYear(),
    vehicleRego: "",
    serviceType: "",
    servicePackage: "",
    appointmentDate: "",
    appointmentTime: "",
    suburb: "",
    address: "",
    notes: "",
  });

  // Stripe redirect handling: api/bookings/create.ts redirects back to /book?payment=success|cancelled
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = (params.get("payment") || "").toLowerCase();

    if (payment === "success") {
      setStep(4);
      toast.success("Payment received. Your booking request is being processed.");
      return;
    }

    if (payment === "cancelled") {
      toast.error("Payment was cancelled. Your booking is not confirmed.");
    }
  }, []);

  // Read URL parameters for guided self-diagnosis/service presets
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    const symptom = params.get("symptom");

    if (service || symptom) {
      setFormData(prev => ({
        ...prev,
        serviceType: service || "Mobile Diagnostics",
        notes: symptom ? `Symptom reported: ${symptom}${prev.notes ? `\n\n${prev.notes}` : ""}` : prev.notes,
      }));
    }
  }, []);

  const vehicleLookupMutation = trpc.vehicle.lookup.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        vehicleMake: data.make,
        vehicleModel: data.model,
        vehicleYear: data.year,
      }));
      toast.success(`Found ${data.year} ${data.make} ${data.model}`);
    },
    onError: (error) => {
      toast.error("Vehicle not found. Please enter details manually.");
    },
  });

  const handleRegoLookup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.vehicleRego) {
      toast.error("Please enter a registration number");
      return;
    }
    vehicleLookupMutation.mutate({ plate: formData.vehicleRego });
  };

  const handleSubmit = async () => {
    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (bookingFlow === "mechanicdesk") {
      if (!mechanicDeskBookingUrl) {
        toast.error("Online bookings are being upgraded. Please call or email to book.");
        return;
      }

      const params = new URLSearchParams({
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        vehicleRego: formData.vehicleRego,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: String(formData.vehicleYear),
        serviceType: formData.serviceType,
        servicePackage: formData.servicePackage,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        suburb: formData.suburb,
        address: formData.address,
        notes: formData.notes,
      });

      const separator = mechanicDeskBookingUrl.includes("?") ? "&" : "?";
      window.location.href = `${mechanicDeskBookingUrl}${separator}${params.toString()}`;
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create booking");
      }

      const data = (await res.json()) as { checkoutUrl?: string };
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      toast.error("Booking created but checkout could not be started. Please contact support.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (mechanicDeskBookingUrl && mechanicDeskBookingMode === "iframe") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container max-w-6xl py-6">
            <div className="w-full min-h-[75vh] md:min-h-[80vh]">
              <iframe
                src={mechanicDeskBookingUrl}
                className="w-full h-[75vh] md:h-[80vh]"
                frameBorder={0}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Book Your Service</h1>
            <p className="text-lg text-muted-foreground">
              Schedule a convenient time for our mobile mechanic to come to you
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {s}
                  </div>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle & Service Details
                </CardTitle>
                <CardDescription>Enter your registration to auto-fill vehicle details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="vehicleRego">Registration Number</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="vehicleRego"
                        value={formData.vehicleRego}
                        onChange={(e) => updateFormData('vehicleRego', e.target.value.toUpperCase())}
                        placeholder="e.g., ABC123"
                        className="max-w-[200px]"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleRegoLookup}
                        disabled={vehicleLookupMutation.isPending}
                      >
                        {vehicleLookupMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Looking up...
                          </>
                        ) : (
                          "Lookup Vehicle"
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="vehicleMake">Vehicle Make *</Label>
                    <Input
                      id="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={(e) => updateFormData('vehicleMake', e.target.value)}
                      placeholder="e.g., Toyota"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleModel">Vehicle Model *</Label>
                    <Input
                      id="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={(e) => updateFormData('vehicleModel', e.target.value)}
                      placeholder="e.g., Camry"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleYear">Year *</Label>
                    <Input
                      id="vehicleYear"
                      type="number"
                      value={formData.vehicleYear}
                      onChange={(e) => updateFormData('vehicleYear', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => updateFormData('serviceType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="servicePackage">Service Package (Optional)</Label>
                  <Select value={formData.servicePackage} onValueChange={(value) => updateFormData('servicePackage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicePackages.map((pkg) => (
                        <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.vehicleMake || !formData.vehicleModel || !formData.serviceType}
                  className="w-full"
                >
                  Continue to Date & Time
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Date & Time
                </CardTitle>
                <CardDescription>Choose when you'd like us to visit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="appointmentDate">Preferred Date *</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => updateFormData('appointmentDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label>Preferred Time Slot *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={formData.appointmentTime === slot ? "default" : "outline"}
                        onClick={() => updateFormData('appointmentTime', slot)}
                        className="justify-start"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.appointmentDate || !formData.appointmentTime}
                    className="flex-1"
                  >
                    Continue to Contact Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Contact & Location
                </CardTitle>
                <CardDescription>Where should we come to service your vehicle?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => updateFormData('customerName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="027 642 1824"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="suburb">Suburb *</Label>
                  <Input
                    id="suburb"
                    value={formData.suburb}
                    onChange={(e) => updateFormData('suburb', e.target.value)}
                    placeholder="e.g., Henderson"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="Street address where we should come"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    placeholder="Any specific concerns or requests?"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.customerName ||
                      !formData.email ||
                      !formData.phone ||
                      !formData.suburb ||
                      !formData.address ||
                      submitting
                    }
                    className="flex-1"
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="text-center">
              <CardContent className="pt-12 pb-12">
                <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for choosing Mobile Autoworks. We'll contact you shortly to confirm your appointment.
                </p>
                <div className="bg-muted p-4 rounded-lg mb-6 text-left">
                  <h3 className="font-semibold mb-2">Booking Summary:</h3>
                  <p><strong>Service:</strong> {formData.serviceType}</p>
                  <p><strong>Vehicle:</strong> {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}</p>
                  <p><strong>Date:</strong> {formData.appointmentDate}</p>
                  <p><strong>Time:</strong> {formData.appointmentTime}</p>
                  <p><strong>Location:</strong> {formData.suburb}</p>
                </div>
                <Button onClick={() => window.location.href = "/"}>Return to Home</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays, startOfToday } from "date-fns";
import { Loader2, Wrench, Search, Settings, Check, ChevronRight, Clock, AlertTriangle } from "lucide-react";

type ServiceMode = "DIAGNOSTICS" | "PPI" | "SERVICE";
type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface VehicleIdentity {
  plate: string;
  vin?: string;
  make: string;
  model: string;
  year: number;
  fuel?: string;
  bodyStyle?: string;
  gvm?: number;
  powerKw?: number;
  classification?: string;
}

interface PricingResult {
  quoteId: string;
  basePrice: number;
  totalIncGst: number;
  durationMinutes: number;
  disclaimers: string[];
  breakdown: { key: string; label: string; amountCents: number }[];
}

interface SlotData {
  start: string;
  end: string;
  available: boolean;
}

const SERVICE_OPTIONS: { mode: ServiceMode; icon: React.ReactNode; title: string; price: string; description: string; details?: string[] }[] = [
  {
    mode: "DIAGNOSTICS",
    icon: <Wrench className="w-8 h-8" />,
    title: "Diagnostics",
    price: "$140",
    description: "Complete fault-finding service with OBD2 scan, live data analysis, and detailed diagnostic report.",
    details: [
      "Full OBD2 fault code scan & clear",
      "Live sensor data analysis",
      "Visual inspection of related systems",
      "Written diagnostic report with recommendations",
      "Up to 1 hour on-site",
    ],
  },
  {
    mode: "PPI",
    icon: <Search className="w-8 h-8" />,
    title: "Pre-Purchase Inspection",
    price: "$180",
    description: "Comprehensive 100+ point inspection before you buy. Know exactly what you're getting.",
    details: [
      "Engine, transmission & drivetrain check",
      "Suspension, steering & brakes inspection",
      "Electrical systems & battery test",
      "Fluid levels & condition check",
      "Body & structural assessment",
      "Road test (where possible)",
      "Detailed PDF report with photos",
    ],
  },
  {
    mode: "SERVICE",
    icon: <Settings className="w-8 h-8" />,
    title: "Service & Maintenance",
    price: "From $149",
    description: "Quality servicing at your location. Choose from three service levels based on your needs.",
    details: [
      "Oil + Filter Change — Fresh oil & quality filter, basic safety check",
      "Basic Service — Oil, filter, top-up fluids, inspect air filter, brakes & tyres",
      "Comprehensive Service — Full safety inspection, air/cabin filter inspection, spark plugs (petrol), brake clean & adjust",
    ],
  },
];

export default function BookingEngine() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomingQuoteId = searchParams.get("quoteId");

  const [step, setStep] = useState<BookingStep>(1);
  const [serviceMode, setServiceMode] = useState<ServiceMode | null>(null);
  const [plateInput, setPlateInput] = useState("");
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleIdentity | null>(null);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [holdCountdown, setHoldCountdown] = useState<number | null>(null);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "", issue: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const goToStep = (s: BookingStep) => {
    setError(null);
    setStep(s);
  };

  const lookupVehicle = async () => {
    const plate = plateInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!plate || plate.length < 2) {
      setVehicleError("Please enter a valid plate number.");
      return;
    }
    setVehicleLoading(true);
    setVehicleError(null);
    try {
      const res = await fetch("/api/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plateOrVin: plate }),
      });
      const data = await res.json();
      if (!res.ok || !data.vehicleIdentity) {
        setVehicleError(data.error || "Vehicle not found. Please check the plate.");
        return;
      }
      const v = data.vehicleIdentity;
      setVehicle({
        plate: v.plate || plate,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        fuel: v.fuel,
        bodyStyle: v.body_style,
        gvm: v.gvm,
        powerKw: v.power_kw,
      });
      goToStep(3);
    } catch {
      setVehicleError("Network error. Please try again.");
    } finally {
      setVehicleLoading(false);
    }
  };

  const fetchPricing = useCallback(async (addOns?: any) => {
    if (!vehicle || !serviceMode) return;
    setPricingLoading(true);
    setError(null);
    try {
      const vehiclePayload = {
        plate: vehicle.plate,
        vin: vehicle.vin || "",
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        fuel: vehicle.fuel || "Unknown",
        body_style: vehicle.bodyStyle || "Unknown",
        gvm: vehicle.gvm || 0,
        power_kw: vehicle.powerKw || 0,
      };
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          vehicleIdentity: vehiclePayload, 
          intent: serviceMode,
          addOns: addOns || pricing?.rawAddOns || {}
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate quote.");
        return;
      }
      if (data.quoteId) {
        setPricing({
          quoteId: data.quoteId,
          basePrice: data.pricingSnapshot?.subtotalCents || 0,
          totalIncGst: (data.totalIncGst || 0) / 100,
          durationMinutes: data.pricingSnapshot?.durationMinutes || 60,
          disclaimers: data.disclaimers || [],
          breakdown: data.pricingSnapshot?.lines || [],
          rawAddOns: data.pricingSnapshot?.addOns || {},
        });
      }
    } catch (e) {
      console.error("Quote fetch error:", e);
      setError("Failed to calculate pricing.");
    } finally {
      setPricingLoading(false);
    }
  }, [vehicle, serviceMode, pricing?.rawAddOns]);

  const updateAddOns = (newAddOns: { engineOilFlush?: boolean; fuelAdditive?: boolean }) => {
    fetchPricing({ ...pricing?.rawAddOns, ...newAddOns });
  };

  useEffect(() => {
    if (step === 3 && vehicle && serviceMode) {
      fetchPricing();
    }
  }, [step, vehicle, serviceMode, fetchPricing]);

  // Load existing quote from URL param (from /instant-quote flow)
  useEffect(() => {
    if (!incomingQuoteId) return;
    
    const loadExistingQuote = async () => {
      setQuoteLoading(true);
      try {
        const res = await fetch(`/api/quote/${incomingQuoteId}`);
        if (!res.ok) {
          setError("Quote not found or expired.");
          return;
        }
        const data = await res.json();
        const snap = data.pricingSnapshot;
        
        // Populate vehicle from snapshot
        if (snap?.vehicleIdentity) {
          const v = snap.vehicleIdentity;
          setVehicle({
            plate: v.plate || "",
            vin: v.vin,
            make: v.make || "Unknown",
            model: v.model || "Unknown",
            year: v.year || 0,
            fuel: v.fuel,
            bodyStyle: v.body_style,
            gvm: v.gvm,
            powerKw: v.power_kw,
          });
        }
        
        // Set service mode from snapshot
        if (snap?.intent) {
          setServiceMode(snap.intent as ServiceMode);
        }
        
        // Set pricing from snapshot
        setPricing({
          quoteId: incomingQuoteId,
          basePrice: snap?.subtotalCents || 0,
          totalIncGst: (snap?.totalIncGstCents || 0) / 100,
          durationMinutes: snap?.durationMinutes || 60,
          disclaimers: snap?.disclaimers || [],
          breakdown: snap?.lines || [],
        });
        
        // Skip to step 4 (time selection)
        setStep(4);
      } catch {
        setError("Failed to load quote.");
      } finally {
        setQuoteLoading(false);
      }
    };
    
    loadExistingQuote();
  }, [incomingQuoteId]);

  const fetchSlots = useCallback(async (date: Date) => {
    setSlotsLoading(true);
    try {
      const duration = pricing?.durationMinutes || 60;
      const res = await fetch(`/api/availability?date=${format(date, "yyyy-MM-dd")}&durationMinutes=${duration}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [pricing?.durationMinutes]);

  useEffect(() => {
    if (step === 4 && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [step, selectedDate, fetchSlots]);

  useEffect(() => {
    if (selectedSlot && holdCountdown === null) {
      setHoldCountdown(15 * 60);
    }
  }, [selectedSlot, holdCountdown]);

  useEffect(() => {
    if (holdCountdown === null || holdCountdown <= 0) return;
    const timer = setInterval(() => {
      setHoldCountdown((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [holdCountdown]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const validateCustomer = () => {
    if (!customer.name.trim()) return "Please enter your name.";
    if (!customer.phone.trim() || customer.phone.replace(/\D/g, "").length < 8) return "Please enter a valid phone number.";
    if (!customer.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(customer.email)) return "Please enter a valid email.";
    if (!customer.address.trim()) return "Please enter your address.";
    return null;
  };

  const submitBooking = async () => {
    const validationError = validateCustomer();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!pricing?.quoteId || !selectedSlot) {
      setError("Missing quote or time slot.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: pricing.quoteId,
          startTime: selectedSlot.start,
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            line1: customer.address,
            suburb: "Auckland",
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Booking failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const generateDateOptions = () => {
    const dates: Date[] = [];
    let d = addDays(new Date(), 1);
    while (dates.length < 14) {
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(new Date(d));
      }
      d = addDays(d, 1);
    }
    return dates;
  };

  // Show loading state when loading quote from URL
  if (quoteLoading) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted">Loading your quote...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="container max-w-3xl py-8 sm:py-12">
        <ProgressIndicator currentStep={step} />

        {error && (
          <div className="mb-6 p-4 rounded-[10px] bg-danger/10 border border-danger/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {step === 1 && (
          <StepContainer title="Select Your Service" subtitle="Choose the service you need. Pricing shown is indicative.">
            <div className="grid gap-4">
              {SERVICE_OPTIONS.map((opt) => (
                <ServiceCard
                  key={opt.mode}
                  {...opt}
                  selected={serviceMode === opt.mode}
                  onSelect={() => {
                    setServiceMode(opt.mode);
                    goToStep(2);
                  }}
                />
              ))}
            </div>
          </StepContainer>
        )}

        {step === 2 && (
          <StepContainer title="Enter Your Vehicle" subtitle="We'll look up your vehicle details automatically.">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Registration Plate</label>
                <input
                  type="text"
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full h-14 bg-surface border border-border rounded-[10px] px-4 text-lg font-mono text-text placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  autoFocus
                />
                {vehicleError && <p className="text-sm text-danger">{vehicleError}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => goToStep(1)} className="flex-1 h-12 rounded-[10px] border border-border text-muted hover:text-text hover:border-primary/50 transition-colors">
                  Back
                </button>
                <button
                  onClick={lookupVehicle}
                  disabled={vehicleLoading}
                  className="flex-1 h-12 rounded-[10px] bg-primary text-primaryText font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {vehicleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Look Up Vehicle <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </StepContainer>
        )}

        {step === 3 && (
          <StepContainer title="Your Quote" subtitle="Based on your vehicle and selected service.">
            <div className="space-y-6">
              {vehicle && (
                <div className="p-4 rounded-[10px] bg-surface border border-border flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                    <div className="text-sm text-muted">{vehicle.plate} · {vehicle.fuel || "Unknown fuel"} · {vehicle.classification || "Standard"}</div>
                  </div>
                </div>
              )}

              {pricingLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : pricing ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-[10px] bg-surface border border-border space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted">Service</div>
                    <div className="text-lg font-semibold">{serviceMode === "DIAGNOSTICS" ? "Diagnostics" : serviceMode === "PPI" ? "Pre-Purchase Inspection" : "Service / Repair"}</div>
                    {pricing.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted">{item.label}</span>
                        <span>${(item.amountCents / 100).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-border" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total (inc GST)</span>
                      <span className="text-primary">${pricing.totalIncGst.toFixed(2)}</span>
                    </div>
                  </div>

                  {pricing.disclaimers.length > 0 && (
                    <div className="p-3 rounded-[10px] bg-surface2 border border-border text-xs text-muted space-y-1">
                      {pricing.disclaimers.map((d, i) => (
                        <p key={i}>• {d}</p>
                      ))}
                    </div>
                  )}

                  {serviceMode === "SERVICE" && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-widest text-muted">Optional Extras</div>
                      <div className="grid gap-3">
                        <label className="flex items-center justify-between p-4 rounded-[10px] bg-surface border border-border cursor-pointer hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={!!pricing.rawAddOns?.engineOilFlush}
                              onChange={(e) => updateAddOns({ engineOilFlush: e.target.checked })}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-bg"
                            />
                            <div>
                              <div className="font-semibold text-sm">Engine Oil Flush</div>
                              <div className="text-xs text-muted">Recommended for high mileage</div>
                            </div>
                          </div>
                          <div className="font-bold text-sm text-primary">+$45.00</div>
                        </label>
                        <label className="flex items-center justify-between p-4 rounded-[10px] bg-surface border border-border cursor-pointer hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={!!pricing.rawAddOns?.fuelAdditive}
                              onChange={(e) => updateAddOns({ fuelAdditive: e.target.checked })}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-bg"
                            />
                            <div>
                              <div className="font-semibold text-sm">Fuel System Additive</div>
                              <div className="text-xs text-muted">Clean injectors & fuel lines</div>
                            </div>
                          </div>
                          <div className="font-bold text-sm text-primary">+$35.00</div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => goToStep(2)} className="flex-1 h-12 rounded-[10px] border border-border text-muted hover:text-text hover:border-primary/50 transition-colors">
                      Back
                    </button>
                    <button onClick={() => goToStep(4)} className="flex-1 h-12 rounded-[10px] bg-primary text-primaryText font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                      Choose Time <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </StepContainer>
        )}

        {step === 4 && (
          <StepContainer title="Select Your Time" subtitle="Mon–Fri, 9am–5pm. Last appointment 3:30pm.">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Date</label>
                <div className="flex flex-wrap gap-2">
                  {generateDateOptions().map((d) => (
                    <button
                      key={d.toISOString()}
                      onClick={() => {
                        setSelectedDate(d);
                        setSelectedSlot(null);
                        setHoldCountdown(null);
                      }}
                      className={`px-3 py-2 rounded-[10px] text-sm font-medium border transition-colors ${
                        selectedDate.toDateString() === d.toDateString()
                          ? "bg-primary text-primaryText border-primary"
                          : "bg-surface border-border hover:border-primary/50"
                      }`}
                    >
                      {format(d, "EEE d")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Available Times</label>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.filter(s => s.available).map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setHoldCountdown(15 * 60);
                        }}
                        className={`h-11 rounded-[10px] text-sm font-medium border transition-colors ${
                          selectedSlot?.start === slot.start
                            ? "bg-primary text-primaryText border-primary"
                            : "bg-surface border-border hover:border-primary/50"
                        }`}
                      >
                        {format(new Date(slot.start), "h:mm aa")}
                      </button>
                    ))}
                    {slots.filter(s => s.available).length === 0 && (
                      <div className="col-span-full py-8 text-center text-muted">No slots available for this date.</div>
                    )}
                  </div>
                )}
              </div>

              {selectedSlot && holdCountdown !== null && (
                <div className="p-3 rounded-[10px] bg-primary/10 border border-primary/30 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <span className="font-semibold">Slot held for {formatCountdown(holdCountdown)}</span>
                    <span className="text-muted"> — complete booking to confirm.</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => goToStep(3)} className="flex-1 h-12 rounded-[10px] border border-border text-muted hover:text-text hover:border-primary/50 transition-colors">
                  Back
                </button>
                <button
                  onClick={() => goToStep(5)}
                  disabled={!selectedSlot}
                  className="flex-1 h-12 rounded-[10px] bg-primary text-primaryText font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </StepContainer>
        )}

        {step === 5 && (
          <StepContainer title="Your Details" subtitle="We'll use these to confirm your booking.">
            <div className="space-y-4">
              <InputField label="Full Name" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} placeholder="John Smith" />
              <InputField label="Phone" value={customer.phone} onChange={(v) => setCustomer({ ...customer, phone: v })} placeholder="027 123 4567" type="tel" />
              <InputField label="Email" value={customer.email} onChange={(v) => setCustomer({ ...customer, email: v })} placeholder="john@example.com" type="email" />
              <InputField label="Address (where we come to you)" value={customer.address} onChange={(v) => setCustomer({ ...customer, address: v })} placeholder="123 Example Street, Ponsonby" />
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted">Issue / Notes (optional)</label>
                <textarea
                  value={customer.issue}
                  onChange={(e) => setCustomer({ ...customer, issue: e.target.value })}
                  placeholder="Describe any symptoms or concerns..."
                  rows={3}
                  className="w-full bg-surface border border-border rounded-[10px] px-4 py-3 text-sm text-text placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => goToStep(4)} className="flex-1 h-12 rounded-[10px] border border-border text-muted hover:text-text hover:border-primary/50 transition-colors">
                  Back
                </button>
                <button onClick={() => goToStep(6)} className="flex-1 h-12 rounded-[10px] bg-primary text-primaryText font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  Review Booking <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </StepContainer>
        )}

        {step === 6 && (
          <StepContainer title="Confirm & Pay" subtitle="Review your booking and complete payment.">
            <div className="space-y-6">
              <div className="p-4 rounded-[10px] bg-surface border border-border space-y-3">
                <SummaryLine label="Service" value={serviceMode === "DIAGNOSTICS" ? "Diagnostics" : serviceMode === "PPI" ? "Pre-Purchase Inspection" : "Service / Repair"} />
                <SummaryLine label="Vehicle" value={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.plate})` : "—"} />
                <SummaryLine label="Date & Time" value={selectedSlot ? format(new Date(selectedSlot.start), "EEE d MMM, h:mm aa") : "—"} />
                <SummaryLine label="Location" value={customer.address || "—"} />
                <SummaryLine label="Contact" value={`${customer.name} · ${customer.phone}`} />
                <div className="h-px bg-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${pricing?.totalIncGst.toFixed(2) || "—"}</span>
                </div>
              </div>

              {holdCountdown !== null && holdCountdown > 0 && (
                <div className="p-3 rounded-[10px] bg-primary/10 border border-primary/30 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm">Complete payment within <strong>{formatCountdown(holdCountdown)}</strong> to secure your slot.</span>
                </div>
              )}

              <div className="text-xs text-muted space-y-1">
                <p>• Payment is processed securely via Stripe.</p>
                <p>• You can cancel or reschedule up to 24 hours before your appointment.</p>
                <p>• Final invoice may vary if additional work is required onsite.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => goToStep(5)} className="flex-1 h-12 rounded-[10px] border border-border text-muted hover:text-text hover:border-primary/50 transition-colors">
                  Back
                </button>
                <button
                  onClick={submitBooking}
                  disabled={submitting}
                  className="flex-1 h-14 rounded-[10px] bg-primary text-primaryText font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Secure Booking"}
                </button>
              </div>

              <div className="text-center text-xs text-muted">
                Card · Apple Pay · Google Pay · Afterpay
              </div>
            </div>
          </StepContainer>
        )}
      </div>
    </div>
  );
}

function ProgressIndicator({ currentStep }: { currentStep: BookingStep }) {
  const steps = [
    { num: 1, label: "Service" },
    { num: 2, label: "Vehicle" },
    { num: 3, label: "Quote" },
    { num: 4, label: "Time" },
    { num: 5, label: "Details" },
    { num: 6, label: "Pay" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border transition-colors ${
                currentStep >= s.num
                  ? "bg-primary text-primaryText border-primary"
                  : "bg-surface border-border text-muted"
              }`}
            >
              {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 sm:w-12 h-px mx-1 ${currentStep > s.num ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {steps.map((s) => (
          <div key={s.num} className={`text-[10px] uppercase tracking-widest ${currentStep >= s.num ? "text-text" : "text-muted"}`}>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContainer({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        <p className="text-muted mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  price,
  description,
  details,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  price: string;
  description: string;
  details?: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-5 rounded-[10px] border text-left transition-all ${
        selected
          ? "bg-surface border-primary shadow-[0_0_0_1px_var(--primary)]"
          : "bg-surface border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-[10px] ${selected ? "bg-primary/20 text-primary" : "bg-surface2 text-muted"}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            <span className="text-primary font-bold whitespace-nowrap">{price}</span>
          </div>
          <p className="text-sm text-muted mt-1">{description}</p>
          {details && details.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {details.map((detail, i) => (
                <li key={i} className="text-xs text-muted flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ChevronRight className={`w-5 h-5 shrink-0 mt-1 ${selected ? "text-primary" : "text-muted"}`} />
      </div>
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 bg-surface border border-border rounded-[10px] px-4 text-sm text-text placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
      />
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

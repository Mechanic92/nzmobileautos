"use client";

/**
 * Instant Quote Page
 * Main conversion page - plate lookup → pricing → booking flow
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

// ============================================
// Types
// ============================================

interface Vehicle {
  plate: string;
  make: string;
  model: string;
  year: number;
  fuel: string;
  cc: number;
}

interface PricingBreakdown {
  serviceType: string;
  serviceName: string;
  basePriceCents: number;
  oilSurchargeCents: number;
  extrasCents: number;
  extras: Array<{ code: string; name: string; priceCents: number }>;
  totalIncGstCents: number;
  durationMinutes: number;
  vehicle: {
    plate: string;
    make: string;
    model: string;
    year: number;
    fuel: string;
    cc: number;
    engineSize: string;
  };
}

interface QuoteResponse {
  success: boolean;
  quoteId?: string;
  pricing?: PricingBreakdown;
  error?: string;
  requiresApproval?: boolean;
}

type Step = "plate" | "service" | "quote";

// ============================================
// Component
// ============================================

export default function InstantQuotePage() {
  const router = useRouter();
  
  const [step, setStep] = useState<Step>("plate");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [plate, setPlate] = useState("");
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [serviceType, setServiceType] = useState<"BASIC" | "COMPREHENSIVE">("BASIC");
  const [extras, setExtras] = useState<string[]>([]);
  
  // Quote state
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  
  // Manual entry state
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualMake, setManualMake] = useState("");
  const [manualModel, setManualModel] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [manualFuel, setManualFuel] = useState<"PETROL" | "DIESEL">("PETROL");
  const [manualCc, setManualCc] = useState("");

  // Honeypot field (hidden)
  const [honeypot, setHoneypot] = useState("");

  // ============================================
  // Handlers
  // ============================================

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handlePlateLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/vehicle/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: plate.toUpperCase(),
          email,
          honeypot,
        }),
      });

      const data = await response.json();

      if (data.success && data.vehicle) {
        setVehicle(data.vehicle);
        setStep("service");
      } else if (data.source === "FALLBACK") {
        setShowManualEntry(true);
        setError(data.error || "Please enter your vehicle details manually.");
      } else {
        setError(data.error || "Failed to lookup vehicle");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/vehicle/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: plate.toUpperCase(),
          make: manualMake,
          model: manualModel,
          year: parseInt(manualYear),
          fuel: manualFuel,
          cc: parseInt(manualCc),
        }),
      });

      const data = await response.json();

      if (data.success && data.vehicle) {
        setVehicle(data.vehicle);
        setShowManualEntry(false);
        setStep("service");
      } else {
        setError(data.error || "Invalid vehicle details");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetQuote = async () => {
    if (!vehicle) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle,
          serviceType,
          extras,
        }),
      });

      const data: QuoteResponse = await response.json();

      if (data.success && data.pricing) {
        setQuoteId(data.quoteId!);
        setPricing(data.pricing);
        setStep("quote");
      } else if (data.requiresApproval) {
        setError(data.error || "This vehicle requires a custom quote. Please call us.");
      } else {
        setError(data.error || "Failed to generate quote");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToBook = () => {
    if (quoteId) {
      router.push(`/book?quote=${quoteId}`);
    }
  };

  const toggleExtra = (code: string) => {
    setExtras((prev) =>
      prev.includes(code) ? prev.filter((e) => e !== code) : [...prev, code]
    );
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-white">
            Mobile Autoworks <span className="text-amber-400">NZ</span>
          </a>
          <a href="tel:+64276421824" className="text-white/80 hover:text-white text-sm">
            027 642 1824
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["plate", "service", "quote"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`step-indicator ${
                  step === s
                    ? "step-active"
                    : ["plate", "service", "quote"].indexOf(step) > i
                    ? "step-complete"
                    : "step-pending"
                }`}
              >
                {["plate", "service", "quote"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    ["plate", "service", "quote"].indexOf(step) > i
                      ? "bg-green-500"
                      : "bg-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Plate Lookup */}
        {step === "plate" && !showManualEntry && (
          <div className="card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Get Your Instant Quote
              </h1>
              <p className="text-gray-600">
                Enter your plate number for accurate pricing
              </p>
            </div>

            <form onSubmit={handlePlateLookup} className="space-y-6">
              {/* Honeypot - hidden from users */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Plate
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="input plate-input"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  We'll send your quote here
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || plate.length < 2 || !email}
                className="btn btn-primary w-full py-4 text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="spinner w-5 h-5 mr-2" />
                    Looking up vehicle...
                  </span>
                ) : (
                  "Get Instant Price"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't know your plate?{" "}
              <button
                onClick={() => setShowManualEntry(true)}
                className="text-amber-600 hover:underline"
              >
                Enter details manually
              </button>
            </p>
          </div>
        )}

        {/* Manual Entry Form */}
        {step === "plate" && showManualEntry && (
          <div className="card p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Enter Vehicle Details
              </h1>
              <p className="text-gray-600">
                We couldn't find your vehicle automatically
              </p>
            </div>

            <form onSubmit={handleManualEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    value={manualMake}
                    onChange={(e) => setManualMake(e.target.value)}
                    placeholder="Toyota"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={manualModel}
                    onChange={(e) => setManualModel(e.target.value)}
                    placeholder="Corolla"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={manualYear}
                    onChange={(e) => setManualYear(e.target.value)}
                    placeholder="2020"
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Size (cc)
                  </label>
                  <input
                    type="number"
                    value={manualCc}
                    onChange={(e) => setManualCc(e.target.value)}
                    placeholder="2000"
                    min="100"
                    max="10000"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setManualFuel("PETROL")}
                    className={`py-3 rounded-lg border-2 font-medium transition-colors ${
                      manualFuel === "PETROL"
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Petrol
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualFuel("DIESEL")}
                    className={`py-3 rounded-lg border-2 font-medium transition-colors ${
                      manualFuel === "DIESEL"
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Diesel
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-4"
              >
                {isLoading ? "Processing..." : "Continue"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowManualEntry(false);
                  setError(null);
                }}
                className="btn btn-outline w-full py-3"
              >
                Back to Plate Lookup
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Service Selection */}
        {step === "service" && vehicle && (
          <div className="card p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Service
              </h1>
              <p className="text-gray-600">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <p className="text-sm text-gray-500">
                {vehicle.fuel} • {vehicle.cc}cc
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Basic Service */}
              <button
                onClick={() => setServiceType("BASIC")}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  serviceType === "BASIC"
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Basic Service</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Oil & filter change, fluid top-up, safety check
                    </p>
                    <p className="text-xs text-gray-500 mt-2">~1 hour</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-xl font-bold text-gray-900">$275</p>
                  </div>
                </div>
              </button>

              {/* Comprehensive Service */}
              <button
                onClick={() => setServiceType("COMPREHENSIVE")}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  serviceType === "COMPREHENSIVE"
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      Comprehensive Service
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Full service including brakes, suspension, detailed inspection
                    </p>
                    <p className="text-xs text-gray-500 mt-2">~2 hours</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-xl font-bold text-gray-900">$385</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Extras */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Add Extras</h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={extras.includes("ENGINE_FLUSH")}
                      onChange={() => toggleExtra("ENGINE_FLUSH")}
                      className="w-4 h-4 text-amber-400 rounded"
                    />
                    <span className="ml-3 text-gray-700">Engine Flush</span>
                  </div>
                  <span className="font-medium">+$49</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={extras.includes("AIR_FRAGRANCE")}
                      onChange={() => toggleExtra("AIR_FRAGRANCE")}
                      className="w-4 h-4 text-amber-400 rounded"
                    />
                    <span className="ml-3 text-gray-700">Air Fragrance</span>
                  </div>
                  <span className="font-medium">+$20</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep("plate")}
                className="btn btn-outline flex-1 py-3"
              >
                Back
              </button>
              <button
                onClick={handleGetQuote}
                disabled={isLoading}
                className="btn btn-primary flex-1 py-3"
              >
                {isLoading ? "Calculating..." : "Get Quote"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Quote Display */}
        {step === "quote" && pricing && (
          <div className="card p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Your Quote</h1>
              <p className="text-gray-600">
                {pricing.vehicle.year} {pricing.vehicle.make} {pricing.vehicle.model}
              </p>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{pricing.serviceName}</span>
                  <span className="font-medium">{formatPrice(pricing.basePriceCents)}</span>
                </div>

                {pricing.oilSurchargeCents > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional Oil</span>
                    <span className="font-medium">{formatPrice(pricing.oilSurchargeCents)}</span>
                  </div>
                )}

                {pricing.extras.map((extra) => (
                  <div key={extra.code} className="flex justify-between">
                    <span className="text-gray-600">{extra.name}</span>
                    <span className="font-medium">{formatPrice(extra.priceCents)}</span>
                  </div>
                ))}

                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total (inc GST)</span>
                  <span className="price-large text-gray-900">
                    {formatPrice(pricing.totalIncGstCents)}
                  </span>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="mb-6 p-4 bg-amber-50 rounded-xl">
              <h4 className="font-medium text-amber-800 mb-2">What's Included</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {pricing.serviceType === "BASIC" ? (
                  <>
                    <li>• Quality synthetic oil (up to 5L)</li>
                    <li>• Oil filter replacement</li>
                    <li>• Fluid level check & top-up</li>
                    <li>• Visual safety inspection</li>
                  </>
                ) : (
                  <>
                    <li>• Quality synthetic oil (up to 5L)</li>
                    <li>• Oil & air filter replacement</li>
                    <li>• Brake inspection & measurement</li>
                    <li>• Suspension & steering check</li>
                    <li>• Full diagnostic scan</li>
                    <li>• Detailed inspection report</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep("service")}
                className="btn btn-outline flex-1 py-3"
              >
                Back
              </button>
              <button
                onClick={handleProceedToBook}
                className="btn btn-primary flex-1 py-3"
              >
                Book Now
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Quote valid for 24 hours • Ref: {quoteId}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-white/60 text-sm">
        <p>Mobile Autoworks NZ • Auckland</p>
        <p className="mt-1">
          <a href="tel:+64276421824" className="hover:text-white">027 642 1824</a>
        </p>
      </footer>
    </div>
  );
}

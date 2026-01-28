"use client";

/**
 * Plate Lookup Form Component
 * Hero section form for instant vehicle lookup and quoting
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  plate: z
    .string()
    .min(1, "Plate is required")
    .max(6, "NZ plates are max 6 characters")
    .regex(/^[A-Za-z0-9]+$/, "Only letters and numbers allowed"),
  phone: z.string().optional(),
  serviceType: z.enum([
    "DIAGNOSTIC",
    "PPI",
    "BRONZE_SERVICE",
    "SILVER_SERVICE",
    "GOLD_SERVICE",
  ]),
});

type FormData = z.infer<typeof formSchema>;

interface VehicleData {
  found: boolean;
  plate: string;
  make?: string;
  model?: string;
  year?: number;
  fuel?: string;
  error?: string;
}

interface QuoteResult {
  success: boolean;
  quoteId?: string;
  vehicleDescription: string;
  serviceName: string;
  totalFormatted: string;
  lineItems: Array<{
    description: string;
    category: string;
    totalCents: number;
  }>;
  warrantyMonths: number;
  warrantyKm: number;
  error?: string;
  requiresManualQuote?: boolean;
}

const SERVICE_OPTIONS = [
  { value: "DIAGNOSTIC", label: "Mobile Diagnostics", price: "$140" },
  { value: "PPI", label: "Pre-Purchase Inspection", price: "$185" },
  { value: "BRONZE_SERVICE", label: "Bronze Service", price: "From $150" },
  { value: "SILVER_SERVICE", label: "Silver Service", price: "From $220" },
  { value: "GOLD_SERVICE", label: "Gold Service", price: "From $320" },
];

export default function PlateLookupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      plate: "",
      phone: "",
      serviceType: "DIAGNOSTIC",
    },
  });

  const handlePlateBlur = async () => {
    const plate = form.getValues("plate").toUpperCase().trim();
    if (!plate || plate.length < 2) return;

    try {
      const response = await fetch(`/api/vehicle/${encodeURIComponent(plate)}`);
      const data = await response.json();
      setVehicle(data);
    } catch (err) {
      console.error("Vehicle lookup failed:", err);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setQuote(null);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          phone: data.phone,
          plate: data.plate.toUpperCase(),
          serviceType: data.serviceType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setQuote(result);
      } else {
        setError(result.error || "Failed to generate quote");
        if (result.requiresManualQuote) {
          setError("This service requires a custom quote. Please call us on 027 642 1824.");
        }
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Quote Result */}
      {quote && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-500">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Your Quote</h3>
            <p className="text-gray-600">{quote.vehicleDescription}</p>
          </div>

          <div className="space-y-3 mb-6">
            {quote.lineItems
              .filter((item) => item.category !== "GST")
              .map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.description}</span>
                  <span className="font-medium">{formatCurrency(item.totalCents)}</span>
                </div>
              ))}
            <div className="border-t pt-3 flex justify-between">
              <span className="text-gray-600">GST (15%)</span>
              <span className="font-medium">
                {formatCurrency(quote.lineItems.find((i) => i.category === "GST")?.totalCents || 0)}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-3xl font-bold text-gray-900">{quote.totalFormatted}</p>
              </div>
              {quote.warrantyMonths > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Warranty</p>
                  <p className="font-medium text-green-600">
                    {quote.warrantyMonths} months / {quote.warrantyKm.toLocaleString()} km
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`/book?quote=${quote.quoteId}`}
              className="w-full flex items-center justify-center px-6 py-3 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Book Now
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <button
              type="button"
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                setQuote(null);
                setVehicle(null);
              }}
            >
              Get Another Quote
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Quote valid for 7 days. Quote ID: {quote.quoteId}
          </p>
        </div>
      )}

      {/* Form */}
      {!quote && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Get an Instant Quote</h2>
            <p className="text-gray-600">Enter your plate number for accurate pricing</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Plate Input */}
            <div>
              <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-1">Registration Plate *</label>
              <div className="relative">
                <input
                  id="plate"
                  placeholder="ABC123"
                  className="w-full text-center text-2xl font-bold uppercase tracking-widest h-14 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                  {...form.register("plate")}
                  onBlur={handlePlateBlur}
                />
                {vehicle?.found && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-green-500 text-sm">✓</span>
                  </div>
                )}
              </div>
              {form.formState.errors.plate && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.plate.message}</p>
              )}
              {vehicle?.found && (
                <p className="text-sm text-green-600 mt-1">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              )}
              {vehicle && !vehicle.found && (
                <p className="text-sm text-amber-600 mt-1">
                  Vehicle not found - we'll confirm details with you
                </p>
              )}
            </div>

            {/* Service Type */}
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">Service Required *</label>
              <select
                id="serviceType"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent bg-white"
                {...form.register("serviceType")}
              >
                {SERVICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                id="phone"
                type="tel"
                placeholder="027 123 4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                {...form.register("phone")}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center px-6 py-4 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting Quote...
                </>
              ) : (
                <>
                  Get Instant Quote
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            No payment required. Quote is valid for 7 days.
          </p>
        </form>
      )}
    </div>
  );
}

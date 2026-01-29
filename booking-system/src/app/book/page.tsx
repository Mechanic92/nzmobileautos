"use client";

/**
 * Booking Page
 * Slot selection → Customer details → Payment
 */

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ============================================
// Types
// ============================================

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface DayAvailability {
  date: string;
  dayOfWeek: string;
  isWorkingDay: boolean;
  slots: TimeSlot[];
}

interface Quote {
  id: string;
  plate: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  serviceType: string;
  pricing: {
    serviceName: string;
    totalIncGstCents: number;
    durationMinutes: number;
  };
}

type Step = "slot" | "details" | "payment";

// ============================================
// Component
// ============================================

export default function BookPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteId = searchParams.get("quote");

  const [step, setStep] = useState<Step>("slot");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quote data
  const [quote, setQuote] = useState<Quote | null>(null);

  // Availability data
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");

  // Booking state
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);

  // ============================================
  // Effects
  // ============================================

  useEffect(() => {
    if (!quoteId) {
      router.push("/instant-quote");
      return;
    }

    loadQuoteAndAvailability();
  }, [quoteId]);

  // ============================================
  // Data Loading
  // ============================================

  const loadQuoteAndAvailability = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load quote
      const quoteRes = await fetch(`/api/quote/${quoteId}`);
      const quoteData = await quoteRes.json();

      if (!quoteData.success) {
        setError(quoteData.error || "Quote not found");
        return;
      }

      if (quoteData.quote.isExpired) {
        setError("This quote has expired. Please get a new quote.");
        return;
      }

      setQuote({
        id: quoteData.quote.id,
        plate: quoteData.quote.plate,
        vehicle: quoteData.quote.vehicle,
        serviceType: quoteData.quote.serviceType,
        pricing: quoteData.quote.pricing,
      });

      // Load availability
      const availRes = await fetch(
        `/api/booking/availability?serviceType=${quoteData.quote.serviceType}`
      );
      const availData = await availRes.json();

      if (availData.success) {
        setAvailability(availData.availability);
      }
    } catch (err) {
      setError("Failed to load booking data");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Handlers
  // ============================================

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-NZ", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleProceedToDetails = () => {
    if (selectedDate && selectedTime) {
      setStep("details");
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId,
          customerName,
          customerEmail,
          customerPhone,
          address,
          suburb,
          slotDate: selectedDate,
          slotTime: selectedTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingId(data.bookingId);
        setHoldExpiresAt(new Date(data.holdExpiresAt));
        setStep("payment");
      } else {
        setError(data.error || "Failed to create booking");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!bookingId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (data.success && data.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.sessionUrl;
      } else {
        setError(data.error || "Failed to create payment session");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Render
  // ============================================

  if (isLoading && !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to Load</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/instant-quote" className="btn btn-primary px-6 py-3">
            Get New Quote
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-gray-900">
            Mobile Autoworks <span className="text-amber-500">NZ</span>
          </a>
          <a href="tel:+64276421824" className="text-gray-600 hover:text-gray-900 text-sm">
            027 642 1824
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["slot", "details", "payment"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`step-indicator ${
                  step === s
                    ? "step-active"
                    : ["slot", "details", "payment"].indexOf(step) > i
                    ? "step-complete"
                    : "step-pending"
                }`}
              >
                {["slot", "details", "payment"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    ["slot", "details", "payment"].indexOf(step) > i
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Quote Summary */}
        {quote && (
          <div className="bg-white rounded-xl border p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {quote.vehicle.year} {quote.vehicle.make} {quote.vehicle.model}
              </p>
              <p className="text-sm text-gray-600">
                {quote.pricing.serviceName} • {quote.plate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(quote.pricing.totalIncGstCents)}
              </p>
              <p className="text-xs text-gray-500">inc GST</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Slot Selection */}
        {step === "slot" && (
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Your Time
            </h1>
            <p className="text-gray-600 mb-6">
              Select a date and time that works for you
            </p>

            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Available Dates</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availability
                  .filter((day) => day.isWorkingDay && day.slots.some((s) => s.available))
                  .slice(0, 10)
                  .map((day) => (
                    <button
                      key={day.date}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setSelectedTime(null);
                      }}
                      className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 text-center transition-all ${
                        selectedDate === day.date
                          ? "border-amber-400 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="text-xs text-gray-500">{day.dayOfWeek}</p>
                      <p className="font-medium">{formatDate(day.date)}</p>
                    </button>
                  ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Available Times</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availability
                    .find((d) => d.date === selectedDate)
                    ?.slots.map((slot) => (
                      <button
                        key={slot.startTime}
                        onClick={() => slot.available && handleSlotSelect(selectedDate, slot.startTime)}
                        disabled={!slot.available}
                        className={`slot-btn ${
                          selectedTime === slot.startTime
                            ? "slot-btn-selected"
                            : slot.available
                            ? "slot-btn-available"
                            : "slot-btn-unavailable"
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Weekend Notice */}
            <div className="mb-6 p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> We service Monday to Friday, 9am–5pm. 
                Weekend enquiries welcome – call us to discuss.
              </p>
            </div>

            <button
              onClick={handleProceedToDetails}
              disabled={!selectedDate || !selectedTime}
              className="btn btn-primary w-full py-4"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Customer Details */}
        {step === "details" && (
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your Details
            </h1>
            <p className="text-gray-600 mb-6">
              Where should we come?
            </p>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Smith"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="027 123 4567"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suburb
                </label>
                <input
                  type="text"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  placeholder="Takapuna"
                  className="input"
                  required
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep("slot")}
                  className="btn btn-outline flex-1 py-3"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex-1 py-3"
                >
                  {isLoading ? "Processing..." : "Continue to Payment"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === "payment" && (
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Secure Payment
              </h1>
              <p className="text-gray-600">
                Your slot is held for 15 minutes
              </p>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{suburb}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">
                    {quote && formatPrice(quote.pricing.totalIncGstCents)}
                  </span>
                </div>
              </div>
            </div>

            {/* Hold Timer */}
            {holdExpiresAt && (
              <div className="mb-6 p-3 bg-amber-50 rounded-lg text-center">
                <p className="text-sm text-amber-800">
                  Complete payment to confirm your booking
                </p>
              </div>
            )}

            {/* Payment Methods */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 text-center mb-4">
                Pay securely with
              </p>
              <div className="flex justify-center gap-4">
                <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                  💳 Card
                </div>
                <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                  Afterpay
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={isLoading}
              className="btn btn-primary w-full py-4 text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="spinner w-5 h-5 mr-2" />
                  Redirecting...
                </span>
              ) : (
                `Pay ${quote && formatPrice(quote.pricing.totalIncGstCents)}`
              )}
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              Secure payment powered by Stripe
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

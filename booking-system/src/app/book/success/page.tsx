"use client";

/**
 * Payment Success Page
 * Shown after successful Stripe checkout
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface BookingDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  startTime: string;
  address: string;
  suburb: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    plate: string;
  };
  pricing: {
    serviceName: string;
    totalIncGstCents: number;
  };
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadBookingDetails();
    }
  }, [sessionId]);

  const loadBookingDetails = async () => {
    try {
      // In production, verify session and load booking
      // For now, show generic success
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-NZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your booking. We've sent a confirmation email with all the details.
          </p>

          {/* What's Next */}
          <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
            <h2 className="font-bold text-gray-900 mb-4">What happens next?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span className="text-gray-700">
                  Check your email for the confirmation with your booking details
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span className="text-gray-700">
                  We'll arrive at your location at the scheduled time
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span className="text-gray-700">
                  Have your keys ready and ensure the vehicle is accessible
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">
              Questions about your booking?
            </p>
            <a
              href="tel:+64276421824"
              className="text-lg font-bold text-amber-600 hover:text-amber-700"
            >
              027 642 1824
            </a>
          </div>

          {/* Back to Home */}
          <a
            href="/"
            className="btn btn-outline w-full py-3 mt-6"
          >
            Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}

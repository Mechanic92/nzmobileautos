"use client";

/**
 * Payment Cancelled Page
 * Shown when user cancels Stripe checkout
 */

import { useSearchParams } from "next/navigation";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          {/* Warning Icon */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 mb-8">
            Your booking has not been confirmed. Your time slot is still held for a few more minutes.
          </p>

          <div className="space-y-4">
            {bookingId && (
              <a
                href={`/book?quote=${bookingId}`}
                className="btn btn-primary w-full py-3"
              >
                Try Again
              </a>
            )}

            <a
              href="/instant-quote"
              className="btn btn-outline w-full py-3"
            >
              Get New Quote
            </a>
          </div>

          {/* Contact */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Having trouble? We're here to help.
            </p>
            <a
              href="tel:+64276421824"
              className="text-amber-600 font-medium hover:text-amber-700"
            >
              027 642 1824
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

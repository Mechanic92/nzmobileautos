"use client";

import { useMemo, useState } from "react";

type QuoteRequestStatus = "NEW" | "CONTACTED" | "BOOKED" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";

type QuoteCategory = "BRAKES" | "WOF_REPAIRS" | "SERVICING" | "OTHER";

type QuoteUrgency = "TODAY" | "THIS_WEEK" | "FLEXIBLE";

type QuoteRow = {
  id: string;
  publicId: string;
  status: QuoteRequestStatus;
  category: QuoteCategory;
  urgency: QuoteUrgency;
  createdAt: string;
};

export function QuoteRequestsTable({ initialQuotes }: { initialQuotes: QuoteRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const quotes = useMemo(() => initialQuotes, [initialQuotes]);

  const setStatus = async (id: string, status: QuoteRequestStatus) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/quotes/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update quote status");
      }
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Failed to update quote status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-6 overflow-x-auto border border-white/10 rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/70">
          <tr>
            <th className="text-left p-3">Created</th>
            <th className="text-left p-3">Public</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Urgency</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => {
            const disabled = busyId === q.id;
            return (
              <tr key={q.id} className="border-t border-white/10">
                <td className="p-3 text-white/70">{q.createdAt}</td>
                <td className="p-3">{q.publicId}</td>
                <td className="p-3">{q.status}</td>
                <td className="p-3">{q.category}</td>
                <td className="p-3">{q.urgency}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={disabled}
                      className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-60"
                      onClick={() => setStatus(q.id, "CONTACTED")}
                    >
                      Mark contacted
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      className="px-3 py-1.5 rounded-md border border-white/15 hover:bg-white/5 disabled:opacity-60"
                      onClick={() => setStatus(q.id, "CLOSED")}
                    >
                      Close
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

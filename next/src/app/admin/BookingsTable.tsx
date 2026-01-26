"use client";

import { useMemo, useState } from "react";

type BookingKind = "DIAGNOSTICS";

type BookingStatus = "NEW" | "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "IN_PROGRESS" | "COMPLETED";

type BookingRow = {
  id: string;
  publicId: string;
  kind: BookingKind;
  status: BookingStatus;
  createdAt: string;
  slotStart: string;
};

export function BookingsTable({ initialBookings }: { initialBookings: BookingRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const bookings = useMemo(() => initialBookings, [initialBookings]);

  const setStatus = async (id: string, status: BookingStatus) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/bookings/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update booking status");
      }
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Failed to update booking status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-8 overflow-x-auto border border-white/10 rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/70">
          <tr>
            <th className="text-left p-3">Created</th>
            <th className="text-left p-3">Public</th>
            <th className="text-left p-3">Kind</th>
            <th className="text-left p-3">Slot</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const disabled = busyId === b.id;
            return (
              <tr key={b.id} className="border-t border-white/10">
                <td className="p-3 text-white/70">{b.createdAt}</td>
                <td className="p-3">{b.publicId}</td>
                <td className="p-3">{b.kind}</td>
                <td className="p-3 text-white/70">{b.slotStart}</td>
                <td className="p-3">{b.status}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <a
                      className="px-3 py-1.5 rounded-md border border-white/15 hover:bg-white/5 no-underline"
                      href={`/admin/reports/${b.id}`}
                    >
                      Report
                    </a>
                    <a
                      className="px-3 py-1.5 rounded-md border border-white/15 hover:bg-white/5 no-underline"
                      href={`/admin/reports/ppi/${b.id}`}
                    >
                      PPI
                    </a>
                    <button
                      type="button"
                      disabled={disabled || b.status === "CONFIRMED"}
                      className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-60"
                      onClick={() => setStatus(b.id, "CONFIRMED")}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      disabled={disabled || b.status === "CANCELLED"}
                      className="px-3 py-1.5 rounded-md border border-white/15 hover:bg-white/5 disabled:opacity-60"
                      onClick={() => setStatus(b.id, "CANCELLED")}
                    >
                      Cancel
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

"use client";

import { useMemo, useState } from "react";

type JobStatus = "NEW" | "NEEDS_QUOTE" | "QUOTED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type JobRow = {
  id: string;
  publicId: string;
  status: JobStatus;
  title: string;
  createdAt: string;
  scheduledStart: string | null;
};

const columns: { key: JobStatus; title: string }[] = [
  { key: "NEW", title: "New" },
  { key: "NEEDS_QUOTE", title: "Needs quote" },
  { key: "QUOTED", title: "Quoted" },
  { key: "SCHEDULED", title: "Scheduled" },
  { key: "IN_PROGRESS", title: "In progress" },
  { key: "COMPLETED", title: "Completed" },
  { key: "CANCELLED", title: "Cancelled" },
];

function nextStatus(current: JobStatus): JobStatus | null {
  switch (current) {
    case "NEW":
      return "NEEDS_QUOTE";
    case "NEEDS_QUOTE":
      return "QUOTED";
    case "QUOTED":
      return "SCHEDULED";
    case "SCHEDULED":
      return "IN_PROGRESS";
    case "IN_PROGRESS":
      return "COMPLETED";
    default:
      return null;
  }
}

export function JobsPipeline({ initialJobs }: { initialJobs: JobRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("Auckland");
  const [notes, setNotes] = useState("");

  const jobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialJobs;
    return initialJobs.filter((j) => {
      const hay = `${j.publicId} ${j.title}`.toLowerCase();
      return hay.includes(q);
    });
  }, [initialJobs, query]);

  const grouped = useMemo(() => {
    const map: Record<JobStatus, JobRow[]> = {
      NEW: [],
      NEEDS_QUOTE: [],
      QUOTED: [],
      SCHEDULED: [],
      IN_PROGRESS: [],
      COMPLETED: [],
      CANCELLED: [],
    };
    for (const j of jobs) map[j.status].push(j);
    return map;
  }, [jobs]);

  const setStatus = async (id: string, status: JobStatus) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/jobs/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update job status");
      }
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Failed to update job status");
    } finally {
      setBusyId(null);
    }
  };

  const createJob = async () => {
    if (!title.trim() || !customerName.trim() || !line1.trim() || !suburb.trim() || !city.trim()) {
      alert("Please fill title, customer name, and address.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: "NEW",
          title: title.trim(),
          internalNotes: notes.trim() || null,
          customer: {
            fullName: customerName.trim(),
            phone: phone.trim() || null,
          },
          address: {
            line1: line1.trim(),
            suburb: suburb.trim(),
            city: city.trim(),
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create job");
      }
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Failed to create job");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs (id/title)…"
            className="w-full sm:w-80 rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={creating}
            className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-60 text-sm"
            onClick={createJob}
          >
            {creating ? "Creating…" : "Create job"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-md border border-white/10 p-3">
          <div className="text-sm font-semibold">Quick create</div>
          <div className="mt-3 grid gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job title (e.g. Brake noise)"
              className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm"
            />
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm"
            />
            <input
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="Address line 1"
              className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="Suburb"
                className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm"
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm"
              />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes (optional)"
              className="min-h-[90px] rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {columns.map((col) => {
          const items = grouped[col.key];
          return (
            <div key={col.key} className="rounded-md border border-white/10 overflow-hidden">
              <div className="px-3 py-2 bg-white/5 flex items-center justify-between">
                <div className="text-sm font-semibold">{col.title}</div>
                <div className="text-xs text-white/60">{items.length}</div>
              </div>
              <div className="p-3 space-y-3">
                {items.length === 0 ? (
                  <div className="text-sm text-white/50">No jobs</div>
                ) : (
                  items.map((j) => {
                    const disabled = busyId === j.id;
                    const ns = nextStatus(j.status);
                    return (
                      <div key={j.id} className="rounded-md border border-white/10 bg-black/20 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold">{j.title}</div>
                            <div className="mt-1 text-xs text-white/60">{j.publicId}</div>
                            {j.scheduledStart ? (
                              <div className="mt-1 text-xs text-white/60">Scheduled: {j.scheduledStart}</div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            disabled={disabled}
                            className="px-2 py-1 rounded-md border border-white/15 hover:bg-white/5 text-xs disabled:opacity-60"
                            onClick={() => setStatus(j.id, "CANCELLED")}
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {ns ? (
                            <button
                              type="button"
                              disabled={disabled}
                              className="px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-xs disabled:opacity-60"
                              onClick={() => setStatus(j.id, ns)}
                            >
                              Move to {ns}
                            </button>
                          ) : null}
                          {j.status !== "NEW" ? (
                            <button
                              type="button"
                              disabled={disabled}
                              className="px-2.5 py-1.5 rounded-md border border-white/15 hover:bg-white/5 text-xs disabled:opacity-60"
                              onClick={() => setStatus(j.id, "NEW")}
                            >
                              Back to NEW
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

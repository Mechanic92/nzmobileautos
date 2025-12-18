"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/cn";

const BookingFormSchema = z.object({
  scheduledStartLocal: z.string().min(1),
  address: z.string().min(5),
  vehiclePlate: z.string().min(2),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.coerce.number().int().min(1900).max(2100).optional(),
  vehicleFuel: z.string().optional(),
  odometer: z.string().optional(),
  symptoms: z.string().min(3),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
});

type BookingForm = z.infer<typeof BookingFormSchema>;

export default function BookDiagnosticsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ checkoutUrl: string } | null>(null);

  const defaults: BookingForm = {
    scheduledStartLocal: "",
    address: "",
    vehiclePlate: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: undefined,
    vehicleFuel: "",
    odometer: "",
    symptoms: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  };

  const form = useForm<BookingForm>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: defaults,
  });

  const pricingHint = useMemo(() => {
    return "$120 diagnostics + $75 call-out. Pay now to confirm.";
  }, []);

  const onSubmit = async (values: BookingForm) => {
    setSubmitting(true);
    setCreated(null);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, serviceType: "DIAGNOSTICS" }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create booking");
      }
      const data = (await res.json()) as { checkoutUrl: string };
      setCreated(data);
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      alert(err?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Book diagnostics</h1>
              <p className="mt-2 text-white/70 max-w-2xl">{pricingHint}</p>
            </div>
            <div className="hidden lg:block text-xs text-white/60">
              Secure checkout for diagnostics
              <div className="mt-1">Timezone: Pacific/Auckland</div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">1) Service</h2>
                <div className="text-xs text-white/60">Most bookings take 2–3 minutes</div>
              </div>
              <div className="mt-4">
                <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-3">
                  <div className="text-sm text-white/70">Service</div>
                  <div className="mt-1 text-white font-semibold">Diagnostic Scan & Fault Report (Flat Rate)</div>
                </div>
                <div className="mt-2 text-xs text-white/60">
                  Brakes/WOF repairs will be handled via Quote Request.
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold">2) Appointment details</h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-sm text-white/70">Preferred date/time (NZ)</label>
                  <input
                    className={cn(
                      "mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10",
                      form.formState.errors.scheduledStartLocal ? "border-red-500/60" : "focus:border-brand-yellow/60"
                    )}
                    type="datetime-local"
                    {...form.register("scheduledStartLocal")}
                  />
                  {form.formState.errors.scheduledStartLocal && (
                    <div className="mt-1 text-xs text-red-300">Please choose a date and time.</div>
                  )}
                  <div className="mt-1 text-xs text-white/50">Timezone: Pacific/Auckland</div>
                </div>

                <div>
                  <label className="text-sm text-white/70">Address</label>
                  <input
                    className={cn(
                      "mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10",
                      form.formState.errors.address ? "border-red-500/60" : "focus:border-brand-yellow/60"
                    )}
                    placeholder="Street, suburb, city"
                    {...form.register("address")}
                  />
                  {form.formState.errors.address && (
                    <div className="mt-1 text-xs text-red-300">Please enter the service address.</div>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold">3) Vehicle</h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-sm text-white/70">Rego / Plate</label>
                  <input
                    className={cn(
                      "mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 uppercase tracking-wide",
                      form.formState.errors.vehiclePlate ? "border-red-500/60" : "focus:border-brand-yellow/60"
                    )}
                    placeholder="ABC123"
                    {...form.register("vehiclePlate")}
                  />
                  {form.formState.errors.vehiclePlate && (
                    <div className="mt-1 text-xs text-red-300">Please enter a plate number.</div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Make</label>
                    <input
                      className="mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-brand-yellow/60"
                      {...form.register("vehicleMake")}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Model</label>
                    <input
                      className="mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-brand-yellow/60"
                      {...form.register("vehicleModel")}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Year</label>
                    <input
                      className="mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-brand-yellow/60"
                      type="number"
                      {...form.register("vehicleYear")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Fuel</label>
                    <input
                      className="mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-brand-yellow/60"
                      {...form.register("vehicleFuel")}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Odometer</label>
                    <input
                      className="mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-brand-yellow/60"
                      placeholder="e.g. 145,000 km"
                      {...form.register("odometer")}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold">4) What’s the issue?</h2>
              <div className="mt-4">
                <label className="text-sm text-white/70">Symptoms / notes</label>
                <textarea
                  className={cn(
                    "mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 min-h-28",
                    form.formState.errors.symptoms ? "border-red-500/60" : "focus:border-brand-yellow/60"
                  )}
                  placeholder="Tell us what you’re noticing (warning lights, noises, when it happens, recent work, etc.)"
                  {...form.register("symptoms")}
                />
                {form.formState.errors.symptoms && (
                  <div className="mt-1 text-xs text-red-300">Please enter a short description.</div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold">5) Contact details</h2>
              <div className="mt-4 grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Name</label>
                    <input
                      className={cn(
                        "mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10",
                        form.formState.errors.customerName ? "border-red-500/60" : "focus:border-brand-yellow/60"
                      )}
                      {...form.register("customerName")}
                    />
                    {form.formState.errors.customerName && (
                      <div className="mt-1 text-xs text-red-300">Please enter your name.</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Phone</label>
                    <input
                      className={cn(
                        "mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10",
                        form.formState.errors.customerPhone ? "border-red-500/60" : "focus:border-brand-yellow/60"
                      )}
                      placeholder="e.g. 027 123 4567"
                      {...form.register("customerPhone")}
                    />
                    {form.formState.errors.customerPhone && (
                      <div className="mt-1 text-xs text-red-300">Please enter a phone number.</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/70">Email</label>
                  <input
                    className={cn(
                      "mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10",
                      form.formState.errors.customerEmail ? "border-red-500/60" : "focus:border-brand-yellow/60"
                    )}
                    placeholder="you@example.com"
                    {...form.register("customerEmail")}
                  />
                  {form.formState.errors.customerEmail && (
                    <div className="mt-1 text-xs text-red-300">Please enter a valid email address.</div>
                  )}
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-sm text-white/60">By continuing, you consent to being contacted about your booking.</div>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-3 rounded-lg bg-brand-yellow text-black font-semibold disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Continue to payment"}
              </button>
            </div>

            {created && <div className="text-sm text-white/70">Redirecting…</div>}
          </form>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:sticky lg:top-24">
          <div className="text-sm text-white/70">Summary</div>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="text-white font-semibold">Diagnostics</div>
            <div className="mt-1 text-sm text-white/70">{pricingHint}</div>
          </div>
          <div className="mt-4 text-sm text-white/60">
            After-hours surcharge applies to labour only. We’ll confirm details by phone/text if needed.
          </div>
          <div className="mt-6 text-xs text-white/50">
            Tip: For faster diagnosis, include any warning lights, recent repairs, and when the issue occurs.
          </div>
        </aside>
      </div>
    </div>
  );
}

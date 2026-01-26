"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/cn";
import { useSearchParams } from "next/navigation";

const QuoteCategory = z.enum(["BRAKES", "WOF_REPAIRS", "SERVICING", "OTHER"]);
const QuoteUrgency = z.enum(["TODAY", "THIS_WEEK", "FLEXIBLE"]);

const QuoteFormSchema = z.object({
  category: QuoteCategory,
  urgency: QuoteUrgency,
  address: z.string().min(5),
  vehiclePlate: z.string().min(2),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.coerce.number().int().min(1900).max(2100).optional(),
  description: z.string().min(10),
  symptoms: z.array(z.string()).default([]),
  customerName: z.string().min(2),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(6),
});

type QuoteForm = z.infer<typeof QuoteFormSchema>;

const symptomOptions = [
  "Brake noise / grinding",
  "Vibration when braking",
  "Soft brake pedal",
  "Warning light (ABS)",
  "Overheating",
  "Oil / fluid leak",
  "Car won’t start",
  "Battery keeps going flat",
  "Rough idle / misfire",
  "Loss of power",
  "Suspension noise",
  "WOF failed / needs repairs",
];

export default function QuoteRequestPage() {
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ publicId: string } | null>(null);

  const sp = useSearchParams();
  const presetService = (sp.get("service") || "").trim();
  const presetSymptom = (sp.get("symptom") || "").trim();

  const defaults: QuoteForm = {
    category: "BRAKES",
    urgency: "THIS_WEEK",
    address: "",
    vehiclePlate: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: undefined,
    description: "",
    symptoms: [],
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  };

  const form = useForm<QuoteForm>({
    resolver: zodResolver(QuoteFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    const service = presetService;
    const symptom = presetSymptom;
    if (!service && !symptom) return;

    const s = service.toLowerCase();
    const category: QuoteForm["category"] = s.includes("brake")
      ? "BRAKES"
      : s.includes("wof")
        ? "WOF_REPAIRS"
        : s.includes("service")
          ? "SERVICING"
          : "OTHER";

    form.setValue("category", category, { shouldDirty: true });

    if (symptom) {
      const existing = form.getValues("symptoms") || [];
      if (!existing.includes(symptom)) {
        form.setValue("symptoms", [...existing, symptom], { shouldDirty: true });
      }
    }

    const currentDesc = (form.getValues("description") || "").trim();
    if (!currentDesc) {
      const parts: string[] = [];
      if (service) parts.push(`Service requested: ${service}`);
      if (symptom) parts.push(`Symptom: ${symptom}`);
      form.setValue("description", parts.join("\n"), { shouldDirty: true });
    }
  }, [form, presetService, presetSymptom]);

  const category = form.watch("category");

  const categoryHint = useMemo(() => {
    if (category === "BRAKES") return "For brakes, photos help a lot (pads/rotors/calipers).";
    if (category === "WOF_REPAIRS") return "If you have a fail sheet, add the details in the description.";
    if (category === "SERVICING") return "Tell us what service you want (basic/standard/comprehensive) and any issues.";
    return "Describe the issue and we’ll confirm scope before quoting.";
  }, [category]);

  const onSubmit = async (values: QuoteForm) => {
    setSubmitting(true);
    setCreated(null);
    try {
      const res = await fetch("/api/quotes/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          customerEmail: (values.customerEmail || "").trim() || null,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit quote request");
      }
      const data = (await res.json()) as { publicId: string };
      setCreated(data);
    } catch (err: any) {
      alert(err?.message || "Failed to submit quote request");
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
              <h1 className="text-3xl font-semibold tracking-tight">Request a quote</h1>
              <p className="mt-2 text-white/70 max-w-2xl">
                Brakes, WOF repairs, servicing, and other work usually needs a quick assessment. Submit details here and
                we’ll confirm scope and pricing before any major work.
              </p>
            </div>
            <div className="hidden lg:block text-xs text-white/60">
              Fast response during business hours
              <div className="mt-1">Auckland mobile mechanic</div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold">1) What do you need?</h2>
                <div className="text-xs text-white/60">No obligation</div>
              </div>
              <div className="mt-4 grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Category</label>
                    <select
                      className={cn("mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-brand-yellow/60")}
                      {...form.register("category")}
                      defaultValue={defaults.category}
                    >
                      <option value="BRAKES">Brakes</option>
                      <option value="WOF_REPAIRS">WOF repairs</option>
                      <option value="SERVICING">Servicing</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <div className="mt-2 text-xs text-white/60">{categoryHint}</div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Urgency</label>
                    <select
                      className={cn("mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-brand-yellow/60")}
                      {...form.register("urgency")}
                      defaultValue={defaults.urgency}
                    >
                      <option value="TODAY">Today</option>
                      <option value="THIS_WEEK">This week</option>
                      <option value="FLEXIBLE">Flexible</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold">2) Location</h2>
              <div className="mt-4">
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

                <details className="rounded-lg border border-white/10 bg-black/30 px-3 py-3">
                  <summary className="cursor-pointer text-sm text-white/80">Optional vehicle details (helps us quote)</summary>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </details>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold">4) Symptoms</h2>
              <div className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {symptomOptions.map((s) => {
                    const selected = form.watch("symptoms");
                    const isChecked = selected?.includes(s);
                    return (
                      <label key={s} className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={Boolean(isChecked)}
                          onChange={(e) => {
                            const current = form.getValues("symptoms") || [];
                            if (e.target.checked) form.setValue("symptoms", Array.from(new Set([...current, s])));
                            else form.setValue("symptoms", current.filter((x) => x !== s));
                          }}
                        />
                        <span className="text-sm text-white/80">{s}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold">5) Details</h2>
              <div className="mt-4">
                <label className="text-sm text-white/70">Describe the problem</label>
                <textarea
                  className={cn(
                    "mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 min-h-28",
                    form.formState.errors.description ? "border-red-500/60" : "focus:border-brand-yellow/60"
                  )}
                  placeholder="What’s happening, when it occurs, any recent repairs, and what you’ve already tried."
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <div className="mt-1 text-xs text-red-300">Please add a little more detail.</div>
                )}
                <div className="mt-2 text-xs text-white/60">
                  Photo upload is next (R2 signed uploads). For now, you can still submit and we’ll request photos by SMS.
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold">6) Contact details</h2>
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
                  <label className="text-sm text-white/70">Email (optional)</label>
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

            {!created && (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-sm text-white/60">By submitting, you consent to being contacted about your request.</div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-3 rounded-lg bg-brand-yellow text-black font-semibold disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit quote request"}
                </button>
              </div>
            )}

            {created && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-500/20">
                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Quote request received</div>
                    <div className="text-sm text-white/70">Reference: {created.publicId}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-white/70">
                  We'll review your request and get back to you shortly with scope and next steps.
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a className="inline-flex px-4 py-2 rounded-lg bg-brand-yellow text-black font-semibold no-underline" href="/">
                    Back to home
                  </a>
                  <a
                    className="inline-flex px-4 py-2 rounded-lg border border-white/15 text-white no-underline hover:bg-white/5"
                    href="/book/diagnostics"
                  >
                    Book diagnostics instead
                  </a>
                </div>
              </div>
            )}
          </form>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:sticky lg:top-24">
          <div className="text-sm text-white/70">How quoting works</div>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
            <div className="text-white font-semibold">We quote after assessment</div>
            <div className="mt-2">
              For mobile work, parts and labour vary by vehicle. We’ll confirm the scope and give a clear quote before any
              major repairs.
            </div>
            <div className="mt-3 text-xs text-white/60">
              Tip: If the vehicle is unsafe to drive, tell us in the description.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Login failed");
      }
      window.location.href = next;
    } catch (err: any) {
      alert(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-semibold">Admin login</h1>
      <p className="mt-2 text-white/70">Sign in to access bookings and quotes.</p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <div>
          <label className="text-sm text-white/70">Email</label>
          <input
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-brand-yellow/60"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Password</label>
          <input
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-brand-yellow/60"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 px-5 py-3 rounded-lg bg-brand-yellow text-black font-semibold disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <a className="text-sm text-white/70 hover:text-white" href="/">
          Back to site
        </a>
      </form>
    </div>
  );
}

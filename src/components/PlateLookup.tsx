"use client";

import { useState } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";

interface PlateLookupProps {
  onResult: (data: any, email: string) => void;
}

export default function PlateLookup({ onResult }: PlateLookupProps) {
  const [plate, setPlate] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plateOrVin: plate.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");

      onResult(data, email.trim());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto sky-gradient p-1 rounded-2xl shadow-xl">
      <div className="bg-black/90 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-bold mb-4 text-white">Get Instant Price</h2>
        
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/50 font-bold">Registration Plate</label>
            <div className="relative">
              <input
                required
                className="w-full h-14 bg-white/5 border border-white/10 rounded-lg px-4 text-2xl font-black text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none uppercase tracking-tighter"
                placeholder="ABC123"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                <Search size={24} className="text-white"/>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/50 font-bold">Email (For Quote)</label>
            <input
              required
              type="email"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-white outline-none focus:border-brand-yellow/50"
              placeholder="chris@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-brand-yellow text-black font-black rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                GET INSTANT PRICE
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          
          <p className="text-[10px] text-white/30 text-center uppercase tracking-tight">
            * 90-day lookup cache active. MotorWeb data strictly for classification.
          </p>
        </form>
      </div>
    </div>
  );
}

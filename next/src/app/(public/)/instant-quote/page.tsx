"use client";

import { useState } from "react";
import PlateLookup from "@/components/PlateLookup";
import { Check, ShieldCheck, Zap, Info, Loader2 } from "lucide-react";
import { generateQuote } from "@/lib/engines/pricing";
import { useRouter } from "next/navigation";

export default function InstantQuotePage() {
  const [result, setResult] = useState<any>(null);
  const [lookerEmail, setLookerEmail] = useState("");

  const handleResult = (data: any, email: string) => {
    setResult(data);
    setLookerEmail(email);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-yellow selection:text-black">
      <div className="container overflow-hidden pt-12 pb-24">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              INSTANT <span className="text-brand-yellow">QUOTES</span>.<br/>ZERO GUESSWORK.
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Identify your vehicle, select your service, and pay online. We handle the rest.
              Powered by MotorWeb mTLS Identity.
            </p>
          </div>

          {!result ? (
            <PlateLookup onResult={handleResult} />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Vehicle Identity Header */}
              <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-brand-yellow font-bold uppercase text-xs tracking-widest">
                    <ShieldCheck size={14} /> Identity Verified
                  </div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    {result.identity.year} {result.identity.make} {result.identity.model}
                  </h2>
                  <div className="text-white/40 font-mono text-sm">{result.identity.plate} • {result.identity.vin}</div>
                </div>
                <div className="flex gap-2">
                  <Badge text={result.classification.fuel_class} />
                  <Badge text={result.classification.body_class} />
                  <Badge text={result.classification.load_class} />
                </div>
              </div>

              {/* Quote Options */}
              <div className="grid md:grid-cols-2 gap-6">
                <ServiceCard 
                   title="Basic Service" 
                   serviceKey="BASIC"
                   result={result}
                   email={lookerEmail}
                   quote={generateQuote('SERVICE', result.classification, 'BASIC')} 
                   features={["Oil & Filter Change", "30-Point Inspection", "Fluid Top Ups", "Service Light Reset"]}
                />
                <ServiceCard 
                   title="Comprehensive" 
                   serviceKey="COMPREHENSIVE"
                   result={result}
                   email={lookerEmail}
                   quote={generateQuote('SERVICE', result.classification, 'COMPREHENSIVE')} 
                   high
                   features={["Full Engine Inspection", "Diagnostic Health Check", "Brake Performance Test", "Filter Replacements"]}
                />
              </div>

              {/* Repair Estimates */}
              <div className="p-8 border border-white/10 rounded-2xl bg-white/5 space-y-6">
                 <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest">
                    <Zap size={14} /> Fixed Price Repairs (Estimates)
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <RepairItem title="Brake Pads" quote={generateQuote('REPAIR', result.classification)} />
                    <RepairItem title="New Battery" quote={generateQuote('REPAIR', result.classification)} />
                    <RepairItem title="Alternator" quote={generateQuote('REPAIR', result.classification)} />
                 </div>
              </div>

              <div className="text-center pt-8">
                <button 
                  onClick={() => setResult(null)}
                  className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4"
                >
                  Clear Result & Lookup Another Plate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div className="px-3 py-1 rounded bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-tighter">
      {text}
    </div>
  );
}

function ServiceCard({ title, serviceKey, result, email, quote, features, high = false }: { title: string, serviceKey: string, result: any, email: string, quote: any, features: string[], high?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleSelect = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        body: JSON.stringify({
          plate: result.identity.plate,
          email: email,
          serviceMode: 'SERVICE',
          serviceKey: serviceKey,
          classification: result.classification
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save quote");
      router.push(`/book?id=${data.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`p-8 rounded-3xl border-2 transition-all group ${high ? 'border-brand-yellow bg-brand-yellow/5' : 'border-white/10 bg-white/2 hover:border-white/30'}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-brand-yellow transition-colors">{title}</h3>
          <div className="text-right">
            <div className="text-4xl font-black leading-none">${quote.total}</div>
            <div className="text-[10px] text-white/40 font-bold uppercase">All Inclusive</div>
          </div>
        </div>

        <ul className="space-y-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/70">
              <Check className="text-brand-yellow" size={16} /> {f}
            </li>
          ))}
        </ul>

        <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-start gap-3">
          <Info size={16} className="text-white/30 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-tight text-white/50 uppercase italic font-bold">
            {quote.disclaimer}
          </p>
        </div>

        <button 
          onClick={handleSelect}
          disabled={busy}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${high ? 'bg-brand-yellow text-black hover:bg-white' : 'bg-white text-black hover:bg-brand-yellow'}`}
        >
          {busy ? <Loader2 className="animate-spin" /> : "Select & Book Slot"}
        </button>
      </div>
    </div>
  );
}

function RepairItem({ title, quote }: { title: string, quote: any }) {
  return (
    <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-2">
       <div className="text-xs font-bold text-white/70">{title}</div>
       <div className="text-lg font-black italic">{quote.estimateRange?.min} - {quote.estimateRange?.max}</div>
       <div className="text-[9px] text-white/30 font-bold uppercase">Est. Range (inc GST)</div>
    </div>
  );
}

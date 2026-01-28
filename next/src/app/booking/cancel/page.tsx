"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";

export default function BookingCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        
        <XCircle className="text-red-500 mx-auto" size={80} />
        
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Payment Cancelled</h1>
          <p className="text-white/70">
            No worries! Your booking hasn't been confirmed and your card hasn't been charged.
          </p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => router.back()}
            className="w-full py-4 bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Try Again
          </button>
          <button 
            onClick={() => router.push('/')}
            className="w-full py-4 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}

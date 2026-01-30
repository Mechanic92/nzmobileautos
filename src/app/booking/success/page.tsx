"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ArrowRight, FileText } from "lucide-react";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // We can poll our own API to see if the webhook has updated the status
      // or just show a generic success message.
      // For high UX, let's wait for CONFIRMED status.
      const timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/booking/status?sessionId=${sessionId}`);
          const data = await res.json();
          if (data.status === 'CONFIRMED') {
            setBooking(data);
            setLoading(false);
            clearInterval(timer);
          }
        } catch (err) {
          console.error("Status check failed");
        }
      }, 2000);

      return () => clearInterval(timer);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="animate-spin mx-auto text-brand-yellow" size={48} />
            <h1 className="text-2xl font-bold">Confirming Payment...</h1>
            <p className="text-white/50 text-sm">Please don't close this window. We are securing your time slot.</p>
          </div>
        ) : (
          <>
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-brand-yellow blur-2xl opacity-20 animate-pulse" />
               <CheckCircle2 className="relative text-brand-yellow mx-auto" size={80} />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Booking Confirmed!</h1>
              <p className="text-white/70">
                Hi {booking?.customer?.fullName}, your mobile service is locked in for:
              </p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                 <div className="text-lg font-bold text-brand-yellow">
                    {new Date(booking?.slotStart).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Pacific/Auckland' })}
                 </div>
                 <div className="text-white/50 font-mono">
                    {new Date(booking?.slotStart).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Pacific/Auckland' })}
                 </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-brand-yellow transition-colors flex items-center justify-center gap-2"
              >
                Back to Website
                <ArrowRight size={18} />
              </button>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">
                Check your email for the confirmation & receipt.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

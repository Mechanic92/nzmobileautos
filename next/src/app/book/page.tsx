"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar"; 
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { Loader2, ArrowRight, MapPin, CalendarDays, Clock, ShieldCheck } from "lucide-react";

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [quoteId, setQuoteId] = useState(searchParams.get("id"));
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ line1: "", suburb: "" });
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Quote Details
  useEffect(() => {
    if (quoteId) {
      fetch(`/api/quote/${quoteId}`)
        .then(res => res.json())
        .then(data => {
           setQuoteDetails(data);
           if (data.customer) {
              setCustomer({
                 name: data.customer.fullName === 'Lead from Quote' ? '' : data.customer.fullName,
                 email: data.customer.email || '',
                 phone: data.customer.phone || '',
              });
           }
        })
        .catch(err => console.error("Failed to load quote"));
    }
  }, [quoteId]);

  // 2. Fetch Slots for selected date
  useEffect(() => {
    if (date) {
      fetchSlots(date);
    }
  }, [date]);

  const fetchSlots = async (selectedDate: Date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?date=${format(selectedDate, "yyyy-MM-dd")}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err) {
      console.error("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !quoteId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/session", {
        method: "POST",
        body: JSON.stringify({
          quoteId,
          startTime: selectedSlot.start,
          customer: {
            ...customer,
            ...address
          }
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!quoteId) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold">Start with a Quote</h1>
        <p className="mt-4">Please get a quote first to see pricing and book.</p>
        <button 
          onClick={() => router.push("/instant-quote")}
          className="mt-6 px-6 py-3 bg-brand-yellow text-black font-bold rounded-lg"
        >
          Get Instant Quote
        </button>
      </div>
    );
  }

  const totalPrice = quoteDetails?.pricingSnapshotJson?.total;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="container max-w-6xl py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column: Calendar & Slots */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Choose Your Slot</h1>
              <p className="text-white/50">Mon-Fri availability. Select a date below to see available times.</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date: Date) => date < startOfToday() || date.getDay() === 0 || date.getDay() === 6}
                className="rounded-md border-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Clock size={14} /> Available Start Times
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="animate-spin text-brand-yellow" />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot, i) => (
                    <button
                      key={i}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-lg text-sm font-bold border transition-all ${
                        selectedSlot?.start === slot.start 
                        ? 'bg-brand-yellow border-brand-yellow text-black shadow-[0_0_15px_rgba(255,200,0,0.3)]' 
                        : slot.available 
                          ? 'bg-white/5 border-white/10 hover:border-white/30 text-white' 
                          : 'bg-white/2 border-transparent text-white/10 cursor-not-allowed'
                      }`}
                    >
                      {format(new Date(slot.start), "h:mm aa")}
                    </button>
                  ))}
                  {slots.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/30 italic">
                      No slots available for this date.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customer Details & Summary */}
          <div className="space-y-8">
            <form onSubmit={handleBooking} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-yellow">
                  <ShieldCheck size={14} /> Secure Booking
                </div>
                <h2 className="text-xl font-bold">Service Details</h2>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                   <Input label="Full Name" placeholder="John Doe" value={customer.name} onChange={(val: string) => setCustomer({...customer, name: val})} />
                   <Input label="Phone Number" placeholder="027..." value={customer.phone} onChange={(val: string) => setCustomer({...customer, phone: val})} />
                </div>
                <Input label="Email Address" type="email" placeholder="john@example.com" value={customer.email} onChange={(val: string) => setCustomer({...customer, email: val})} />
                <Input label="Street Address" placeholder="123 Example Street" value={address.line1} onChange={(val: string) => setAddress({...address, line1: val})} />
                <Input label="Suburb" placeholder="Ponsonby" value={address.suburb} onChange={(val: string) => setAddress({...address, suburb: val})} />
              </div>

              {/* Summary Box */}
              {selectedSlot && (
                <div className="p-6 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl space-y-4">
                   <div className="flex justify-between items-end border-b border-brand-yellow/20 pb-4">
                      <div>
                         <div className="text-[10px] font-bold uppercase tracking-widest text-brand-yellow">Selected Appointment</div>
                         <div className="text-lg font-black">{format(new Date(selectedSlot.start), "EEEE, d MMMM")}</div>
                         <div className="text-sm font-bold text-white/70">{format(new Date(selectedSlot.start), "h:mm aa")} - {format(new Date(selectedSlot.end), "h:mm aa")}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-bold uppercase text-white/40">Hold Active</div>
                         <div className="text-xs font-mono">15m during checkout</div>
                      </div>
                   </div>
                   <div className="flex justify-between items-center text-lg font-black">
                      <span className="uppercase tracking-tighter">Total Due Now</span>
                      <span className="text-brand-yellow">${totalPrice || '...'}</span>
                   </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="w-full h-16 bg-brand-yellow text-black font-black rounded-xl hover:bg-white transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 overflow-hidden relative group"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <div className="flex flex-col items-center">
                       <span className="text-lg">SECURE PAYMENT</span>
                       <span className="text-[10px] tracking-[0.2em] font-bold">Powered by Stripe</span>
                    </div>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 pt-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                  <span className="text-[10px] font-black italic">AFTERPAY AVAILABLE</span>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="text-[10px] font-black italic">APPLE PAY</span>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="text-[10px] font-black italic">GOOGLE PAY</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</label>
      <input
        required
        type={type}
        className="w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-sm text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

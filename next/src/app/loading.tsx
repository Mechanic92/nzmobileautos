import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute h-full w-full animate-pulse rounded-full bg-primary/10" />
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
      <p className="animate-pulse font-medium text-muted">Loading NZ Mobile Autos...</p>
    </div>
  );
}

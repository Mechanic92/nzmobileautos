import * as React from "react";

import { cn } from "@/lib/cn";

export function SummaryRow({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 text-sm", className)}>
      <div className="text-muted">{label}</div>
      <div className="text-text font-semibold text-right">{value}</div>
    </div>
  );
}

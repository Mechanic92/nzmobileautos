import * as React from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "muted" | "success" | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-border bg-surface2 text-text",
  muted: "border-border bg-surface text-muted",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

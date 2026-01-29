import * as React from "react";

import { cn } from "@/lib/cn";

type AlertVariant = "default" | "danger" | "success";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  default: "border-border bg-surface2 text-text",
  success: "border-success/30 bg-success/10 text-text",
  danger: "border-danger/30 bg-danger/10 text-text",
};

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn("rounded-xl border p-4", variantClasses[variant], className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("text-sm font-semibold", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-muted", className)} {...props} />;
}

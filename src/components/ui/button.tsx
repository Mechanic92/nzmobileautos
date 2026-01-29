import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primaryText hover:bg-primary/90 border border-primary/20",
  secondary:
    "bg-transparent text-primary border border-primary/60 hover:border-primary hover:bg-primary/10",
  ghost:
    "bg-transparent text-text border border-transparent hover:bg-white/5 hover:border-border",
  danger:
    "bg-danger text-white hover:bg-danger/90 border border-danger/30",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref
) {
  const sizing =
    size === "lg" ? "py-3 px-5 text-base" : size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm";

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizing,
        className
      )}
      {...props}
    />
  );
});

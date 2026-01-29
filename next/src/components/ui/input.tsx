import * as React from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface2 px-4 text-text placeholder:text-muted/70 outline-none transition-colors focus:border-primary/70 focus:ring-1 focus:ring-primary",
        className
      )}
      {...props}
    />
  );
});

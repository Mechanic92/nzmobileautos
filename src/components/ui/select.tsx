import * as React from "react";

import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, options, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface2 px-4 text-text outline-none transition-colors focus:border-primary/70 focus:ring-1 focus:ring-primary",
        className
      )}
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  );
});

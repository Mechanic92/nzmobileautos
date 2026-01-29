import * as React from "react";

import { cn } from "@/lib/cn";

export type StepperStep = {
  key: string;
  title: string;
};

export function Stepper({
  steps,
  activeKey,
  className,
}: {
  steps: StepperStep[];
  activeKey: string;
  className?: string;
}) {
  const activeIndex = Math.max(0, steps.findIndex((s) => s.key === activeKey));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-3">
        {steps.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div key={step.key} className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  "h-9 w-9 rounded-full border flex items-center justify-center text-sm font-bold",
                  isDone && "bg-primary text-primaryText border-primary/30",
                  isActive && "bg-surface2 text-text border-primary/50",
                  !isDone && !isActive && "bg-surface text-muted border-border"
                )}
              >
                {idx + 1}
              </div>
              <div className="min-w-0">
                <div
                  className={cn(
                    "text-xs font-semibold uppercase tracking-widest truncate",
                    isActive ? "text-text" : isDone ? "text-text" : "text-muted"
                  )}
                >
                  {step.title}
                </div>
              </div>
              {idx !== steps.length - 1 && (
                <div className={cn("h-px flex-1", isDone ? "bg-primary/40" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

const variants = {
  neutral: "border-slate-700 bg-slate-900 text-slate-200",
  positive: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  danger: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  info: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: PropsWithChildren<{
  variant?: keyof typeof variants;
  className?: string;
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

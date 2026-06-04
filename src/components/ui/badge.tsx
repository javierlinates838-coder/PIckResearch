import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

const variants = {
  neutral: "border-violet-200/15 bg-violet-950/40 text-violet-100",
  positive: "border-cyan-300/35 bg-cyan-400/10 text-cyan-100",
  warning: "border-fuchsia-300/35 bg-fuchsia-400/10 text-fuchsia-100",
  danger: "border-rose-300/35 bg-rose-500/10 text-rose-100",
  info: "border-blue-300/35 bg-blue-400/10 text-blue-100",
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

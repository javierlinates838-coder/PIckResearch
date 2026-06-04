import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

const variants = {
  neutral: "border-zinc-500/25 bg-zinc-950/60 text-zinc-100",
  positive: "border-lime-300/40 bg-lime-400/10 text-lime-100",
  warning: "border-orange-300/40 bg-orange-400/10 text-orange-100",
  danger: "border-red-300/40 bg-red-500/10 text-red-100",
  info: "border-yellow-300/35 bg-yellow-400/10 text-yellow-100",
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

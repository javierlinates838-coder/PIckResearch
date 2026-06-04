import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

export const badgeTones = {
  default: "bg-black/5 text-[var(--foreground)] dark:bg-white/10",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  accent: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  muted: "bg-black/5 text-[var(--muted)] dark:bg-white/5",
} as const;

const tones = badgeTones;

export function Badge({
  children,
  tone = "default",
  className,
  ...props
}: PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }
>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

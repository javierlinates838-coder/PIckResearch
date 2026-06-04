import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <section
      className={cn("glass rounded-3xl p-5 shadow-sm", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 space-y-1">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="text-sm text-[var(--muted)]">{description}</p>
      ) : null}
    </div>
  );
}

import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-fuchsia-200/10 bg-[#090b1f]/75 p-5 shadow-2xl shadow-fuchsia-950/20 backdrop-blur",
        className,
      )}
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
    <div className="mb-5 space-y-1">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {description ? <p className="text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}

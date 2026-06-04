import { cn } from "@/lib/utils/cn";

export function Metric({
  label,
  value,
  detail,
  className,
}: {
  label: string;
  value: string | number;
  detail?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-fuchsia-200/10 bg-white/[0.04] p-4 shadow-lg shadow-black/10", className)}>
      <p className="text-xs uppercase tracking-[0.2em] text-violet-200/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-1 text-sm text-cyan-100/65">{detail}</p> : null}
    </div>
  );
}

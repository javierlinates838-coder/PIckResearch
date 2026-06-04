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
    <div className={cn("rounded-2xl border border-orange-200/10 bg-white/[0.04] p-4 shadow-lg shadow-black/20", className)}>
      <p className="text-xs uppercase tracking-[0.2em] text-orange-100/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-1 text-sm text-lime-100/65">{detail}</p> : null}
    </div>
  );
}

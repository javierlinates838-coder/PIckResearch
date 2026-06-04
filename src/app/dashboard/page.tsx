import type { Metadata } from "next";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { supportedSports } from "@/config/sports";
import { getDashboardResearch } from "@/lib/repositories/research";
import { dashboardQuerySchema } from "@/lib/validators/research";

export const metadata: Metadata = {
  title: "Research Dashboard",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = dashboardQuerySchema.safeParse({
    sport: typeof params.sport === "string" ? params.sport : undefined,
  });
  const sport = parsed.success ? parsed.data.sport : undefined;
  const data = await getDashboardResearch({ sport });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Research dashboard
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Live market and data-quality command center
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Track live odds and news when providers are configured, while clearly labeling
            demo-only sections that still need splits, stats, or snapshot ingestion.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/dashboard"
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
          >
            All
          </a>
          {supportedSports.map((item) => (
            <a
              key={item.key}
              href={`/dashboard?sport=${item.key}`}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <DashboardOverview data={data} />
    </div>
  );
}

import type { Metadata } from "next";

import { PickFinderBoard } from "@/components/finder/pick-finder-board";
import { Badge } from "@/components/ui/badge";
import { supportedSports } from "@/config/sports";
import { listPickOpportunities } from "@/lib/repositories/research";
import { finderQuerySchema } from "@/lib/validators/research";

export const metadata: Metadata = {
  title: "Pick Finder",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FinderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = finderQuerySchema.safeParse({
    sport: typeof params.sport === "string" ? params.sport : undefined,
    q: typeof params.q === "string" ? params.q : undefined,
    market: typeof params.market === "string" ? params.market : undefined,
    app: typeof params.app === "string" ? params.app : undefined,
    sort: typeof params.sort === "string" ? params.sort : undefined,
    minHitRate: typeof params.minHitRate === "string" ? params.minHitRate : undefined,
  });
  const filters = parsed.success ? parsed.data : { sort: "edge" as const };
  const opportunities = await listPickOpportunities({
    sport: filters.sport,
    query: filters.q,
    market: filters.market,
    app: filters.app,
    minHitRate: filters.minHitRate,
    sort: filters.sort,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Pick Finder
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Find the best prop angles fast
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            A PickFinder-style projections board with hit-rate filters, line difference,
            app/book filters, streaks, H2H context, matchup notes, and a pick-builder queue.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/finder"
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
          >
            All
          </a>
          {supportedSports.map((item) => (
            <a
              key={item.key}
              href={`/finder?sport=${item.key}`}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/finder?minHitRate=70"
            className="rounded-full border border-emerald-300/30 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-500/10"
          >
            70%+ L10
          </a>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="info">L5/L10/L15</Badge>
        <Badge variant="info">H2H</Badge>
        <Badge variant="info">Line diff</Badge>
        <Badge variant="info">Streaks</Badge>
        <Badge variant="info">App filters</Badge>
        <Badge variant="warning">Demo projections</Badge>
      </div>

      <PickFinderBoard
        opportunities={opportunities}
        filters={{
          sport: filters.sport,
          market: filters.market,
          app: filters.app,
          sort: filters.sort,
          minHitRate: filters.minHitRate,
        }}
      />
    </div>
  );
}

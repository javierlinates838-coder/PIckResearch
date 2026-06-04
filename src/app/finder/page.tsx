import type { Metadata } from "next";

import { PickFinderBoard } from "@/components/finder/pick-finder-board";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supportedSports } from "@/config/sports";
import { getDfsSummary, listPickOpportunities } from "@/lib/repositories/research";
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
  const [opportunities, dfsSummary] = await Promise.all([
    listPickOpportunities({
      sport: filters.sport,
      query: filters.q,
      market: filters.market,
      app: filters.app,
      minHitRate: filters.minHitRate,
      sort: filters.sort,
    }),
    getDfsSummary(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
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
            className="rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-3 py-2 text-sm text-fuchsia-100 hover:bg-fuchsia-400/20"
          >
            70%+ L10
          </a>
        </div>
      </div>

      <Card className="mb-6 border-cyan-300/20 bg-cyan-400/10">
        <form action="/finder" className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
          <label className="sr-only" htmlFor="finder-search">
            Search players or props
          </label>
          <input
            id="finder-search"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search player, prop, app, or team..."
            className="min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/70"
          />
          <select
            name="sport"
            defaultValue={filters.sport ?? ""}
            className="min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none focus:border-cyan-300/70"
          >
            <option value="">All sports</option>
            {supportedSports.map((sport) => (
              <option key={sport.key} value={sport.key}>
                {sport.label}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={filters.sort}
            className="min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none focus:border-cyan-300/70"
          >
            <option value="edge">Best edge</option>
            <option value="confidence">Confidence</option>
            <option value="l10">L10 hit rate</option>
            <option value="diff">Line diff</option>
            <option value="streak">Streak</option>
            <option value="newest">Newest</option>
          </select>
          {filters.market ? <input type="hidden" name="market" value={filters.market} /> : null}
          {filters.app ? <input type="hidden" name="app" value={filters.app} /> : null}
          {filters.minHitRate ? (
            <input type="hidden" name="minHitRate" value={String(filters.minHitRate)} />
          ) : null}
          <button
            type="submit"
            className="min-h-12 rounded-2xl bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-5 text-sm font-black text-slate-950 shadow-lg shadow-fuchsia-500/20"
          >
            Search props
          </button>
        </form>
      </Card>

      <Card className="mb-6 border-fuchsia-300/20 bg-fuchsia-500/10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant={dfsSummary.providerConfigured ? "positive" : "warning"}>
              {dfsSummary.providerConfigured ? "DFS provider key detected" : "Demo DFS player pool"}
            </Badge>
            <p className="mt-3 text-sm leading-6 text-fuchsia-50/85">
              Your odds/news API keys do not populate Finder players. Finder needs a DFS
              projections/stat-log provider. Current searchable pool: {dfsSummary.playerCount} demo
              players and {dfsSummary.propCount} demo prop rows across {dfsSummary.sports.join(", ")}.
            </p>
          </div>
          <a
            href="/api/providers/status"
            className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/20"
          >
            Provider status
          </a>
        </div>
      </Card>

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
          query: filters.q,
          sort: filters.sort,
          minHitRate: filters.minHitRate,
        }}
        dataSummary={dfsSummary}
      />
    </div>
  );
}

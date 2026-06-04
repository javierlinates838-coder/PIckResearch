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
  const displaySummary =
    dfsSummary.source === "theoddsapi"
      ? {
          ...dfsSummary,
          playerCount: new Set(opportunities.map((item) => item.player.id)).size,
          propCount: opportunities.length,
          sports: Array.from(new Set(opportunities.map((item) => item.sport))),
          markets: Array.from(new Set(opportunities.map((item) => item.market))),
        }
      : dfsSummary;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-lime-200">
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
            className="rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-2 text-sm text-orange-100 hover:bg-orange-400/20"
          >
            70%+ L10
          </a>
        </div>
      </div>

      <Card className="mb-6 border-lime-300/20 bg-lime-400/10">
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
            className="min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-lime-300/70"
          />
          <select
            name="sport"
            defaultValue={filters.sport ?? ""}
            className="min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none focus:border-lime-300/70"
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
            className="min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none focus:border-lime-300/70"
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
            className="min-h-12 rounded-2xl bg-gradient-to-r from-lime-300 via-orange-400 to-red-500 px-5 text-sm font-black text-black shadow-lg shadow-orange-500/20"
          >
            Search props
          </button>
        </form>
      </Card>

      <Card className="mb-6 border-orange-300/20 bg-orange-500/10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant={dfsSummary.providerConfigured ? "positive" : "warning"}>
              {displaySummary.source === "theoddsapi"
                ? "Live OddsAPI prop lines"
                : displaySummary.providerConfigured
                  ? "DFS provider key detected"
                  : "Demo DFS player pool"}
            </Badge>
            <p className="mt-3 text-sm leading-6 text-orange-50/85">
              {displaySummary.source === "theoddsapi"
                ? "Finder is requesting fresh event-level OddsAPI player-prop markets on every page load. Historical hit rates and stat logs still need a DFS/stat-log provider."
                : "Finder needs a DFS projections/stat-log provider for full PickFinder-style coverage. Until then it uses the demo player pool."}{" "}
              Current searchable pool: {displaySummary.playerCount} {displaySummary.source === "theoddsapi" ? "live/API-backed" : "demo"} players and {displaySummary.propCount} prop rows.
            </p>
          </div>
          <a
            href="/api/providers/status"
            className="rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-sm font-semibold text-lime-100 hover:bg-lime-300/20"
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
        dataSummary={displaySummary}
      />
    </div>
  );
}

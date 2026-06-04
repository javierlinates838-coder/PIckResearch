import { ArrowDownUp, Flame, Plus, SlidersHorizontal, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import type { MarketType, PickApp, PickOpportunity, SportKey } from "@/types/sports";

interface DfsDataSummary {
  source: "demo" | "theoddsapi";
  playerCount: number;
  propCount: number;
  sports: SportKey[];
  markets: MarketType[];
  providerConfigured: boolean;
  expectedProviderKey: string;
}

const marketOptions: { label: string; value: MarketType }[] = [
  { label: "Points", value: "player_points" },
  { label: "Rebounds", value: "player_rebounds" },
  { label: "Assists", value: "player_assists" },
  { label: "Shots", value: "player_shots" },
  { label: "Strikeouts", value: "player_strikeouts" },
  { label: "Kills", value: "player_kills" },
];

const appOptions: PickApp[] = [
  "PrizePicks",
  "Underdog",
  "Sleeper",
  "DraftKings",
  "FanDuel",
  "BetMGM",
  "OddsAPI",
];

function finderHref(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const value = query.toString();

  return value ? `/finder?${value}` : "/finder";
}

function marketLabel(market: MarketType) {
  return market.replace("player_", "").replaceAll("_", " ");
}

function confidenceVariant(value: number) {
  if (value >= 82) return "positive";
  if (value >= 70) return "warning";
  return "neutral";
}

export function PickFinderBoard({
  opportunities,
  filters,
  dataSummary,
}: {
  opportunities: PickOpportunity[];
  filters: {
    sport?: SportKey;
    market?: MarketType;
    app?: PickApp;
    query?: string;
    sort: "edge" | "confidence" | "l10" | "diff" | "streak" | "newest";
    minHitRate?: number;
  };
  dataSummary: DfsDataSummary;
}) {
  const top = opportunities[0];
  const builderPicks = opportunities.slice(0, 3);
  const averageEdge = opportunities.length
    ? Math.round(opportunities.reduce((sum, item) => sum + item.edgeScore, 0) / opportunities.length)
    : 0;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-orange-300/20 bg-gradient-to-br from-lime-500/10 via-orange-500/10 to-red-500/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="warning">DFS prop board - demo projections</Badge>
            <h2 className="mt-3 text-xl font-semibold text-white">Projection finder</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-orange-50/80">
              This screen is shaped like a PickFinder projections page: ranked picks, imported-line
              style app filters, L5/L10/L15 hit rates, H2H, streaks, line difference, and a pick
              builder. The calculations currently use demo player metrics until a real projections
              provider is connected.
            </p>
          </div>
          <Link
            href="/players"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-lime-200/30 bg-lime-300/10 px-4 py-2 text-sm font-semibold text-lime-100 hover:bg-lime-300/20"
          >
            Deep player research
          </Link>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Finder results" value={opportunities.length} detail="After filters" />
        <Metric label="Average edge" value={averageEdge} detail="Demo score" />
        <Metric label="Top confidence" value={top ? `${top.confidence}%` : "0%"} detail={top?.player.name ?? "None"} />
        <Metric label="Builder queue" value={builderPicks.length} detail="Top ranked picks" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.38fr]">
        <Card id="builder">
          <CardHeader
            eyebrow="Advanced filters"
            title="Find props by hit rate, line difference, app, stat, and sport"
            description="PickFinder-style research starts with sorting the projection board, not browsing generic games."
          />
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                ["edge", "Best edge"],
                ["confidence", "Confidence"],
                ["l10", "L10 hit rate"],
                ["diff", "Line diff"],
                ["streak", "Streak"],
                ["newest", "Newest"],
              ].map(([value, label]) => (
                <a
                  key={value}
                  href={finderHref({
                    sport: filters.sport,
                    q: filters.query,
                    market: filters.market,
                    app: filters.app,
                    sort: value,
                    minHitRate: filters.minHitRate ? String(filters.minHitRate) : undefined,
                  })}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-orange-50 hover:border-orange-300/60 hover:bg-orange-300/10 hover:text-white"
                >
                  <ArrowDownUp className="size-3" />
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {marketOptions.map((item) => (
                <a
                  key={item.value}
                  href={finderHref({
                    sport: filters.sport,
                    q: filters.query,
                    market: item.value,
                    app: filters.app,
                    sort: filters.sort,
                    minHitRate: filters.minHitRate ? String(filters.minHitRate) : undefined,
                  })}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-orange-50 hover:border-lime-300/60 hover:bg-lime-300/10 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {appOptions.map((app) => (
                <a
                  key={app}
                  href={finderHref({
                    sport: filters.sport,
                    q: filters.query,
                    market: filters.market,
                    app,
                    sort: filters.sort,
                    minHitRate: filters.minHitRate ? String(filters.minHitRate) : undefined,
                  })}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-orange-50 hover:border-yellow-300/60 hover:bg-yellow-300/10 hover:text-white"
                >
                  {app}
                </a>
              ))}
              <a
                href="/finder"
                className="inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-500/5 px-3 py-2 text-sm text-red-100 hover:bg-red-500/10"
              >
                <SlidersHorizontal className="size-3" />
                Reset
              </a>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Pick builder"
            title="Queue"
            description="Top filtered picks ready to save or export once user accounts are connected."
          />
          <div className="space-y-3">
            {builderPicks.map((pick) => (
              <div key={pick.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/players/${pick.player.id}`}
                      className="font-semibold text-white hover:text-lime-200"
                    >
                      {pick.player.name}
                    </Link>
                    <p className="text-sm text-slate-400">
                      {pick.side.toUpperCase()} {pick.line} {marketLabel(pick.market)}
                    </p>
                  </div>
                  <Badge variant={confidenceVariant(pick.confidence)}>{pick.confidence}%</Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500">{pick.app}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <CardHeader
          eyebrow="Projection board"
          title="Ranked prop opportunities"
          description="Sorted like a prop finder: edge first, then hit-rate, matchup, streak, and line-diff context."
        />
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/10 p-2">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-orange-100/55">
              <tr>
                <th className="px-3">Pick</th>
                <th className="px-3">App</th>
                <th className="px-3">Line</th>
                <th className="px-3">Proj</th>
                <th className="px-3">Diff</th>
                <th className="px-3">L5</th>
                <th className="px-3">L10</th>
                <th className="px-3">L15</th>
                <th className="px-3">H2H</th>
                <th className="px-3">Streak</th>
                <th className="px-3">Edge</th>
                <th className="px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((pick) => (
                <tr key={pick.id} className="rounded-2xl bg-white/[0.04] text-slate-200">
                  <td className="rounded-l-2xl px-3 py-4">
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-lime-400/20 to-orange-300/20 text-lime-100">
                        <Flame className="size-4" />
                      </div>
                      <div>
                        <Link
                          href={`/players/${pick.player.id}`}
                          className="font-semibold text-white hover:text-lime-200"
                        >
                          {pick.player.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {pick.team.abbreviation} vs {pick.opponent.abbreviation} - {pick.sport.toUpperCase()}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {pick.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} className="px-2 py-0.5" variant="neutral">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">{pick.app}</td>
                  <td className="px-3 py-4">
                    <span className="font-semibold text-white">{pick.side.toUpperCase()}</span> {pick.line}
                  </td>
                  <td className="px-3 py-4">{pick.projection}</td>
                  <td className="px-3 py-4 text-lime-200">{pick.diff > 0 ? "+" : ""}{pick.diff}</td>
                  <td className="px-3 py-4">{pick.l5HitRate}%</td>
                  <td className="px-3 py-4 font-semibold text-white">{pick.l10HitRate}%</td>
                  <td className="px-3 py-4">{pick.l15HitRate}%</td>
                  <td className="px-3 py-4">{pick.h2hHitRate}%</td>
                  <td className="px-3 py-4">{pick.streak}</td>
                  <td className="px-3 py-4">
                    <Badge variant={confidenceVariant(pick.edgeScore)}>{pick.edgeScore}</Badge>
                  </td>
                  <td className="rounded-r-2xl px-3 py-4">
                    <Link
                      href={`/players/${pick.player.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-xs font-semibold text-lime-100 hover:border-lime-200"
                    >
                      <Plus className="size-3" />
                      Research
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!opportunities.length ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-sm text-slate-400">
            No picks match these filters. Current {dataSummary.source === "theoddsapi" ? "live OddsAPI" : "demo"} coverage is {dataSummary.playerCount} players
            across {dataSummary.sports.join(", ") || "the selected live sport"} and markets{" "}
            {dataSummary.markets.map((market) => market.replace("player_", "").replaceAll("_", " ")).join(", ")}.
            {dataSummary.source === "theoddsapi"
              ? " If this is empty, OddsAPI did not return player-prop markets for the selected events or your quota/market settings need adjustment."
              : ` Connect ${dataSummary.expectedProviderKey} or reset filters.`}
          </div>
        ) : null}
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Star className="mt-1 size-5 text-orange-200" />
          <p className="text-sm leading-6 text-orange-50/75">
            Next production step: replace demo projection rows with imported props from PrizePicks,
            Underdog, Sleeper, and sportsbook markets; then calculate real diff, hit rates, and
            pick-builder exports from persisted stat logs.
          </p>
        </div>
      </Card>
    </div>
  );
}

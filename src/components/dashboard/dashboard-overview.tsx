import { Activity, AlertTriangle, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import type { DashboardData, ResearchDataSource } from "@/types/sports";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function sourceLabel(source: ResearchDataSource) {
  const labels: Record<ResearchDataSource, string> = {
    theoddsapi: "Live: The Odds API",
    newsapi: "Live: NewsAPI",
    mock: "Demo data",
    supabase: "Supabase",
    unavailable: "Unavailable",
  };

  return labels[source];
}

function sourceVariant(source: ResearchDataSource) {
  if (source === "theoddsapi" || source === "newsapi" || source === "supabase") {
    return "positive";
  }

  if (source === "unavailable") {
    return "warning";
  }

  return "neutral";
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-sm leading-6 text-slate-400">
      {message}
    </div>
  );
}

export function DashboardOverview({ data }: { data: DashboardData }) {
  const highSeverityNews = data.news.filter((item) =>
    ["high", "critical"].includes(item.severity),
  ).length;
  const liveProviderCount = [
    data.meta.sources.games === "theoddsapi",
    data.meta.sources.news === "newsapi",
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <Card className="border-fuchsia-300/20 bg-fuchsia-500/10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={sourceVariant(data.meta.sources.games)}>
                Games: {sourceLabel(data.meta.sources.games)}
              </Badge>
              <Badge variant={sourceVariant(data.meta.sources.odds)}>
                Odds: {sourceLabel(data.meta.sources.odds)}
              </Badge>
              <Badge variant={sourceVariant(data.meta.sources.news)}>
                News: {sourceLabel(data.meta.sources.news)}
              </Badge>
              <Badge variant={sourceVariant(data.meta.sources.splits)}>
                Splits: {sourceLabel(data.meta.sources.splits)}
              </Badge>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Data quality and live status</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
              {liveProviderCount
                ? "Live provider data is active where configured. Demo-only modules are labeled until a production stats, splits, or snapshot ingestion provider is connected."
                : "Demo mode is active. Add provider keys in Vercel and redeploy to enable live games, odds, and news."}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Fetched {formatTime(data.meta.fetchedAt)}</p>
            <p className="mt-1">
              Odds key:{" "}
              {data.meta.providerStatus.theOddsApi.detectedAlias ??
                (data.meta.providerStatus.theOddsApi.configured ? "configured" : "missing")}
            </p>
            <p className="mt-1">
              News key:{" "}
              {data.meta.providerStatus.newsapi.detectedAlias ??
                (data.meta.providerStatus.newsapi.configured ? "configured" : "missing")}
            </p>
            {data.meta.providerStatus.theOddsApi.requestsRemaining ? (
              <p className="mt-1">
                Odds quota remaining: {data.meta.providerStatus.theOddsApi.requestsRemaining}
              </p>
            ) : null}
            <a className="mt-3 inline-block text-cyan-200 hover:text-cyan-100" href="/api/providers/status">
              View provider status
            </a>
          </div>
        </div>
        {data.meta.warnings.length || data.meta.providerErrors.newsapi || data.meta.providerErrors.theOddsApi ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {data.meta.warnings.map((warning) => (
              <p key={warning} className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-3 text-sm text-fuchsia-50/85">
                {warning}
              </p>
            ))}
            {data.meta.providerErrors.theOddsApi ? (
              <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                The Odds API error: {data.meta.providerErrors.theOddsApi}
              </p>
            ) : null}
            {data.meta.providerErrors.newsapi ? (
              <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                NewsAPI error: {data.meta.providerErrors.newsapi}
              </p>
            ) : null}
          </div>
        ) : null}
      </Card>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric
          label="Upcoming games"
          value={data.games.length}
          detail={sourceLabel(data.meta.sources.games)}
        />
        <Metric
          label="Tracked markets"
          value={data.odds.length}
          detail={sourceLabel(data.meta.sources.odds)}
        />
        <Metric
          label="Sharp signals"
          value={data.splits.filter((split) => split.sharpSide !== "none").length}
          detail={sourceLabel(data.meta.sources.splits)}
        />
        <Metric
          label="News alerts"
          value={highSeverityNews}
          detail={sourceLabel(data.meta.sources.news)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            eyebrow={sourceLabel(data.meta.sources.games)}
            title="Upcoming games"
            description="Start times, venues, and active market context."
          />
          <div className="space-y-3">
            {data.games.length ? data.games.map((game) => (
              <div
                key={game.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info">{game.league}</Badge>
                    <Badge>{game.status}</Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {game.awayTeam.abbreviation} at {game.homeTeam.abbreviation}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {game.venue} - {formatTime(game.startsAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-cyan-200">
                  <Activity className="size-4" />
                  {game.sport.toUpperCase()}
                </div>
              </div>
            )) : (
              <EmptyState message="No upcoming events returned for this filter. Check The Odds API sport coverage, region, and quota." />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow={sourceLabel(data.meta.sources.odds)}
            title={data.meta.sources.odds === "theoddsapi" ? "Current market prices" : "Demo line movement"}
            description={
              data.meta.sources.odds === "theoddsapi"
                ? "Latest sportsbook prices from The Odds API. Historical movement requires persisted snapshots."
                : "Open-to-current demo moves and sportsbook context."
            }
          />
          <div className="space-y-3">
            {data.odds.length ? data.odds.map((item) => {
              const moved = item.line - item.openingLine;

              return (
                <div key={item.id} className="rounded-2xl bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{item.selection}</p>
                      <p className="text-sm text-slate-400">
                        {item.sportsbook} - {item.market.replaceAll("_", " ")}
                      </p>
                    </div>
                    <Badge variant={moved === 0 ? "neutral" : moved > 0 ? "warning" : "positive"}>
                      {moved > 0 ? "+" : ""}
                      {moved.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-950/70 p-3">
                      <p className="text-slate-500">Open</p>
                      <p className="font-semibold text-white">
                        {item.openingLine} ({item.openingPrice})
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 p-3">
                      <p className="text-slate-500">Current</p>
                      <p className="font-semibold text-white">
                        {item.line} ({item.price})
                      </p>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <EmptyState message="No odds returned. Confirm The Odds API markets, region, and sport key availability." />
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader
            eyebrow={sourceLabel(data.meta.sources.splits)}
            title="Public vs sharp"
            description={
              data.meta.sources.splits === "unavailable"
                ? "Public betting percentages are not supplied by The Odds API and need a dedicated splits provider."
                : "Ticket and money splits that expose possible disagreement."
            }
          />
          <div className="space-y-3">
            {data.splits.length ? data.splits.map((split) => (
              <div key={split.id} className="rounded-2xl bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{split.selection}</p>
                  <Badge variant="positive">{split.confidence}%</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <p className="flex items-center gap-2 text-slate-300">
                    <Users className="size-4 text-slate-500" />
                    Tickets {split.publicTicketsPct}%
                  </p>
                  <p className="flex items-center gap-2 text-slate-300">
                    <TrendingUp className="size-4 text-cyan-200" />
                    Money {split.publicMoneyPct}%
                  </p>
                </div>
                <p className="mt-3 text-sm text-cyan-200">
                  Sharp side: {split.sharpSide.toUpperCase()}
                </p>
              </div>
            )) : (
              <EmptyState message="No live split feed is connected. This section will stay empty instead of mixing demo splits with live games." />
            )}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            eyebrow={sourceLabel(data.meta.sources.news)}
            title="Injury and lineup feed"
            description="Aggregated alerts that can change prices and projections."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {data.news.length ? data.news.map((item) => (
              <article key={item.id} className="rounded-2xl bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      item.severity === "critical"
                        ? "danger"
                        : item.severity === "high"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {item.severity}
                  </Badge>
                  <Badge>{item.type}</Badge>
                </div>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block font-semibold text-white hover:text-cyan-200"
                  >
                    {item.title}
                  </a>
                ) : (
                  <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                )}
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.summary}</p>
                <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <AlertTriangle className="size-3" />
                  {item.source} - {formatTime(item.publishedAt)}
                </p>
              </article>
            )) : (
              <EmptyState message="No news articles returned. Adjust NewsAPI query settings or check provider status." />
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

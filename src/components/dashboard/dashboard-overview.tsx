import { Activity, AlertTriangle, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import type { DashboardData } from "@/types/sports";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DashboardOverview({ data }: { data: DashboardData }) {
  const highSeverityNews = data.news.filter((item) =>
    ["high", "critical"].includes(item.severity),
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Upcoming games" value={data.games.length} detail="Across active sports" />
        <Metric label="Tracked markets" value={data.odds.length} detail="Live/open line deltas" />
        <Metric
          label="Sharp signals"
          value={data.splits.filter((split) => split.sharpSide !== "none").length}
          detail="Public-vs-money gaps"
        />
        <Metric label="News alerts" value={highSeverityNews} detail="High or critical severity" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            eyebrow="Live board"
            title="Upcoming games"
            description="Start times, venues, and active market context."
          />
          <div className="space-y-3">
            {data.games.map((game) => (
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
                <div className="flex items-center gap-2 text-sm text-emerald-200">
                  <Activity className="size-4" />
                  {game.sport.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Market movement"
            title="Best line movement"
            description="Open-to-current moves and sportsbook context."
          />
          <div className="space-y-3">
            {data.odds.map((item) => {
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
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader
            eyebrow="Sharp radar"
            title="Public vs sharp"
            description="Ticket and money splits that expose possible disagreement."
          />
          <div className="space-y-3">
            {data.splits.map((split) => (
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
                    <TrendingUp className="size-4 text-emerald-300" />
                    Money {split.publicMoneyPct}%
                  </p>
                </div>
                <p className="mt-3 text-sm text-emerald-200">
                  Sharp side: {split.sharpSide.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            eyebrow="News engine"
            title="Injury and lineup feed"
            description="Aggregated alerts that can change prices and projections."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {data.news.map((item) => (
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
                <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.summary}</p>
                <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <AlertTriangle className="size-3" />
                  {item.source} - {formatTime(item.publishedAt)}
                </p>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

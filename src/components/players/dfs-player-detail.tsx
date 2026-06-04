import { Activity, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import type { DfsPlayerResearch } from "@/types/sports";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function marketLabel(value: string) {
  return value.replace("player_", "").replaceAll("_", " ");
}

export function DfsPlayerDetail({ research }: { research: DfsPlayerResearch }) {
  const maxValue = Math.max(...research.logs.map((log) => log.value), research.currentLine);

  return (
    <div className="space-y-6">
      <a
        href="/finder"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        <ArrowLeft className="size-4" />
        Back to Pick Finder
      </a>

      <Card className="overflow-hidden border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-cyan-400/10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{research.player.sport.toUpperCase()}</Badge>
              <Badge variant="warning">DFS prop research</Badge>
              <Badge variant={research.injuryStatus === "clear" ? "positive" : "warning"}>
                Injury: {research.injuryStatus}
              </Badge>
            </div>
            <h1 className="mt-4 text-4xl font-black text-white">{research.player.name}</h1>
            <p className="mt-2 text-slate-300">
              {research.player.position} - {research.team.abbreviation} - {marketLabel(research.primaryMarket)}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-violet-50/75">
              {research.matchup.note}
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-200/20 bg-black/25 p-5 shadow-xl shadow-cyan-950/20">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Current line</p>
            <p className="mt-2 text-4xl font-black text-white">{research.currentLine}</p>
            <p className="mt-1 text-sm text-cyan-100">Projection {research.projection}</p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Last 5 avg" value={research.last5Average} detail={`${research.l5HitRate}% hit`} />
        <Metric label="Last 10 avg" value={research.last10Average} detail={`${research.l10HitRate}% hit`} />
        <Metric label="Last 15 avg" value={research.last15Average} detail={`${research.l15HitRate}% hit`} />
        <Metric label="Season avg" value={research.seasonAverage} detail={`${research.seasonHitRate}% hit`} />
        <Metric label="Streak" value={research.streak} detail="Straight over line" />
        <Metric label="Consistency" value={research.consistencyScore} detail="0-100 score" />
        <Metric label="Usage trend" value={`${research.usageTrendPct > 0 ? "+" : ""}${research.usageTrendPct}%`} />
        <Metric
          label="DvP rank"
          value={`#${research.matchup.defenseVsPositionRank}`}
          detail={research.matchup.opponent}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            eyebrow="Last 15"
            title="Game log graph"
            description="Bar view of the player's recent results against the current DFS line."
          />
          <div className="space-y-3">
            {research.logs.map((log) => (
              <div key={log.id} className="grid grid-cols-[4rem_1fr_4rem] items-center gap-3 text-sm">
                <span className="text-slate-500">{formatDate(log.playedAt)}</span>
                <div className="relative h-9 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className={`h-full rounded-full ${log.hit ? "bg-gradient-to-r from-cyan-300 to-fuchsia-300" : "bg-slate-600"}`}
                    style={{ width: `${Math.max(8, (log.value / maxValue) * 100)}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-px bg-white"
                    style={{ left: `${Math.min(98, (research.currentLine / maxValue) * 100)}%` }}
                  />
                </div>
                <span className="font-semibold text-white">{log.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Available lines"
            title="DFS apps and books"
            description="Lines are linked to the same player research context."
          />
          <div className="space-y-3">
            {research.availableProps.map((prop) => (
              <div key={prop.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{prop.app}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {prop.side.toUpperCase()} {prop.line} {marketLabel(prop.market)}
                    </p>
                  </div>
                  <Badge variant={prop.confidence >= 80 ? "positive" : "warning"}>
                    {prop.confidence}%
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{prop.rationale}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <CardHeader
          eyebrow="Game log"
          title="Recent stat table"
          description="Clicking a player now opens their actual prop research surface instead of a dead shell."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="py-3">Date</th>
                <th className="py-3">Opponent</th>
                <th className="py-3">Minutes</th>
                <th className="py-3">Value</th>
                <th className="py-3">Line</th>
                <th className="py-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {research.logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 text-slate-300">{formatDate(log.playedAt)}</td>
                  <td className="py-3 text-slate-300">{log.opponent}</td>
                  <td className="py-3 text-slate-300">{log.minutes}</td>
                  <td className="py-3 font-semibold text-white">{log.value}</td>
                  <td className="py-3 text-slate-300">{log.line}</td>
                  <td className="py-3">
                    {log.hit ? (
                      <span className="inline-flex items-center gap-2 text-cyan-200">
                        <CheckCircle2 className="size-4 text-cyan-200" />
                        Hit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-slate-500">
                        <XCircle className="size-4" />
                        Miss
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border-fuchsia-300/20 bg-fuchsia-500/10">
        <div className="flex gap-3">
          <Activity className="mt-1 size-5 text-fuchsia-200" />
          <p className="text-sm leading-6 text-fuchsia-50/80">
            This is a complete DFS prop research interface, but the rows are still demo data until a
            production DFS projections/stat-log provider is connected. The UI no longer pretends
            fake games are live or makes teams the center of the product.
          </p>
        </div>
      </Card>
    </div>
  );
}

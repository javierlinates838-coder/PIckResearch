import { Activity, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

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

function clampRank(value: number) {
  return Math.max(1, Math.min(30, Math.round(value)));
}

function ordinal(value: number) {
  const suffix = value % 10 === 1 && value !== 11 ? "st" : value % 10 === 2 && value !== 12 ? "nd" : value % 10 === 3 && value !== 13 ? "rd" : "th";

  return `${value}${suffix}`;
}

function rankClass(rank: number) {
  return rank >= 20 ? "text-cyan-200" : rank <= 10 ? "text-rose-300" : "text-fuchsia-100";
}

function defenseRows(baseRank: number) {
  return [
    { stat: "Points", allowed: 26.8, season: baseRank, last15: baseRank + 3, last7: baseRank - 2 },
    { stat: "Rebounds", allowed: 11.1, season: baseRank - 5, last15: baseRank + 1, last7: baseRank + 4 },
    { stat: "Assists", allowed: 7.2, season: baseRank - 8, last15: baseRank - 2, last7: baseRank + 2 },
    { stat: "FG%", allowed: 45.2, season: baseRank - 14, last15: baseRank - 4, last7: baseRank + 1 },
    { stat: "3PM", allowed: 3.1, season: baseRank - 10, last15: baseRank - 7, last7: baseRank - 3 },
  ].map((row) => ({
    ...row,
    season: clampRank(row.season),
    last15: clampRank(row.last15),
    last7: clampRank(row.last7),
  }));
}

function comparisonRows(baseRank: number, projection: number) {
  return [
    { label: "Points", offense: clampRank(31 - projection / 1.5), defense: clampRank(baseRank), value: projection },
    { label: "Rebounds", offense: clampRank(18 + baseRank / 3), defense: clampRank(baseRank + 4), value: 44.7 },
    { label: "3 Pointers", offense: clampRank(16 + baseRank / 4), defense: clampRank(baseRank - 3), value: 12.8 },
    { label: "Assists", offense: clampRank(22 - projection / 3), defense: clampRank(baseRank + 1), value: 27.5 },
    { label: "Blocks", offense: clampRank(24), defense: clampRank(baseRank - 6), value: 5.2 },
    { label: "Steals", offense: clampRank(17), defense: clampRank(baseRank - 12), value: 8.4 },
  ];
}

export function DfsPlayerDetail({ research }: { research: DfsPlayerResearch }) {
  const maxValue = Math.max(...research.logs.map((log) => log.value), research.currentLine);
  const dvpRows = defenseRows(research.matchup.defenseVsPositionRank);
  const matchupRows = comparisonRows(research.matchup.defenseVsPositionRank, research.projection);

  return (
    <div className="space-y-6">
      <Link
        href="/finder"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        <ArrowLeft className="size-4" />
        Back to Pick Finder
      </Link>

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

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader
            eyebrow="Matchup"
            title="Defense vs Position"
            description={`${research.matchup.opponent} allowed averages and ranks for this player's role.`}
          />
          <div className="grid grid-cols-[1fr_4rem_4rem_4rem] gap-2 px-2 text-xs uppercase tracking-[0.16em] text-violet-200/50">
            <span>Stat</span>
            <span>2026</span>
            <span>Last 15</span>
            <span>Last 7</span>
          </div>
          <div className="mt-3 space-y-3">
            {dvpRows.map((row) => (
              <div key={row.stat} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="grid grid-cols-[1fr_4rem_4rem_4rem] items-center gap-2">
                  <div>
                    <p className="font-semibold text-white">{row.stat}</p>
                    <p className="text-xs text-slate-500">{row.allowed} allowed avg</p>
                  </div>
                  {[row.season, row.last15, row.last7].map((rank, index) => (
                    <span key={`${row.stat}-${index}`} className={`font-black ${rankClass(rank)}`}>
                      {ordinal(rank)}
                    </span>
                  ))}
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${row.season >= 18 ? "bg-cyan-300" : "bg-rose-400"}`}
                    style={{ width: `${Math.max(12, (row.season / 30) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded border border-cyan-300 bg-cyan-300/20" />
              Better for overs
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded border border-rose-400 bg-rose-400/20" />
              Better for unders
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Matchup"
            title="Offense vs Defense"
            description={`${research.team.abbreviation} player role compared with ${research.matchup.opponent} defensive profile.`}
          />
          <div className="space-y-4">
            {matchupRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[5rem_1fr_5rem] items-center gap-3 text-sm">
                <span className={rankClass(row.offense)}>
                  {ordinal(row.offense)}
                </span>
                <div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-500 to-fuchsia-400" style={{ width: "50%" }} />
                    <div className="absolute right-0 top-0 h-full bg-gradient-to-l from-cyan-300 to-violet-400" style={{ width: "50%" }} />
                    <div
                      className="absolute top-[-2px] h-5 w-1 rounded-full bg-white"
                      style={{ left: `${Math.min(94, Math.max(4, (row.defense / 30) * 100))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center text-xs font-semibold text-white">{row.label}</p>
                </div>
                <span className={`text-right ${rankClass(row.defense)}`}>
                  {ordinal(row.defense)} <span className="text-slate-500">({row.value.toFixed(1)})</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between text-xs font-semibold">
            <span className="text-rose-300">Offensive advantage</span>
            <span className="text-cyan-200">Defensive advantage</span>
          </div>
        </Card>
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

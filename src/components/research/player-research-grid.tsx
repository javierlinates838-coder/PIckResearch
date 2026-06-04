import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import type { Player, PlayerResearchMetrics, Team } from "@/types/sports";

function teamName(team: Team) {
  return [team.city, team.name].filter(Boolean).join(" ");
}

export function PlayerResearchGrid({
  players,
  research,
}: {
  players: Player[];
  research: PlayerResearchMetrics[];
}) {
  const researchByPlayer = new Map(research.map((item) => [item.player.id, item]));

  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <Card>
        <CardHeader
          eyebrow="Player universe"
          title="Tracked players"
          description="Searchable player list ready for Supabase-backed filtering."
        />
        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="rounded-2xl bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{player.name}</p>
                  <p className="text-sm text-slate-400">
                    {player.position} - {player.sport.toUpperCase()}
                  </p>
                </div>
                <Badge variant={researchByPlayer.has(player.id) ? "positive" : "neutral"}>
                  {researchByPlayer.has(player.id) ? "Research" : "Profile"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        {research.map((item) => (
          <Card key={item.player.id}>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Badge variant="info">{item.propMarket.replaceAll("_", " ")}</Badge>
                <h2 className="mt-3 text-2xl font-bold text-white">{item.player.name}</h2>
                <p className="text-sm text-slate-400">
                  {teamName(item.team)} vs {item.opponent.abbreviation} - Current line{" "}
                  {item.currentLine}
                </p>
              </div>
              <Badge variant={item.consistencyScore >= 80 ? "positive" : "warning"}>
                Consistency {item.consistencyScore}
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Metric label="Last 5 avg" value={item.last5Average} detail={`${item.hitRateLast5}% hit`} />
              <Metric label="Last 10 avg" value={item.last10Average} detail={`${item.hitRateLast10}% hit`} />
              <Metric label="Season avg" value={item.seasonAverage} detail={`${item.hitRateSeason}% hit`} />
              <Metric label="Home split" value={item.homeAverage} />
              <Metric label="Away split" value={item.awayAverage} />
              <Metric label="Matchup rank" value={`#${item.matchupRank}`} detail="Opponent allowance" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white/[0.03] p-4">
                <h3 className="font-semibold text-white">Usage and minutes trends</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <p className="rounded-xl bg-slate-950/60 p-3 text-slate-300">
                    Usage <span className="font-semibold text-cyan-200">+{item.usageTrendPct}%</span>
                  </p>
                  <p className="rounded-xl bg-slate-950/60 p-3 text-slate-300">
                    Minutes <span className="font-semibold text-cyan-200">+{item.minutesTrendPct}%</span>
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-4">
                <h3 className="font-semibold text-white">Opponent matchup</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.matchupNote}</p>
              </div>
            </div>

            {item.riskFlags.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {item.riskFlags.map((risk) => (
                  <Badge key={risk} variant="warning">
                    {risk}
                  </Badge>
                ))}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import type { Team, TeamResearchMetrics } from "@/types/sports";

function fullTeamName(team: Team) {
  return [team.city, team.name].filter(Boolean).join(" ");
}

export function TeamResearchGrid({
  teams,
  trends,
}: {
  teams: Team[];
  trends: TeamResearchMetrics[];
}) {
  const trendIds = new Set(trends.map((item) => item.team.id));

  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <Card>
        <CardHeader
          eyebrow="Team universe"
          title="Tracked teams"
          description="Cross-sport teams normalized into one research model."
        />
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="rounded-2xl bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{fullTeamName(team)}</p>
                  <p className="text-sm text-slate-400">
                    {team.league} - {team.abbreviation}
                  </p>
                </div>
                <Badge variant={trendIds.has(team.id) ? "positive" : "neutral"}>
                  {team.sport.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        {trends.map((item) => (
          <Card key={item.team.id}>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Badge variant="info">{item.team.league}</Badge>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  {fullTeamName(item.team)}
                </h2>
                <p className="text-sm text-slate-400">{item.trendSummary}</p>
              </div>
              <Badge
                variant={
                  item.injuryImpact === "high"
                    ? "danger"
                    : item.injuryImpact === "medium"
                      ? "warning"
                      : "positive"
                }
              >
                Injury impact {item.injuryImpact}
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Metric label="Off rating" value={item.offensiveRating} />
              <Metric label="Def rating" value={item.defensiveRating} />
              <Metric label="Pace" value={item.pace} />
              <Metric label="Recent form" value={item.recentForm} />
              <Metric label="Net trend" value={`${item.netRatingTrend > 0 ? "+" : ""}${item.netRatingTrend}`} />
              <Metric label="Research tag" value={item.team.sport.toUpperCase()} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

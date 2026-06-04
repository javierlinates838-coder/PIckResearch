import type { Metadata } from "next";

import { TeamResearchGrid } from "@/components/research/team-research-grid";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supportedSports } from "@/config/sports";
import { getDashboardResearch, listTeams } from "@/lib/repositories/research";
import { listQuerySchema } from "@/lib/validators/research";

export const metadata: Metadata = {
  title: "Team Research",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = listQuerySchema.safeParse({
    sport: typeof params.sport === "string" ? params.sport : undefined,
    q: typeof params.q === "string" ? params.q : undefined,
  });
  const filters = parsed.success ? parsed.data : {};
  const [teams, dashboard] = await Promise.all([
    listTeams({ sport: filters.sport, query: filters.q }),
    getDashboardResearch({ sport: filters.sport }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
            Team research
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Team trend intelligence
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Analyze offensive ratings, defensive ratings, pace metrics, recent form, and
            injury-adjusted team trends once a production stats feed is connected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/teams"
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
          >
            All
          </a>
          {supportedSports.map((item) => (
            <a
              key={item.key}
              href={`/teams?sport=${item.key}`}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <Card className="mb-6 border-fuchsia-300/20 bg-fuchsia-500/10">
        <Badge variant="warning">Demo metrics</Badge>
        <p className="mt-3 text-sm leading-6 text-fuchsia-50/80">
          Team ratings, pace, form, net-rating trends, and injury impact are demo research
          data right now. Connect a stats provider or scheduled Supabase ingestion before
          treating these as verified live team metrics.
        </p>
      </Card>
      <TeamResearchGrid teams={teams} trends={dashboard.teamTrends} />
    </div>
  );
}

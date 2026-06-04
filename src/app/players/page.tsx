import type { Metadata } from "next";

import { PlayerResearchGrid } from "@/components/research/player-research-grid";
import { supportedSports } from "@/config/sports";
import { getDashboardResearch, listPlayers } from "@/lib/repositories/research";
import { listQuerySchema } from "@/lib/validators/research";

export const metadata: Metadata = {
  title: "Player Research",
};

export default async function PlayersPage({
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
  const [players, dashboard] = await Promise.all([
    listPlayers({ sport: filters.sport, query: filters.q }),
    getDashboardResearch({ sport: filters.sport }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Player research
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Prop opportunity scanner
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Compare player averages, splits, usage, minutes, hit rates, consistency, and
            opponent matchup context before saving a pick.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/players"
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
          >
            All
          </a>
          {supportedSports.map((item) => (
            <a
              key={item.key}
              href={`/players?sport=${item.key}`}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <PlayerResearchGrid players={players} research={dashboard.playerEdges} />
    </div>
  );
}

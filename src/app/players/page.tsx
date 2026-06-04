import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supportedSports } from "@/config/sports";
import { listPickOpportunities } from "@/lib/repositories/research";
import { listQuerySchema } from "@/lib/validators/research";

export const metadata: Metadata = {
  title: "Player Research",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const opportunities = await listPickOpportunities({
    sport: filters.sport,
    query: filters.q,
    sort: "edge",
  });
  const uniquePlayers = Array.from(
    new Map(opportunities.map((item) => [item.player.id, item])).values(),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
            Player research
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Prop research model
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Open a player to see DFS prop lines, last-15 logs, hit rates, line comparison,
            streaks, and matchup context.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/players"
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
          >
            All
          </Link>
          {supportedSports.map((item) => (
            <Link
              key={item.key}
              href={`/players?sport=${item.key}`}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <Card className="mb-6 border-fuchsia-300/20 bg-fuchsia-500/10">
        <Badge variant="warning">Demo metrics</Badge>
        <p className="mt-3 text-sm leading-6 text-fuchsia-50/80">
          Player stat pages are functional and clickable now. The underlying rows remain demo
          DFS props until a real projections/stat-log provider is connected.
        </p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {uniquePlayers.map((item) => (
          <a
            key={item.player.id}
            href={`/players/${item.player.id}`}
            className="rounded-3xl border border-fuchsia-200/10 bg-[#090b1f]/75 p-5 shadow-2xl shadow-fuchsia-950/20 transition hover:border-cyan-300/50 hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="info">{item.sport.toUpperCase()}</Badge>
                <h2 className="mt-3 text-xl font-semibold text-white">{item.player.name}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {item.player.position} - {item.team.abbreviation}
                </p>
              </div>
              <Badge variant={item.edgeScore >= 80 ? "positive" : "warning"}>
                {item.edgeScore}
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {item.side.toUpperCase()} {item.line} {item.market.replace("player_", "").replaceAll("_", " ")}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <p className="text-slate-500">L10</p>
                <p className="font-semibold text-cyan-100">{item.l10HitRate}%</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <p className="text-slate-500">Diff</p>
                <p className="font-semibold text-fuchsia-100">+{item.diff}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <p className="text-slate-500">Streak</p>
                <p className="font-semibold text-white">{item.streak}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, BrainCircuit, LineChart, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supportedSports } from "@/config/sports";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div className="space-y-8">
          <Badge variant="positive">DFS player prop research</Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
              Find DFS player prop angles without digging through team dashboards.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              PickResearch is now centered on player props: projection rows, hit rates,
              line difference, streaks, game logs, and clickable player research pages.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/finder"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-300 via-orange-400 to-red-500 px-6 py-3 font-semibold text-black shadow-lg shadow-orange-500/25 transition hover:scale-[1.01]"
            >
              Open Pick Finder
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/players"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-lime-200/25 bg-lime-300/10 px-6 py-3 font-semibold text-lime-50 transition hover:border-lime-100/60"
            >
              Browse players
            </Link>
          </div>
        </div>

        <Card className="space-y-5">
          {[
            {
              icon: LineChart,
              title: "DFS prop board",
              text: "Sort props by edge, confidence, L10 hit rate, line diff, streak, app, sport, and stat type.",
            },
            {
              icon: BrainCircuit,
              title: "Player research",
              text: "Open any player to review current line, projection, L5/L10/L15 hit rates, bars, and game logs.",
            },
            {
              icon: ShieldCheck,
              title: "Secure architecture",
              text: "Server-only provider keys, validated APIs, Supabase RLS-ready schema.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 rounded-2xl bg-white/[0.03] p-4">
              <item.icon className="mt-1 size-5 text-lime-200" />
              <div>
                <h2 className="font-semibold text-white">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">{item.text}</p>
              </div>
            </div>
          ))}
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {supportedSports.map((sport) => (
          <Card key={sport.key} className="p-4">
            <Badge variant="info">{sport.label}</Badge>
            <p className="mt-3 text-sm leading-6 text-slate-300">{sport.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

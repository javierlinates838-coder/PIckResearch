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
          <Badge variant="positive">Live-provider-ready sports intelligence</Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
              Research betting edges before the market fully prices them in.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              PickResearch combines live odds and news provider adapters with clearly labeled
              demo research modules for props, splits, trends, and AI workflows that need
              additional production data feeds.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/finder"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Open Pick Finder
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/players"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-white/40"
            >
              Explore player props
            </Link>
          </div>
        </div>

        <Card className="space-y-5">
          {[
            {
              icon: LineChart,
              title: "Market data",
              text: "Live odds when The Odds API is configured, plus honest labels for unavailable splits and snapshot movement.",
            },
            {
              icon: BrainCircuit,
              title: "AI summaries",
              text: "Explain matchup advantages, prop valuation, and risk factors.",
            },
            {
              icon: ShieldCheck,
              title: "Secure architecture",
              text: "Server-only provider keys, validated APIs, Supabase RLS-ready schema.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 rounded-2xl bg-white/[0.03] p-4">
              <item.icon className="mt-1 size-5 text-emerald-300" />
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

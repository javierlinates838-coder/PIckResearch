import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { supportedSports } from "@/config/sports";
import { getNewsResearch } from "@/lib/repositories/research";
import { newsQuerySchema } from "@/lib/validators/research";

export const metadata: Metadata = {
  title: "News Engine",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = newsQuerySchema.safeParse({
    sport: typeof params.sport === "string" ? params.sport : undefined,
    severity: typeof params.severity === "string" ? params.severity : undefined,
    type: typeof params.type === "string" ? params.type : undefined,
  });
  const filters = parsed.success ? parsed.data : {};
  const news = await getNewsResearch(filters);
  const sourceLabel = news.meta.source === "newsapi" ? "Live: NewsAPI" : "Demo data";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
            News engine
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Injury, lineup, and market-impact alerts
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Aggregate injury reports, suspensions, lineup changes, coaching updates, and
            provider news into a normalized feed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/news"
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
          >
            All
          </a>
          {supportedSports.map((item) => (
            <a
              key={item.key}
              href={`/news?sport=${item.key}`}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <Card className="mb-6 border-fuchsia-300/20 bg-fuchsia-500/10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant={news.meta.source === "newsapi" ? "positive" : "neutral"}>
              {sourceLabel}
            </Badge>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Fetched {formatTime(news.meta.fetchedAt)}. NewsAPI key:{" "}
              {news.meta.providerStatus.detectedAlias ??
                (news.meta.providerStatus.configured ? "configured" : "missing")}
            </p>
          </div>
          <a className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href="/api/providers/status">
            Provider status
          </a>
        </div>
        {news.meta.warnings.length || news.meta.providerError ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {news.meta.warnings.map((warning) => (
              <p key={warning} className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-3 text-sm text-fuchsia-50/85">
                {warning}
              </p>
            ))}
            {news.meta.providerError ? (
              <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                NewsAPI error: {news.meta.providerError}
              </p>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Card>
        <CardHeader
          eyebrow={sourceLabel}
          title="Latest market-impact news"
          description="Each item is tagged by sport, severity, source, and event type."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {news.items.length ? news.items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{item.sport.toUpperCase()}</Badge>
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
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block text-xl font-semibold text-white hover:text-cyan-200"
                >
                  {item.title}
                </a>
              ) : (
                <h2 className="mt-4 text-xl font-semibold text-white">{item.title}</h2>
              )}
              <p className="mt-2 leading-7 text-slate-400">{item.summary}</p>
              <p className="mt-4 text-sm text-slate-500">
                {item.source} - {formatTime(item.publishedAt)}
              </p>
            </article>
          )) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-sm leading-6 text-slate-400 md:col-span-2">
              No articles returned for this filter. Adjust the NewsAPI query, language, or page size settings.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

import "server-only";

import { createHash } from "node:crypto";

import { defaultNewsApiQueries, getNewsApiKey, getProviderStatus } from "@/config/providers";
import type { NewsItem, NewsType, Severity, SportKey } from "@/types/sports";

interface NewsApiSource {
  id: string | null;
  name: string;
}

export interface NewsApiArticle {
  source: NewsApiSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: "ok" | "error";
  totalResults?: number;
  articles?: NewsApiArticle[];
  code?: string;
  message?: string;
}

interface FetchNewsOptions {
  sport?: SportKey;
  query?: string;
  language?: string;
  sortBy?: "relevancy" | "popularity" | "publishedAt";
  pageSize?: number;
  page?: number;
}

const defaultAllSportsQuery =
  "(NBA OR MLB OR NFL OR NHL OR tennis OR soccer OR esports) AND (injury OR lineup OR suspension OR coaching OR trade OR roster)";

function stableArticleId(article: NewsApiArticle) {
  return `newsapi:${createHash("sha256").update(article.url || article.title).digest("hex").slice(0, 24)}`;
}

function textFor(article: NewsApiArticle) {
  return `${article.title} ${article.description ?? ""} ${article.content ?? ""}`.toLowerCase();
}

function classifyNewsType(article: NewsApiArticle): NewsType {
  const text = textFor(article);

  if (/(injury|injured|questionable|doubtful|out\b|game-time|game time|illness)/.test(text)) {
    return "injury";
  }

  if (/(suspension|suspended|ban\b|disciplinary)/.test(text)) {
    return "suspension";
  }

  if (/(lineup|starting|starter|rotation|inactive|active|bench|roster)/.test(text)) {
    return "lineup";
  }

  if (/(coach|coaching|manager|fired|hired|resigns)/.test(text)) {
    return "coaching";
  }

  if (/(trade|transfer|transaction|signed|waived|released)/.test(text)) {
    return "transaction";
  }

  return "general";
}

function classifySeverity(article: NewsApiArticle, type: NewsType): Severity {
  const text = textFor(article);

  if (/(season-ending|out indefinitely|suspended indefinitely|ruptured|torn|fracture)/.test(text)) {
    return "critical";
  }

  if (/(out\b|doubtful|suspended|ruled out|not expected to play|late scratch)/.test(text)) {
    return "high";
  }

  if (/(questionable|probable|limited|day-to-day|lineup|starter|rotation)/.test(text)) {
    return "medium";
  }

  return type === "general" ? "low" : "medium";
}

function classifySport(article: NewsApiArticle, fallback?: SportKey): SportKey {
  if (fallback) {
    return fallback;
  }

  const text = textFor(article);

  if (/\b(nba|basketball)\b/.test(text)) return "nba";
  if (/\b(mlb|baseball)\b/.test(text)) return "mlb";
  if (/\b(nfl|football|quarterback|wide receiver|running back)\b/.test(text)) return "nfl";
  if (/\b(nhl|hockey|goalie)\b/.test(text)) return "nhl";
  if (/\b(tennis|atp|wta)\b/.test(text)) return "tennis";
  if (/\b(soccer|epl|premier league|champions league|laliga|bundesliga)\b/.test(text)) {
    return "soccer";
  }
  if (/\b(esports|counter-strike|cs2|dota|league of legends|valorant)\b/.test(text)) {
    return "esports";
  }

  return "nfl";
}

export function buildNewsApiEverythingUrl(options?: FetchNewsOptions) {
  const status = getProviderStatus().newsapi;
  const url = new URL(`${status.baseUrl}/everything`);
  const query =
    options?.query ??
    (options?.sport ? defaultNewsApiQueries[options.sport] : process.env.NEWSAPI_QUERY) ??
    defaultAllSportsQuery;

  url.searchParams.set("q", query.slice(0, 500));
  url.searchParams.set("language", options?.language ?? status.language);
  url.searchParams.set("sortBy", options?.sortBy ?? "publishedAt");
  url.searchParams.set("pageSize", String(Math.min(options?.pageSize ?? status.pageSize, 100)));
  url.searchParams.set("page", String(options?.page ?? 1));

  return url;
}

export async function fetchNewsApiArticles(options?: FetchNewsOptions) {
  const apiKey = getNewsApiKey();

  if (!apiKey) {
    throw new Error("Missing NEWSAPI_API_KEY or NEWS_API_KEY.");
  }

  const response = await fetch(buildNewsApiEverythingUrl(options), {
    headers: {
      Accept: "application/json",
      "X-Api-Key": apiKey,
    },
    next: {
      revalidate: 300,
    },
  });

  const payload = (await response.json()) as NewsApiResponse;

  if (!response.ok || payload.status === "error") {
    throw new Error(`NewsAPI request failed: ${payload.code ?? response.status} ${payload.message ?? ""}`);
  }

  return payload.articles ?? [];
}

export function normalizeNewsApiArticles(articles: NewsApiArticle[], sport?: SportKey): NewsItem[] {
  return articles.map((article) => {
    const type = classifyNewsType(article);

    return {
      id: stableArticleId(article),
      sport: classifySport(article, sport),
      type,
      severity: classifySeverity(article, type),
      title: article.title,
      summary: article.description ?? article.content ?? "No article summary provided by NewsAPI.",
      source: article.source.name,
      publishedAt: article.publishedAt,
    };
  });
}

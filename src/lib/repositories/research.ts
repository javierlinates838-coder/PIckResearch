import { getProviderStatus } from "@/config/providers";
import { sportsDataProvider } from "@/lib/providers/mock-sports-data";
import {
  fetchNewsApiArticles,
  normalizeNewsApiArticles,
} from "@/lib/providers/newsapi";
import {
  fetchTheOddsApiOdds,
  normalizeTheOddsApiGames,
  normalizeTheOddsApiOdds,
} from "@/lib/providers/the-odds-api";
import type {
  DashboardData,
  DashboardDataMeta,
  MarketType,
  NewsItem,
  NewsResearchData,
  PickApp,
  PickOpportunity,
  PlayerResearchMetrics,
  SportKey,
} from "@/types/sports";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function compactProviderStatus(
  status: ReturnType<typeof getProviderStatus>,
  oddsQuota?: {
    requestsRemaining?: string | null;
    requestsUsed?: string | null;
  },
): DashboardDataMeta["providerStatus"] {
  return {
    newsapi: {
      configured: status.newsapi.configured,
      detectedAlias: status.newsapi.detectedAlias,
      publicKeyDetected: status.newsapi.publicKeyDetected,
    },
    theOddsApi: {
      configured: status.theOddsApi.configured,
      detectedAlias: status.theOddsApi.detectedAlias,
      publicKeyDetected: status.theOddsApi.publicKeyDetected,
      requestsRemaining: oddsQuota?.requestsRemaining,
      requestsUsed: oddsQuota?.requestsUsed,
    },
  };
}

const pickApps: PickApp[] = [
  "PrizePicks",
  "Underdog",
  "Sleeper",
  "DraftKings",
  "FanDuel",
  "BetMGM",
];

type FinderSort = "edge" | "confidence" | "l10" | "diff" | "streak" | "newest";

function marketLabel(market: MarketType) {
  return market.replaceAll("_", " ");
}

function derivePickOpportunity(
  edge: PlayerResearchMetrics,
  index: number,
): PickOpportunity {
  const app = pickApps[index % pickApps.length];
  const side = edge.last10Average >= edge.currentLine ? "over" : "under";
  const projection = Number(
    ((edge.last5Average * 0.4 + edge.last10Average * 0.35 + edge.seasonAverage * 0.25)).toFixed(1),
  );
  const signedDiff = Number((projection - edge.currentLine).toFixed(1));
  const diff = side === "over" ? signedDiff : Number(Math.abs(signedDiff).toFixed(1));
  const l15HitRate = Math.round((edge.hitRateLast10 * 0.65 + edge.hitRateSeason * 0.35));
  const h2hHitRate = Math.min(96, Math.max(35, Math.round(100 - edge.matchupRank * 2.1)));
  const streak = Math.max(1, Math.round(edge.hitRateLast5 / 20));
  const injuryContext = edge.riskFlags.length > 1 ? "risk" : edge.riskFlags.length ? "monitor" : "clean";
  const confidence = Math.round(
    edge.hitRateLast10 * 0.28 +
      edge.hitRateLast5 * 0.22 +
      edge.consistencyScore * 0.25 +
      h2hHitRate * 0.15 +
      Math.min(Math.abs(diff) * 8, 10),
  );
  const edgeScore = Math.round(
    confidence * 0.72 +
      Math.min(Math.abs(diff) * 8, 14) +
      Math.max(0, edge.usageTrendPct) * 0.8 +
      Math.max(0, edge.minutesTrendPct) * 0.5,
  );

  return {
    id: `finder:${edge.player.id}:${edge.propMarket}:${app}`,
    sport: edge.player.sport,
    player: edge.player,
    team: edge.team,
    opponent: edge.opponent,
    market: edge.propMarket,
    app,
    line: edge.currentLine,
    side,
    projection,
    diff,
    l5HitRate: edge.hitRateLast5,
    l10HitRate: edge.hitRateLast10,
    l15HitRate,
    seasonHitRate: edge.hitRateSeason,
    h2hHitRate,
    streak,
    opponentRank: edge.matchupRank,
    consistencyScore: edge.consistencyScore,
    confidence: Math.min(confidence, 99),
    edgeScore: Math.min(edgeScore, 99),
    status: "demo",
    injuryContext,
    tags: [
      `${marketLabel(edge.propMarket)}`,
      `${edge.team.abbreviation} vs ${edge.opponent.abbreviation}`,
      `${side.toUpperCase()} lean`,
      injuryContext === "clean" ? "No major flags" : "Monitor news",
    ],
    rationale: `${edge.player.name} projects ${Math.abs(diff).toFixed(1)} ${side === "over" ? "above" : "below"} the ${edge.currentLine} line using recent averages, matchup rank #${edge.matchupRank}, and ${edge.consistencyScore}/100 consistency.`,
  };
}

async function getLiveOddsData(filters?: { sport?: SportKey }) {
  if (!getProviderStatus().theOddsApi.configured) {
    return {
      data: null,
      error: undefined,
    };
  }

  try {
    const result = await fetchTheOddsApiOdds({
      sport: filters?.sport,
    });
    const games = normalizeTheOddsApiGames(result.events);
    const odds = normalizeTheOddsApiOdds(result.events);

    return {
      data: {
        games,
        odds,
        diagnostics: result.diagnostics,
      },
      error: result.diagnostics.errors.length ? result.diagnostics.errors.join("; ") : undefined,
    };
  } catch (error) {
    return {
      data: null,
      error: errorMessage(error),
    };
  }
}

async function getLiveNewsData(filters?: {
  sport?: SportKey;
  severity?: NewsItem["severity"];
  type?: NewsItem["type"];
}) {
  if (!getProviderStatus().newsapi.configured) {
    return {
      data: null,
      error: undefined,
    };
  }

  try {
    const articles = await fetchNewsApiArticles({
      sport: filters?.sport,
    });
    const normalized = normalizeNewsApiArticles(articles, filters?.sport);

    return {
      data: normalized.filter((item) => {
        const matchesSeverity = filters?.severity ? item.severity === filters.severity : true;
        const matchesType = filters?.type ? item.type === filters.type : true;

        return matchesSeverity && matchesType;
      }),
      error: undefined,
    };
  } catch (error) {
    return {
      data: null,
      error: errorMessage(error),
    };
  }
}

export async function getDashboardResearch(filters?: { sport?: SportKey }): Promise<DashboardData> {
  const providerStatus = getProviderStatus();
  const [
    mockGames,
    mockOdds,
    mockSplits,
    mockNews,
    playerEdges,
    teamTrends,
    liveOddsResult,
    liveNewsResult,
  ] = await Promise.all([
    sportsDataProvider.listGames(filters),
    sportsDataProvider.listOdds(filters),
    sportsDataProvider.listBettingSplits(filters),
    sportsDataProvider.listNews(filters),
    sportsDataProvider.listPlayerEdges(filters),
    sportsDataProvider.listTeamTrends(filters),
    getLiveOddsData(filters),
    getLiveNewsData(filters),
  ]);
  const liveOdds = liveOddsResult.data;
  const liveNews = liveNewsResult.data;
  const usingLiveOdds = Boolean(providerStatus.theOddsApi.configured && liveOdds);
  const usingLiveNews = Boolean(providerStatus.newsapi.configured && liveNews);
  const warnings: string[] = [];

  if (!providerStatus.theOddsApi.configured) {
    warnings.push("The Odds API is not configured, so games and odds are demo data.");
  } else if (!liveOdds) {
    warnings.push("The Odds API is configured but unavailable; games and odds fell back to demo data.");
  } else if (!liveOdds.games.length) {
    warnings.push("The Odds API returned no upcoming events for this filter.");
  }

  if (!providerStatus.newsapi.configured) {
    warnings.push("NewsAPI is not configured, so news is demo data.");
  } else if (!liveNews) {
    warnings.push("NewsAPI is configured but unavailable; news fell back to demo data.");
  } else if (!liveNews.length) {
    warnings.push("NewsAPI returned no articles for this filter.");
  }

  if (usingLiveOdds) {
    warnings.push(
      "Public betting splits are not included in The Odds API response; add a splits provider or database ingestion before showing sharp/public signals.",
    );
    warnings.push(
      "Live line movement needs persisted odds snapshots; current live odds show the latest provider price.",
    );
  }

  return {
    games: liveOdds?.games ?? mockGames,
    odds: liveOdds?.odds ?? mockOdds,
    splits: usingLiveOdds ? [] : mockSplits,
    news: liveNews ?? mockNews,
    playerEdges,
    teamTrends,
    meta: {
      fetchedAt: new Date().toISOString(),
      sources: {
        games: usingLiveOdds ? "theoddsapi" : "mock",
        odds: usingLiveOdds ? "theoddsapi" : "mock",
        splits: usingLiveOdds ? "unavailable" : "mock",
        news: usingLiveNews ? "newsapi" : "mock",
        playerEdges: "mock",
        teamTrends: "mock",
      },
      providerStatus: compactProviderStatus(providerStatus, {
        requestsRemaining: liveOdds?.diagnostics.requestsRemaining,
        requestsUsed: liveOdds?.diagnostics.requestsUsed,
      }),
      providerErrors: {
        theOddsApi: liveOddsResult.error,
        newsapi: liveNewsResult.error,
      },
      warnings,
    },
  };
}

export async function listPlayers(filters?: { sport?: SportKey; query?: string }) {
  return sportsDataProvider.listPlayers(filters);
}

export async function listPickOpportunities(filters?: {
  sport?: SportKey;
  query?: string;
  market?: MarketType;
  app?: PickApp;
  minHitRate?: number;
  sort?: FinderSort;
}) {
  const edges = await sportsDataProvider.listPlayerEdges({
    sport: filters?.sport,
  });
  const query = filters?.query?.toLowerCase();
  const opportunities = edges
    .flatMap((edge, index) => [
      derivePickOpportunity(edge, index),
      {
        ...derivePickOpportunity(edge, index + 2),
        id: `finder:${edge.player.id}:${edge.propMarket}:alt`,
        app: pickApps[(index + 2) % pickApps.length],
        line: Number((edge.currentLine + (index % 2 === 0 ? 0.5 : -0.5)).toFixed(1)),
        edgeScore: Math.max(1, derivePickOpportunity(edge, index).edgeScore - 4),
      },
    ])
    .filter((item) => {
      const matchesQuery = query
        ? `${item.player.name} ${item.team.abbreviation} ${item.opponent.abbreviation}`
            .toLowerCase()
            .includes(query)
        : true;
      const matchesMarket = filters?.market ? item.market === filters.market : true;
      const matchesApp = filters?.app ? item.app === filters.app : true;
      const matchesHitRate = filters?.minHitRate ? item.l10HitRate >= filters.minHitRate : true;

      return matchesQuery && matchesMarket && matchesApp && matchesHitRate;
    });

  const sort = filters?.sort ?? "edge";
  const sorters = {
    edge: (a: PickOpportunity, b: PickOpportunity) => b.edgeScore - a.edgeScore,
    confidence: (a: PickOpportunity, b: PickOpportunity) => b.confidence - a.confidence,
    l10: (a: PickOpportunity, b: PickOpportunity) => b.l10HitRate - a.l10HitRate,
    diff: (a: PickOpportunity, b: PickOpportunity) => Math.abs(b.diff) - Math.abs(a.diff),
    streak: (a: PickOpportunity, b: PickOpportunity) => b.streak - a.streak,
    newest: (a: PickOpportunity, b: PickOpportunity) => b.id.localeCompare(a.id),
  } satisfies Record<FinderSort, (a: PickOpportunity, b: PickOpportunity) => number>;

  return opportunities.sort(sorters[sort]);
}

export async function getPlayerResearch(playerId: string) {
  return sportsDataProvider.getPlayerResearch(playerId);
}

export async function listTeams(filters?: { sport?: SportKey; query?: string }) {
  return sportsDataProvider.listTeams(filters);
}

export async function getTeamResearch(teamId: string) {
  return sportsDataProvider.getTeamResearch(teamId);
}

export async function listNews(filters?: {
  sport?: SportKey;
  severity?: NewsItem["severity"];
  type?: NewsItem["type"];
}) {
  const liveNews = await getLiveNewsData(filters);

  return liveNews.data ?? sportsDataProvider.listNews(filters);
}

export async function getNewsResearch(filters?: {
  sport?: SportKey;
  severity?: NewsItem["severity"];
  type?: NewsItem["type"];
}): Promise<NewsResearchData> {
  const providerStatus = getProviderStatus();
  const liveNews = await getLiveNewsData(filters);
  const usingLiveNews = Boolean(providerStatus.newsapi.configured && liveNews.data);
  const items = liveNews.data ?? (await sportsDataProvider.listNews(filters));
  const warnings: string[] = [];

  if (!providerStatus.newsapi.configured) {
    warnings.push("NewsAPI is not configured, so this feed is showing demo news.");
  } else if (!liveNews.data) {
    warnings.push("NewsAPI is configured but unavailable; this feed fell back to demo news.");
  } else if (!liveNews.data.length) {
    warnings.push("NewsAPI returned no articles for this filter.");
  }

  return {
    items,
    meta: {
      fetchedAt: new Date().toISOString(),
      source: usingLiveNews ? "newsapi" : "mock",
      providerStatus: compactProviderStatus(providerStatus).newsapi,
      providerError: liveNews.error,
      warnings,
    },
  };
}

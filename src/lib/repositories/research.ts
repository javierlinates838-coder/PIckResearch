import { getProviderStatus } from "@/config/providers";
import {
  getDfsPlayerResearch,
  getDfsDataSummary,
  listDfsOpportunities,
  listDfsPlayers,
} from "@/lib/dfs/props-data";
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

type FinderSort = "edge" | "confidence" | "l10" | "diff" | "streak" | "newest";

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
  return listDfsPlayers(filters);
}

export async function listPickOpportunities(filters?: {
  sport?: SportKey;
  query?: string;
  market?: MarketType;
  app?: PickApp;
  minHitRate?: number;
  sort?: FinderSort;
}) {
  return listDfsOpportunities(filters);
}

export async function getPlayerResearch(playerId: string) {
  return sportsDataProvider.getPlayerResearch(playerId);
}

export async function getDfsResearch(playerId: string) {
  return getDfsPlayerResearch(playerId);
}

export async function getDfsSummary() {
  return getDfsDataSummary();
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

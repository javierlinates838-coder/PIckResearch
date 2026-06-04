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
  fetchTheOddsApiPlayerProps,
  normalizeTheOddsApiGames,
  normalizeTheOddsApiOdds,
  normalizeTheOddsApiPlayerProps,
} from "@/lib/providers/the-odds-api";
import type {
  DfsPlayerResearch,
  DashboardData,
  DashboardDataMeta,
  PickOpportunity,
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

function searchableOpportunityText(item: PickOpportunity) {
  return [
    item.player.name,
    item.player.position,
    item.team.name,
    item.team.abbreviation,
    item.opponent.name,
    item.opponent.abbreviation,
    item.market,
    item.market.replace("player_", "").replaceAll("_", " "),
    item.app,
    item.sportsbook,
    item.side,
    item.tags.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterAndSortOpportunities(
  opportunities: PickOpportunity[],
  filters?: {
    sport?: SportKey;
    query?: string;
    market?: MarketType;
    app?: PickApp;
    minHitRate?: number;
    sort?: FinderSort;
  },
) {
  const query = filters?.query?.toLowerCase();
  const filtered = opportunities.filter((item) => {
    const matchesSport = filters?.sport ? item.sport === filters.sport : true;
    const matchesQuery = query ? searchableOpportunityText(item).includes(query) : true;
    const matchesMarket = filters?.market ? item.market === filters.market : true;
    const matchesApp = filters?.app ? item.app === filters.app : true;
    const matchesHitRate = filters?.minHitRate ? item.l10HitRate >= filters.minHitRate : true;

    return matchesSport && matchesQuery && matchesMarket && matchesApp && matchesHitRate;
  });
  const sort = filters?.sort ?? "edge";
  const sorters = {
    edge: (a: PickOpportunity, b: PickOpportunity) => b.edgeScore - a.edgeScore,
    confidence: (a: PickOpportunity, b: PickOpportunity) => b.confidence - a.confidence,
    l10: (a: PickOpportunity, b: PickOpportunity) => b.l10HitRate - a.l10HitRate,
    diff: (a: PickOpportunity, b: PickOpportunity) => b.diff - a.diff,
    streak: (a: PickOpportunity, b: PickOpportunity) => b.streak - a.streak,
    newest: (a: PickOpportunity, b: PickOpportunity) => b.id.localeCompare(a.id),
  } satisfies Record<FinderSort, (a: PickOpportunity, b: PickOpportunity) => number>;

  return filtered.sort(sorters[sort]);
}

async function getLivePlayerProps(filters?: { sport?: SportKey; market?: MarketType }) {
  if (!getProviderStatus().theOddsApi.configured) {
    return {
      data: null,
      error: undefined,
    };
  }

  try {
    const result = await fetchTheOddsApiPlayerProps({
      sport: filters?.sport,
      markets: filters?.market,
    });

    return {
      data: normalizeTheOddsApiPlayerProps(result.events),
      error: result.diagnostics.errors.length ? result.diagnostics.errors.join("; ") : undefined,
    };
  } catch (error) {
    return {
      data: null,
      error: errorMessage(error),
    };
  }
}

function liveResearchFromOpportunity(prop: PickOpportunity): DfsPlayerResearch {
  return {
    player: prop.player,
    team: prop.team,
    primaryMarket: prop.market,
    currentLine: prop.line,
    projection: prop.projection,
    last5Average: 0,
    last10Average: 0,
    last15Average: 0,
    seasonAverage: 0,
    l5HitRate: 0,
    l10HitRate: 0,
    l15HitRate: 0,
    seasonHitRate: 0,
    streak: 0,
    consistencyScore: 0,
    usageTrendPct: 0,
    minutesTrendPct: 0,
    matchup: {
      opponent: prop.opponent.name,
      defenseVsPositionRank: 0,
      note:
        "Live OddsAPI player-prop line loaded. Add a DFS/stat-log provider to calculate DvP, hit rates, and game-log trends.",
    },
    injuryStatus: "monitor",
    logs: [],
    availableProps: [prop],
    source: "theoddsapi",
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
  if (getProviderStatus().theOddsApi.configured) {
    const liveProps = await getLivePlayerProps({ sport: filters?.sport });
    const opportunities = liveProps.data ?? [];
    const uniquePlayers = Array.from(new Map(opportunities.map((item) => [item.player.id, item.player])).values());
    const query = filters?.query?.toLowerCase();

    return uniquePlayers.filter((player) =>
      query ? `${player.name} ${player.position}`.toLowerCase().includes(query) : true,
    );
  }

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
  if (getProviderStatus().theOddsApi.configured) {
    const liveProps = await getLivePlayerProps({
      sport: filters?.sport,
      market: filters?.market,
    });

    return filterAndSortOpportunities(liveProps.data ?? [], filters);
  }

  return listDfsOpportunities(filters);
}

export async function getPlayerResearch(playerId: string) {
  return sportsDataProvider.getPlayerResearch(playerId);
}

export async function getDfsResearch(playerId: string) {
  const demoResearch = getDfsPlayerResearch(playerId);

  if (demoResearch) {
    return demoResearch;
  }

  if (getProviderStatus().theOddsApi.configured) {
    const liveProps = await getLivePlayerProps();
    const prop = liveProps.data?.find((item) => item.player.id === playerId);

    return prop ? liveResearchFromOpportunity(prop) : null;
  }

  return null;
}

export async function getDfsSummary() {
  const summary = getDfsDataSummary();

  if (getProviderStatus().theOddsApi.configured) {
    return {
      ...summary,
      source: "theoddsapi" as const,
      providerConfigured: true,
      expectedProviderKey: "ODDSAPI",
    };
  }

  return summary;
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

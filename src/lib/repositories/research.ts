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
import type { NewsItem, SportKey } from "@/types/sports";

async function getLiveOddsData(filters?: { sport?: SportKey }) {
  if (!getProviderStatus().theOddsApi.configured) {
    return null;
  }

  try {
    const events = await fetchTheOddsApiOdds({
      sport: filters?.sport,
    });

    return {
      games: normalizeTheOddsApiGames(events),
      odds: normalizeTheOddsApiOdds(events),
    };
  } catch (error) {
    console.warn(error);
    return null;
  }
}

async function getLiveNewsData(filters?: {
  sport?: SportKey;
  severity?: NewsItem["severity"];
  type?: NewsItem["type"];
}) {
  if (!getProviderStatus().newsapi.configured) {
    return null;
  }

  try {
    const articles = await fetchNewsApiArticles({
      sport: filters?.sport,
    });
    const normalized = normalizeNewsApiArticles(articles, filters?.sport);

    return normalized.filter((item) => {
      const matchesSeverity = filters?.severity ? item.severity === filters.severity : true;
      const matchesType = filters?.type ? item.type === filters.type : true;

      return matchesSeverity && matchesType;
    });
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function getDashboardResearch(filters?: { sport?: SportKey }) {
  const [mockGames, mockOdds, splits, mockNews, playerEdges, teamTrends, liveOdds, liveNews] =
    await Promise.all([
      sportsDataProvider.listGames(filters),
      sportsDataProvider.listOdds(filters),
      sportsDataProvider.listBettingSplits(filters),
      sportsDataProvider.listNews(filters),
      sportsDataProvider.listPlayerEdges(filters),
      sportsDataProvider.listTeamTrends(filters),
      getLiveOddsData(filters),
      getLiveNewsData(filters),
    ]);

  return {
    games: liveOdds?.games ?? mockGames,
    odds: liveOdds?.odds ?? mockOdds,
    splits,
    news: liveNews ?? mockNews,
    playerEdges,
    teamTrends,
  };
}

export async function listPlayers(filters?: { sport?: SportKey; query?: string }) {
  return sportsDataProvider.listPlayers(filters);
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
  return (await getLiveNewsData(filters)) ?? sportsDataProvider.listNews(filters);
}

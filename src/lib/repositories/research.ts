import { sportsDataProvider } from "@/lib/providers/mock-sports-data";
import type { NewsItem, SportKey } from "@/types/sports";

export async function getDashboardResearch(filters?: { sport?: SportKey }) {
  const [games, odds, splits, news, playerEdges, teamTrends] = await Promise.all([
    sportsDataProvider.listGames(filters),
    sportsDataProvider.listOdds(filters),
    sportsDataProvider.listBettingSplits(filters),
    sportsDataProvider.listNews(filters),
    sportsDataProvider.listPlayerEdges(filters),
    sportsDataProvider.listTeamTrends(filters),
  ]);

  return {
    games,
    odds,
    splits,
    news,
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
  return sportsDataProvider.listNews(filters);
}

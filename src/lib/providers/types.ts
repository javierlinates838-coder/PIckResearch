import type {
  BettingSplit,
  Game,
  NewsItem,
  OddsSnapshot,
  Player,
  PlayerResearchMetrics,
  SportKey,
  Team,
  TeamResearchMetrics,
} from "@/types/sports";

export interface SportsDataProvider {
  listGames(filters?: { sport?: SportKey }): Promise<Game[]>;
  listOdds(filters?: { sport?: SportKey; gameId?: string }): Promise<OddsSnapshot[]>;
  listBettingSplits(filters?: { sport?: SportKey; gameId?: string }): Promise<BettingSplit[]>;
  listNews(filters?: {
    sport?: SportKey;
    severity?: NewsItem["severity"];
    type?: NewsItem["type"];
  }): Promise<NewsItem[]>;
  listPlayers(filters?: { sport?: SportKey; query?: string }): Promise<Player[]>;
  listTeams(filters?: { sport?: SportKey; query?: string }): Promise<Team[]>;
  getPlayerResearch(id: string): Promise<PlayerResearchMetrics | null>;
  getTeamResearch(id: string): Promise<TeamResearchMetrics | null>;
  listPlayerEdges(filters?: { sport?: SportKey }): Promise<PlayerResearchMetrics[]>;
  listTeamTrends(filters?: { sport?: SportKey }): Promise<TeamResearchMetrics[]>;
}

export type SportKey =
  | "nba"
  | "mlb"
  | "nfl"
  | "nhl"
  | "tennis"
  | "soccer"
  | "esports";

export type MarketType =
  | "moneyline"
  | "spread"
  | "total"
  | "player_points"
  | "player_rebounds"
  | "player_assists"
  | "player_shots"
  | "player_strikeouts"
  | "player_kills";

export type NewsType =
  | "injury"
  | "suspension"
  | "lineup"
  | "coaching"
  | "transaction"
  | "general";

export type Severity = "low" | "medium" | "high" | "critical";

export type SharpSide = "home" | "away" | "over" | "under" | "none";

export type PickResult = "pending" | "win" | "loss" | "push" | "void";

export type ResearchDataSource =
  | "theoddsapi"
  | "newsapi"
  | "mock"
  | "supabase"
  | "unavailable";

export interface Sport {
  key: SportKey;
  label: string;
  description: string;
}

export interface Team {
  id: string;
  sport: SportKey;
  league: string;
  name: string;
  abbreviation: string;
  city?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Player {
  id: string;
  sport: SportKey;
  teamId: string;
  name: string;
  position: string;
  jerseyNumber?: string;
}

export interface Game {
  id: string;
  sport: SportKey;
  league: string;
  startsAt: string;
  homeTeam: Team;
  awayTeam: Team;
  venue: string;
  status: "scheduled" | "live" | "final";
}

export interface OddsSnapshot {
  id: string;
  gameId: string;
  sportsbook: string;
  market: MarketType;
  selection: string;
  line: number;
  price: number;
  openingLine: number;
  openingPrice: number;
  capturedAt: string;
}

export interface BettingSplit {
  id: string;
  gameId: string;
  market: MarketType;
  selection: string;
  publicTicketsPct: number;
  publicMoneyPct: number;
  sharpSide: SharpSide;
  confidence: number;
}

export interface NewsItem {
  id: string;
  sport: SportKey;
  type: NewsType;
  severity: Severity;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url?: string;
  playerId?: string;
  teamId?: string;
  gameId?: string;
}

export interface PlayerResearchMetrics {
  player: Player;
  team: Team;
  opponent: Team;
  propMarket: MarketType;
  currentLine: number;
  last5Average: number;
  last10Average: number;
  seasonAverage: number;
  homeAverage: number;
  awayAverage: number;
  usageTrendPct: number;
  minutesTrendPct: number;
  consistencyScore: number;
  hitRateLast5: number;
  hitRateLast10: number;
  hitRateSeason: number;
  matchupRank: number;
  matchupNote: string;
  riskFlags: string[];
}

export interface TeamResearchMetrics {
  team: Team;
  offensiveRating: number;
  defensiveRating: number;
  pace: number;
  recentForm: string;
  netRatingTrend: number;
  injuryImpact: "low" | "medium" | "high";
  trendSummary: string;
}

export interface AiAnalysis {
  summary: string;
  matchupAdvantages: string[];
  risks: string[];
  valuation: string;
}

export interface DashboardDataMeta {
  fetchedAt: string;
  sources: {
    games: ResearchDataSource;
    odds: ResearchDataSource;
    splits: ResearchDataSource;
    news: ResearchDataSource;
    playerEdges: ResearchDataSource;
    teamTrends: ResearchDataSource;
  };
  providerStatus: {
    newsapi: {
      configured: boolean;
      detectedAlias: string | null;
      publicKeyDetected: boolean;
    };
    theOddsApi: {
      configured: boolean;
      detectedAlias: string | null;
      publicKeyDetected: boolean;
      requestsRemaining?: string | null;
      requestsUsed?: string | null;
    };
  };
  providerErrors: {
    newsapi?: string;
    theOddsApi?: string;
  };
  warnings: string[];
}

export interface DashboardData {
  games: Game[];
  odds: OddsSnapshot[];
  splits: BettingSplit[];
  news: NewsItem[];
  playerEdges: PlayerResearchMetrics[];
  teamTrends: TeamResearchMetrics[];
  meta: DashboardDataMeta;
}

export interface NewsResearchData {
  items: NewsItem[];
  meta: {
    fetchedAt: string;
    source: ResearchDataSource;
    providerStatus: DashboardDataMeta["providerStatus"]["newsapi"];
    providerError?: string;
    warnings: string[];
  };
}

export type PickApp =
  | "PrizePicks"
  | "Underdog"
  | "Sleeper"
  | "DraftKings"
  | "FanDuel"
  | "BetMGM";

export interface PickOpportunity {
  id: string;
  sport: SportKey;
  player: Player;
  team: Team;
  opponent: Team;
  market: MarketType;
  app: PickApp;
  line: number;
  side: "over" | "under";
  projection: number;
  diff: number;
  l5HitRate: number;
  l10HitRate: number;
  l15HitRate: number;
  seasonHitRate: number;
  h2hHitRate: number;
  streak: number;
  opponentRank: number;
  consistencyScore: number;
  confidence: number;
  edgeScore: number;
  status: "live" | "demo";
  injuryContext: "clean" | "monitor" | "risk";
  tags: string[];
  rationale: string;
}

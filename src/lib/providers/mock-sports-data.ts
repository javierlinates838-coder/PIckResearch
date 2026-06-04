import type {
  BettingSplit,
  DashboardData,
  Game,
  NewsItem,
  OddsSnapshot,
  Player,
  PlayerResearchMetrics,
  SportKey,
  Team,
  TeamResearchMetrics,
} from "@/types/sports";
import type { SportsDataProvider } from "@/lib/providers/types";

const teams: Team[] = [
  {
    id: "team-celtics",
    sport: "nba",
    league: "NBA",
    name: "Celtics",
    abbreviation: "BOS",
    city: "Boston",
    primaryColor: "#007A33",
    secondaryColor: "#BA9653",
  },
  {
    id: "team-knicks",
    sport: "nba",
    league: "NBA",
    name: "Knicks",
    abbreviation: "NYK",
    city: "New York",
    primaryColor: "#006BB6",
    secondaryColor: "#F58426",
  },
  {
    id: "team-dodgers",
    sport: "mlb",
    league: "MLB",
    name: "Dodgers",
    abbreviation: "LAD",
    city: "Los Angeles",
    primaryColor: "#005A9C",
    secondaryColor: "#EF3E42",
  },
  {
    id: "team-yankees",
    sport: "mlb",
    league: "MLB",
    name: "Yankees",
    abbreviation: "NYY",
    city: "New York",
    primaryColor: "#003087",
    secondaryColor: "#E4002B",
  },
  {
    id: "team-chiefs",
    sport: "nfl",
    league: "NFL",
    name: "Chiefs",
    abbreviation: "KC",
    city: "Kansas City",
    primaryColor: "#E31837",
    secondaryColor: "#FFB81C",
  },
  {
    id: "team-ravens",
    sport: "nfl",
    league: "NFL",
    name: "Ravens",
    abbreviation: "BAL",
    city: "Baltimore",
    primaryColor: "#241773",
    secondaryColor: "#9E7C0C",
  },
  {
    id: "team-oilers",
    sport: "nhl",
    league: "NHL",
    name: "Oilers",
    abbreviation: "EDM",
    city: "Edmonton",
    primaryColor: "#041E42",
    secondaryColor: "#FF4C00",
  },
  {
    id: "team-panthers",
    sport: "nhl",
    league: "NHL",
    name: "Panthers",
    abbreviation: "FLA",
    city: "Florida",
    primaryColor: "#041E42",
    secondaryColor: "#C8102E",
  },
  {
    id: "team-arsenal",
    sport: "soccer",
    league: "EPL",
    name: "Arsenal",
    abbreviation: "ARS",
    city: "London",
    primaryColor: "#EF0107",
    secondaryColor: "#063672",
  },
  {
    id: "team-city",
    sport: "soccer",
    league: "EPL",
    name: "Manchester City",
    abbreviation: "MCI",
    city: "Manchester",
    primaryColor: "#6CABDD",
    secondaryColor: "#1C2C5B",
  },
  {
    id: "team-g2",
    sport: "esports",
    league: "LCK",
    name: "G2 Esports",
    abbreviation: "G2",
    primaryColor: "#111827",
    secondaryColor: "#D1D5DB",
  },
  {
    id: "team-t1",
    sport: "esports",
    league: "LCK",
    name: "T1",
    abbreviation: "T1",
    primaryColor: "#E4002B",
    secondaryColor: "#111827",
  },
];

const players: Player[] = [
  {
    id: "player-tatum",
    sport: "nba",
    teamId: "team-celtics",
    name: "Jayson Tatum",
    position: "F",
    jerseyNumber: "0",
  },
  {
    id: "player-brunson",
    sport: "nba",
    teamId: "team-knicks",
    name: "Jalen Brunson",
    position: "G",
    jerseyNumber: "11",
  },
  {
    id: "player-ohtani",
    sport: "mlb",
    teamId: "team-dodgers",
    name: "Shohei Ohtani",
    position: "DH",
    jerseyNumber: "17",
  },
  {
    id: "player-judge",
    sport: "mlb",
    teamId: "team-yankees",
    name: "Aaron Judge",
    position: "OF",
    jerseyNumber: "99",
  },
  {
    id: "player-mahomes",
    sport: "nfl",
    teamId: "team-chiefs",
    name: "Patrick Mahomes",
    position: "QB",
    jerseyNumber: "15",
  },
  {
    id: "player-mcdavid",
    sport: "nhl",
    teamId: "team-oilers",
    name: "Connor McDavid",
    position: "C",
    jerseyNumber: "97",
  },
  {
    id: "player-saka",
    sport: "soccer",
    teamId: "team-arsenal",
    name: "Bukayo Saka",
    position: "RW",
    jerseyNumber: "7",
  },
  {
    id: "player-faker",
    sport: "esports",
    teamId: "team-t1",
    name: "Faker",
    position: "Mid",
  },
];

const games: Game[] = [
  {
    id: "game-celtics-knicks",
    sport: "nba",
    league: "NBA",
    startsAt: "2026-06-04T23:30:00.000Z",
    homeTeam: teams[0],
    awayTeam: teams[1],
    venue: "TD Garden",
    status: "scheduled",
  },
  {
    id: "game-dodgers-yankees",
    sport: "mlb",
    league: "MLB",
    startsAt: "2026-06-05T00:10:00.000Z",
    homeTeam: teams[2],
    awayTeam: teams[3],
    venue: "Dodger Stadium",
    status: "scheduled",
  },
  {
    id: "game-chiefs-ravens",
    sport: "nfl",
    league: "NFL",
    startsAt: "2026-06-05T01:20:00.000Z",
    homeTeam: teams[4],
    awayTeam: teams[5],
    venue: "Arrowhead Stadium",
    status: "scheduled",
  },
  {
    id: "game-oilers-panthers",
    sport: "nhl",
    league: "NHL",
    startsAt: "2026-06-05T02:00:00.000Z",
    homeTeam: teams[6],
    awayTeam: teams[7],
    venue: "Rogers Place",
    status: "scheduled",
  },
  {
    id: "game-arsenal-city",
    sport: "soccer",
    league: "EPL",
    startsAt: "2026-06-05T16:30:00.000Z",
    homeTeam: teams[8],
    awayTeam: teams[9],
    venue: "Emirates Stadium",
    status: "scheduled",
  },
  {
    id: "game-t1-g2",
    sport: "esports",
    league: "LCK",
    startsAt: "2026-06-05T18:00:00.000Z",
    homeTeam: teams[11],
    awayTeam: teams[10],
    venue: "LoL Park",
    status: "scheduled",
  },
];

const odds: OddsSnapshot[] = [
  {
    id: "odds-1",
    gameId: "game-celtics-knicks",
    sportsbook: "DraftKings",
    market: "player_points",
    selection: "Jayson Tatum over",
    line: 28.5,
    price: -112,
    openingLine: 27.5,
    openingPrice: -105,
    capturedAt: "2026-06-04T17:00:00.000Z",
  },
  {
    id: "odds-2",
    gameId: "game-celtics-knicks",
    sportsbook: "FanDuel",
    market: "spread",
    selection: "BOS -4.5",
    line: -4.5,
    price: -108,
    openingLine: -3.5,
    openingPrice: -110,
    capturedAt: "2026-06-04T17:00:00.000Z",
  },
  {
    id: "odds-3",
    gameId: "game-dodgers-yankees",
    sportsbook: "BetMGM",
    market: "player_strikeouts",
    selection: "Starter strikeouts over",
    line: 6.5,
    price: 104,
    openingLine: 5.5,
    openingPrice: -118,
    capturedAt: "2026-06-04T17:00:00.000Z",
  },
  {
    id: "odds-4",
    gameId: "game-chiefs-ravens",
    sportsbook: "Caesars",
    market: "total",
    selection: "Over",
    line: 48.5,
    price: -110,
    openingLine: 47.5,
    openingPrice: -110,
    capturedAt: "2026-06-04T17:00:00.000Z",
  },
];

const splits: BettingSplit[] = [
  {
    id: "split-1",
    gameId: "game-celtics-knicks",
    market: "spread",
    selection: "BOS -4.5",
    publicTicketsPct: 42,
    publicMoneyPct: 68,
    sharpSide: "home",
    confidence: 82,
  },
  {
    id: "split-2",
    gameId: "game-celtics-knicks",
    market: "player_points",
    selection: "Jayson Tatum over 28.5",
    publicTicketsPct: 61,
    publicMoneyPct: 48,
    sharpSide: "under",
    confidence: 63,
  },
  {
    id: "split-3",
    gameId: "game-dodgers-yankees",
    market: "player_strikeouts",
    selection: "Over 6.5 strikeouts",
    publicTicketsPct: 35,
    publicMoneyPct: 71,
    sharpSide: "over",
    confidence: 77,
  },
];

const news: NewsItem[] = [
  {
    id: "news-1",
    sport: "nba",
    type: "injury",
    severity: "high",
    title: "Knicks list starting wing questionable",
    summary:
      "New York's defensive wing is managing knee soreness, increasing creation load for Jalen Brunson if inactive.",
    source: "Mock Injury Wire",
    publishedAt: "2026-06-04T16:25:00.000Z",
    teamId: "team-knicks",
    gameId: "game-celtics-knicks",
  },
  {
    id: "news-2",
    sport: "mlb",
    type: "lineup",
    severity: "medium",
    title: "Dodgers move Ohtani into leadoff spot",
    summary:
      "The lineup shuffle adds plate appearance expectation and slightly improves run/RBI correlation props.",
    source: "Mock Lineup Desk",
    publishedAt: "2026-06-04T15:50:00.000Z",
    playerId: "player-ohtani",
    teamId: "team-dodgers",
    gameId: "game-dodgers-yankees",
  },
  {
    id: "news-3",
    sport: "nfl",
    type: "general",
    severity: "low",
    title: "Chiefs report faster practice tempo",
    summary:
      "Beat reports noted more no-huddle reps, a possible early signal for elevated neutral-script pace.",
    source: "Mock Beat Report",
    publishedAt: "2026-06-04T14:30:00.000Z",
    teamId: "team-chiefs",
    gameId: "game-chiefs-ravens",
  },
  {
    id: "news-4",
    sport: "soccer",
    type: "lineup",
    severity: "critical",
    title: "Manchester City rotation expected",
    summary:
      "Multiple starters may be rested, creating uncertainty across goal scorer and assist markets.",
    source: "Mock XI Tracker",
    publishedAt: "2026-06-04T13:45:00.000Z",
    teamId: "team-city",
    gameId: "game-arsenal-city",
  },
];

const playerResearch: PlayerResearchMetrics[] = [
  {
    player: players[0],
    team: teams[0],
    opponent: teams[1],
    propMarket: "player_points",
    currentLine: 28.5,
    last5Average: 31.2,
    last10Average: 29.8,
    seasonAverage: 27.9,
    homeAverage: 30.1,
    awayAverage: 26.8,
    usageTrendPct: 7.4,
    minutesTrendPct: 4.2,
    consistencyScore: 84,
    hitRateLast5: 80,
    hitRateLast10: 70,
    hitRateSeason: 58,
    matchupRank: 22,
    matchupNote:
      "New York allows above-average isolation efficiency to high-usage forwards over the last month.",
    riskFlags: ["Line moved up one point", "Potential fourth-quarter blowout risk"],
  },
  {
    player: players[1],
    team: teams[1],
    opponent: teams[0],
    propMarket: "player_assists",
    currentLine: 7.5,
    last5Average: 8.6,
    last10Average: 7.9,
    seasonAverage: 6.8,
    homeAverage: 6.5,
    awayAverage: 7.2,
    usageTrendPct: 5.1,
    minutesTrendPct: 2.8,
    consistencyScore: 78,
    hitRateLast5: 80,
    hitRateLast10: 60,
    hitRateSeason: 52,
    matchupRank: 9,
    matchupNote:
      "Boston forces drives into help, creating kick-out assist chances when New York spaces correctly.",
    riskFlags: ["Questionable teammate status changes usage mix"],
  },
  {
    player: players[2],
    team: teams[2],
    opponent: teams[3],
    propMarket: "player_shots",
    currentLine: 1.5,
    last5Average: 2.2,
    last10Average: 2,
    seasonAverage: 1.8,
    homeAverage: 2.1,
    awayAverage: 1.5,
    usageTrendPct: 3.8,
    minutesTrendPct: 0,
    consistencyScore: 73,
    hitRateLast5: 80,
    hitRateLast10: 70,
    hitRateSeason: 55,
    matchupRank: 18,
    matchupNote:
      "Projected leadoff role increases plate appearances against a bullpen with elevated hard-contact rate.",
    riskFlags: ["Weather can suppress carry", "Late pinch-hit risk if game separates"],
  },
  {
    player: players[4],
    team: teams[4],
    opponent: teams[5],
    propMarket: "total",
    currentLine: 275.5,
    last5Average: 291.6,
    last10Average: 284.3,
    seasonAverage: 271.8,
    homeAverage: 286.1,
    awayAverage: 259.4,
    usageTrendPct: 4.5,
    minutesTrendPct: 1.1,
    consistencyScore: 69,
    hitRateLast5: 60,
    hitRateLast10: 60,
    hitRateSeason: 51,
    matchupRank: 14,
    matchupNote:
      "Baltimore pressure rate creates volatility, but Kansas City pass rate rises in competitive scripts.",
    riskFlags: ["Sack pressure", "Weather and wind need confirmation"],
  },
];

const teamResearch: TeamResearchMetrics[] = [
  {
    team: teams[0],
    offensiveRating: 121.4,
    defensiveRating: 111.2,
    pace: 99.1,
    recentForm: "7-3 last 10",
    netRatingTrend: 6.8,
    injuryImpact: "low",
    trendSummary:
      "Shot quality and turnover rate have both improved, creating a stable favorite profile.",
  },
  {
    team: teams[1],
    offensiveRating: 116.7,
    defensiveRating: 113.9,
    pace: 96.4,
    recentForm: "6-4 last 10",
    netRatingTrend: 2.1,
    injuryImpact: "high",
    trendSummary:
      "Half-court efficiency remains strong, but injury uncertainty is driving prop volatility.",
  },
  {
    team: teams[2],
    offensiveRating: 118.2,
    defensiveRating: 104.7,
    pace: 101.3,
    recentForm: "8-2 last 10",
    netRatingTrend: 8.4,
    injuryImpact: "medium",
    trendSummary:
      "Lineup depth and bullpen leverage give Los Angeles strong late-game market support.",
  },
  {
    team: teams[4],
    offensiveRating: 0.18,
    defensiveRating: -0.06,
    pace: 64.7,
    recentForm: "5-1 last 6",
    netRatingTrend: 4.9,
    injuryImpact: "low",
    trendSummary:
      "Kansas City is trending toward faster neutral scripts with healthier pass-game personnel.",
  },
];

function bySport<T extends { sport?: SportKey }>(items: T[], sport?: SportKey) {
  return sport ? items.filter((item) => item.sport === sport) : items;
}

function gameSport(gameId: string) {
  return games.find((game) => game.id === gameId)?.sport;
}

function normalized(value: string) {
  return value.toLowerCase();
}

export class MockSportsDataProvider implements SportsDataProvider {
  async listGames(filters?: { sport?: SportKey }) {
    return bySport(games, filters?.sport);
  }

  async listOdds(filters?: { sport?: SportKey; gameId?: string }) {
    return odds.filter((item) => {
      const matchesGame = filters?.gameId ? item.gameId === filters.gameId : true;
      const matchesSport = filters?.sport ? gameSport(item.gameId) === filters.sport : true;

      return matchesGame && matchesSport;
    });
  }

  async listBettingSplits(filters?: { sport?: SportKey; gameId?: string }) {
    return splits.filter((item) => {
      const matchesGame = filters?.gameId ? item.gameId === filters.gameId : true;
      const matchesSport = filters?.sport ? gameSport(item.gameId) === filters.sport : true;

      return matchesGame && matchesSport;
    });
  }

  async listNews(filters?: {
    sport?: SportKey;
    severity?: NewsItem["severity"];
    type?: NewsItem["type"];
  }) {
    return news.filter((item) => {
      const matchesSport = filters?.sport ? item.sport === filters.sport : true;
      const matchesSeverity = filters?.severity ? item.severity === filters.severity : true;
      const matchesType = filters?.type ? item.type === filters.type : true;

      return matchesSport && matchesSeverity && matchesType;
    });
  }

  async listPlayers(filters?: { sport?: SportKey; query?: string }) {
    return players.filter((player) => {
      const matchesSport = filters?.sport ? player.sport === filters.sport : true;
      const matchesQuery = filters?.query
        ? normalized(player.name).includes(normalized(filters.query))
        : true;

      return matchesSport && matchesQuery;
    });
  }

  async listTeams(filters?: { sport?: SportKey; query?: string }) {
    return teams.filter((team) => {
      const matchesSport = filters?.sport ? team.sport === filters.sport : true;
      const label = `${team.city ?? ""} ${team.name} ${team.abbreviation}`;
      const matchesQuery = filters?.query
        ? normalized(label).includes(normalized(filters.query))
        : true;

      return matchesSport && matchesQuery;
    });
  }

  async getPlayerResearch(id: string) {
    return playerResearch.find((item) => item.player.id === id) ?? null;
  }

  async getTeamResearch(id: string) {
    return teamResearch.find((item) => item.team.id === id) ?? null;
  }

  async listPlayerEdges(filters?: { sport?: SportKey }) {
    return playerResearch.filter((item) =>
      filters?.sport ? item.player.sport === filters.sport : true,
    );
  }

  async listTeamTrends(filters?: { sport?: SportKey }) {
    return teamResearch.filter((item) =>
      filters?.sport ? item.team.sport === filters.sport : true,
    );
  }
}

const provider = new MockSportsDataProvider();

export async function getMockDashboardData(sport?: SportKey): Promise<DashboardData> {
  const [dashboardGames, dashboardOdds, dashboardSplits, dashboardNews, playerEdges, teamTrends] =
    await Promise.all([
      provider.listGames({ sport }),
      provider.listOdds({ sport }),
      provider.listBettingSplits({ sport }),
      provider.listNews({ sport }),
      provider.listPlayerEdges({ sport }),
      provider.listTeamTrends({ sport }),
    ]);

  return {
    games: dashboardGames,
    odds: dashboardOdds,
    splits: dashboardSplits,
    news: dashboardNews,
    playerEdges,
    teamTrends,
  };
}

export const sportsDataProvider: SportsDataProvider = provider;

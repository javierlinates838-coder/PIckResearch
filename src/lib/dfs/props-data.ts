import type {
  DfsGameLog,
  DfsPlayerResearch,
  MarketType,
  PickApp,
  PickOpportunity,
  Player,
  SportKey,
  Team,
} from "@/types/sports";

type FinderSort = "edge" | "confidence" | "l10" | "diff" | "streak" | "newest";

interface DfsSeed {
  player: Player;
  team: Team;
  market: MarketType;
  line: number;
  app: PickApp;
  opponent: string;
  defenseRank: number;
  values: number[];
  minutes: number[];
  usageTrendPct: number;
  injuryStatus: DfsPlayerResearch["injuryStatus"];
  note: string;
}

const teams: Team[] = [
  {
    id: "dfs-team-bos",
    sport: "nba",
    league: "NBA",
    name: "Boston",
    abbreviation: "BOS",
    primaryColor: "#007A33",
    secondaryColor: "#BA9653",
  },
  {
    id: "dfs-team-nyk",
    sport: "nba",
    league: "NBA",
    name: "New York",
    abbreviation: "NYK",
    primaryColor: "#006BB6",
    secondaryColor: "#F58426",
  },
  {
    id: "dfs-team-lad",
    sport: "mlb",
    league: "MLB",
    name: "Los Angeles",
    abbreviation: "LAD",
    primaryColor: "#005A9C",
    secondaryColor: "#EF3E42",
  },
  {
    id: "dfs-team-nyy",
    sport: "mlb",
    league: "MLB",
    name: "New York",
    abbreviation: "NYY",
    primaryColor: "#003087",
    secondaryColor: "#E4002B",
  },
  {
    id: "dfs-team-edm",
    sport: "nhl",
    league: "NHL",
    name: "Edmonton",
    abbreviation: "EDM",
    primaryColor: "#041E42",
    secondaryColor: "#FF4C00",
  },
  {
    id: "dfs-team-t1",
    sport: "esports",
    league: "LoL",
    name: "T1",
    abbreviation: "T1",
    primaryColor: "#E4002B",
    secondaryColor: "#111827",
  },
];

const seeds: DfsSeed[] = [
  {
    player: {
      id: "player-jayson-tatum",
      sport: "nba",
      teamId: "dfs-team-bos",
      name: "Jayson Tatum",
      position: "F",
      jerseyNumber: "0",
    },
    team: teams[0],
    market: "player_points",
    line: 28.5,
    app: "PrizePicks",
    opponent: "Opponent TBD",
    defenseRank: 24,
    values: [34, 29, 31, 26, 38, 30, 27, 35, 28, 32, 25, 33, 31, 29, 36],
    minutes: [39, 37, 40, 35, 42, 38, 36, 41, 37, 39, 34, 40, 38, 37, 41],
    usageTrendPct: 6.8,
    injuryStatus: "clear",
    note: "High-usage wing with stable minutes and strong recent scoring volume.",
  },
  {
    player: {
      id: "player-jalen-brunson",
      sport: "nba",
      teamId: "dfs-team-nyk",
      name: "Jalen Brunson",
      position: "G",
      jerseyNumber: "11",
    },
    team: teams[1],
    market: "player_assists",
    line: 7.5,
    app: "Underdog",
    opponent: "Opponent TBD",
    defenseRank: 19,
    values: [9, 7, 11, 8, 10, 6, 9, 8, 12, 7, 9, 10, 8, 6, 11],
    minutes: [40, 39, 42, 38, 41, 36, 39, 40, 43, 37, 41, 42, 39, 35, 40],
    usageTrendPct: 4.3,
    injuryStatus: "monitor",
    note: "Assist chances rise when New York plays through high pick-and-roll volume.",
  },
  {
    player: {
      id: "player-shohei-ohtani",
      sport: "mlb",
      teamId: "dfs-team-lad",
      name: "Shohei Ohtani",
      position: "DH",
      jerseyNumber: "17",
    },
    team: teams[2],
    market: "player_shots",
    line: 1.5,
    app: "Sleeper",
    opponent: "Pitching matchup TBD",
    defenseRank: 22,
    values: [2, 1, 3, 2, 2, 0, 4, 2, 1, 3, 2, 2, 1, 4, 2],
    minutes: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    usageTrendPct: 3.1,
    injuryStatus: "clear",
    note: "Leadoff plate-appearance expectation creates strong volume for total bases/hits style props.",
  },
  {
    player: {
      id: "player-aaron-judge",
      sport: "mlb",
      teamId: "dfs-team-nyy",
      name: "Aaron Judge",
      position: "OF",
      jerseyNumber: "99",
    },
    team: teams[3],
    market: "player_shots",
    line: 1.5,
    app: "DraftKings",
    opponent: "Pitching matchup TBD",
    defenseRank: 15,
    values: [1, 2, 2, 0, 3, 1, 2, 1, 2, 4, 1, 2, 3, 1, 2],
    minutes: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    usageTrendPct: 2.6,
    injuryStatus: "clear",
    note: "Power profile creates ceiling, but walk risk can reduce official at-bat volume.",
  },
  {
    player: {
      id: "player-connor-mcdavid",
      sport: "nhl",
      teamId: "dfs-team-edm",
      name: "Connor McDavid",
      position: "C",
      jerseyNumber: "97",
    },
    team: teams[4],
    market: "player_shots",
    line: 3.5,
    app: "FanDuel",
    opponent: "Opponent TBD",
    defenseRank: 27,
    values: [5, 4, 3, 6, 4, 5, 2, 4, 5, 6, 3, 4, 5, 4, 6],
    minutes: [22, 21, 20, 24, 22, 23, 19, 21, 24, 25, 20, 22, 23, 21, 24],
    usageTrendPct: 5.9,
    injuryStatus: "clear",
    note: "Elite puck possession and power-play role support shot volume in competitive scripts.",
  },
  {
    player: {
      id: "player-faker",
      sport: "esports",
      teamId: "dfs-team-t1",
      name: "Faker",
      position: "MID",
    },
    team: teams[5],
    market: "player_kills",
    line: 4.5,
    app: "BetMGM",
    opponent: "Opponent TBD",
    defenseRank: 18,
    values: [6, 4, 5, 7, 3, 6, 5, 8, 4, 6, 5, 7, 3, 5, 6],
    minutes: [33, 31, 34, 36, 29, 35, 32, 37, 30, 34, 33, 36, 28, 32, 35],
    usageTrendPct: 4.8,
    injuryStatus: "clear",
    note: "Mid-lane kill participation and team objective control drive projection stability.",
  },
];

function dateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return date.toISOString();
}

function marketStatKey(market: MarketType) {
  if (market === "player_points") return "points";
  if (market === "player_rebounds") return "rebounds";
  if (market === "player_assists") return "assists";
  if (market === "player_strikeouts") return "strikeouts";
  if (market === "player_kills") return "kills";

  return "shots";
}

function average(values: number[]) {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function hitRate(values: number[], line: number) {
  return Math.round((values.filter((value) => value > line).length / values.length) * 100);
}

function currentStreak(values: number[], line: number) {
  let streak = 0;

  for (const value of values) {
    if (value > line) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function consistency(values: number[]) {
  const avg = average(values);
  const variance = values.reduce((sum, value) => sum + Math.abs(value - avg), 0) / values.length;

  return Math.max(1, Math.min(99, Math.round(100 - variance * 9)));
}

function logsFor(seed: DfsSeed): DfsGameLog[] {
  const statKey = marketStatKey(seed.market);

  return seed.values.map((value, index) => ({
    id: `${seed.player.id}-log-${index + 1}`,
    playedAt: dateDaysAgo(index + 1),
    opponent: index % 3 === 0 ? seed.opponent : "Recent opponent",
    minutes: seed.minutes[index] ?? seed.minutes[0],
    [statKey]: value,
    value,
    line: seed.line,
    hit: value > seed.line,
  }));
}

function opportunityFor(seed: DfsSeed, app: PickApp = seed.app): PickOpportunity {
  const l5 = seed.values.slice(0, 5);
  const l10 = seed.values.slice(0, 10);
  const l15 = seed.values.slice(0, 15);
  const last5Average = average(l5);
  const last10Average = average(l10);
  const projection = Number((last5Average * 0.45 + last10Average * 0.35 + average(l15) * 0.2).toFixed(1));
  const side = projection >= seed.line ? "over" : "under";
  const diff = Number(Math.abs(projection - seed.line).toFixed(1));
  const l10HitRate = hitRate(l10, seed.line);
  const h2hHitRate = Math.min(96, Math.max(30, 100 - seed.defenseRank * 2));
  const confidence = Math.min(
    99,
    Math.round(l10HitRate * 0.4 + hitRate(l5, seed.line) * 0.25 + consistency(l10) * 0.2 + h2hHitRate * 0.15),
  );
  const edgeScore = Math.min(99, Math.round(confidence * 0.75 + diff * 8 + seed.usageTrendPct));

  return {
    id: `dfs:${seed.player.id}:${seed.market}:${app}`,
    sport: seed.player.sport,
    player: seed.player,
    team: seed.team,
    opponent: {
      id: `opp-${seed.player.id}`,
      sport: seed.player.sport,
      league: seed.team.league,
      name: seed.opponent,
      abbreviation: seed.opponent.slice(0, 4).toUpperCase(),
      primaryColor: "#334155",
      secondaryColor: "#020617",
    },
    market: seed.market,
    app,
    line: seed.line,
    side,
    projection,
    diff,
    l5HitRate: hitRate(l5, seed.line),
    l10HitRate,
    l15HitRate: hitRate(l15, seed.line),
    seasonHitRate: hitRate(seed.values, seed.line),
    h2hHitRate,
    streak: currentStreak(seed.values, seed.line),
    opponentRank: seed.defenseRank,
    consistencyScore: consistency(l10),
    confidence,
    edgeScore,
    status: "demo",
    injuryContext:
      seed.injuryStatus === "questionable" || seed.injuryStatus === "out"
        ? "risk"
        : seed.injuryStatus === "monitor"
          ? "monitor"
          : "clean",
    tags: [
      seed.market.replace("player_", "").replaceAll("_", " "),
      `${app} line`,
      `L10 ${l10HitRate}%`,
      `DvP #${seed.defenseRank}`,
    ],
    rationale: `${seed.player.name} projects ${diff.toFixed(1)} ${side === "over" ? "above" : "below"} the ${seed.line} ${seed.market.replace("player_", "").replaceAll("_", " ")} line with ${l10HitRate}% L10 hit rate and ${currentStreak(seed.values, seed.line)} straight hits.`,
  };
}

export function listDfsOpportunities(filters?: {
  sport?: SportKey;
  query?: string;
  market?: MarketType;
  app?: PickApp;
  minHitRate?: number;
  sort?: FinderSort;
}) {
  const query = filters?.query?.toLowerCase();
  const opportunities = seeds
    .flatMap((seed, index) => [
      opportunityFor(seed),
      opportunityFor(seed, (["PrizePicks", "Underdog", "Sleeper", "DraftKings", "FanDuel", "BetMGM"] as PickApp[])[
        (index + 2) % 6
      ]),
    ])
    .filter((item) => {
      const matchesSport = filters?.sport ? item.sport === filters.sport : true;
      const matchesQuery = query ? item.player.name.toLowerCase().includes(query) : true;
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
  };

  return opportunities.sort(sorters[sort]);
}

export function getDfsPlayerResearch(playerId: string): DfsPlayerResearch | null {
  const seed = seeds.find((item) => item.player.id === playerId);

  if (!seed) {
    return null;
  }

  const logs = logsFor(seed);
  const values = logs.map((log) => log.value);
  const availableProps = [
    opportunityFor(seed),
    opportunityFor(seed, seed.app === "PrizePicks" ? "Underdog" : "PrizePicks"),
  ];

  return {
    player: seed.player,
    team: seed.team,
    primaryMarket: seed.market,
    currentLine: seed.line,
    projection: availableProps[0].projection,
    last5Average: average(values.slice(0, 5)),
    last10Average: average(values.slice(0, 10)),
    last15Average: average(values.slice(0, 15)),
    seasonAverage: average(values),
    l5HitRate: hitRate(values.slice(0, 5), seed.line),
    l10HitRate: hitRate(values.slice(0, 10), seed.line),
    l15HitRate: hitRate(values.slice(0, 15), seed.line),
    seasonHitRate: hitRate(values, seed.line),
    streak: currentStreak(values, seed.line),
    consistencyScore: consistency(values.slice(0, 10)),
    usageTrendPct: seed.usageTrendPct,
    minutesTrendPct: Number((average(seed.minutes.slice(0, 5)) - average(seed.minutes.slice(5, 10))).toFixed(1)),
    matchup: {
      opponent: seed.opponent,
      defenseVsPositionRank: seed.defenseRank,
      note: seed.note,
    },
    injuryStatus: seed.injuryStatus,
    logs,
    availableProps,
    source: "mock",
  };
}

export function listDfsPlayers(filters?: { sport?: SportKey; query?: string }) {
  const query = filters?.query?.toLowerCase();

  return seeds
    .filter((seed) => (filters?.sport ? seed.player.sport === filters.sport : true))
    .filter((seed) => (query ? seed.player.name.toLowerCase().includes(query) : true))
    .map((seed) => seed.player);
}

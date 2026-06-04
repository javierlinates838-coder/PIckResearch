import type { SportKey } from "@/types/sports";

export const theOddsApiSportKeys: Record<SportKey, string[]> = {
  nba: ["basketball_nba"],
  mlb: ["baseball_mlb"],
  nfl: ["americanfootball_nfl"],
  nhl: ["icehockey_nhl"],
  tennis: ["tennis_atp", "tennis_wta"],
  soccer: [
    "soccer_epl",
    "soccer_uefa_champs_league",
    "soccer_spain_la_liga",
    "soccer_italy_serie_a",
    "soccer_germany_bundesliga",
    "soccer_france_ligue_one",
    "soccer_usa_mls",
  ],
  esports: ["esports_lol", "esports_cs2", "esports_dota2"],
};

export const defaultNewsApiQueries: Record<SportKey, string> = {
  nba: '(NBA OR basketball) AND (injury OR lineup OR "game time decision" OR trade)',
  mlb: '(MLB OR baseball) AND (injury OR lineup OR starter OR bullpen)',
  nfl: '(NFL OR football) AND (injury OR practice OR suspension OR depth chart)',
  nhl: '(NHL OR hockey) AND (injury OR goalie OR lineup OR suspension)',
  tennis: '(tennis OR ATP OR WTA) AND (injury OR retirement OR form)',
  soccer: '(soccer OR football OR EPL OR Champions League) AND (injury OR lineup OR suspension)',
  esports: '(esports OR "League of Legends" OR Counter-Strike OR Dota) AND (roster OR lineup OR injury)',
};

const newsApiPrivateKeyAliases = ["NEWSAPI_API_KEY", "NEWS_API_KEY", "NEWSAPI_KEY"] as const;
const newsApiPublicKeyAliases = ["NEXT_PUBLIC_NEWSAPI_API_KEY", "NEXT_PUBLIC_NEWS_API_KEY"] as const;
const theOddsApiPrivateKeyAliases = [
  "ODDSAPI",
  "ODDSAPI_KEY",
  "THE_ODDS_API_KEY",
  "ODDS_API_KEY",
  "THEODDSAPI_API_KEY",
  "THE_ODDSAPI_API_KEY",
] as const;
const theOddsApiPublicKeyAliases = [
  "NEXT_PUBLIC_THE_ODDS_API_KEY",
  "NEXT_PUBLIC_ODDS_API_KEY",
] as const;
const dfsPropsPrivateKeyAliases = ["DFS_PROPS_API_KEY", "PROPS_API_KEY", "DFS_API_KEY"] as const;

function findConfiguredEnvName(names: readonly string[]) {
  return names.find((name) => Boolean(process.env[name]));
}

function getEnvValue(names: readonly string[]) {
  const configuredName = findConfiguredEnvName(names);

  return configuredName ? process.env[configuredName] : undefined;
}

export function getNewsApiKey() {
  return getEnvValue(newsApiPrivateKeyAliases);
}

export function getTheOddsApiKey() {
  return getEnvValue(theOddsApiPrivateKeyAliases);
}

export function getDfsPropsApiKey() {
  return getEnvValue(dfsPropsPrivateKeyAliases);
}

export function getProviderStatus() {
  const newsApiDetectedAlias = findConfiguredEnvName(newsApiPrivateKeyAliases);
  const theOddsApiDetectedAlias = findConfiguredEnvName(theOddsApiPrivateKeyAliases);
  const dfsPropsDetectedAlias = findConfiguredEnvName(dfsPropsPrivateKeyAliases);

  return {
    newsapi: {
      configured: Boolean(getNewsApiKey()),
      expectedKey: "NEWSAPI_API_KEY",
      acceptedAliases: [...newsApiPrivateKeyAliases],
      detectedAlias: newsApiDetectedAlias ?? null,
      publicKeyDetected: Boolean(findConfiguredEnvName(newsApiPublicKeyAliases)),
      powers: ["dashboard.news", "news.feed"],
      doesNotPower: ["finder.players", "finder.props", "player.statLogs"],
      baseUrl: process.env.NEWSAPI_BASE_URL ?? "https://newsapi.org/v2",
      endpoint: process.env.NEWSAPI_ENDPOINT ?? "everything",
      language: process.env.NEWSAPI_LANGUAGE ?? "en",
      sortBy: process.env.NEWSAPI_SORT_BY ?? "publishedAt",
      pageSize: Number(process.env.NEWSAPI_PAGE_SIZE ?? 25),
      searchIn: process.env.NEWSAPI_SEARCH_IN,
      sources: process.env.NEWSAPI_SOURCES,
      domains: process.env.NEWSAPI_DOMAINS,
      excludeDomains: process.env.NEWSAPI_EXCLUDE_DOMAINS,
      from: process.env.NEWSAPI_FROM,
      to: process.env.NEWSAPI_TO,
      topHeadlinesCountry: process.env.NEWSAPI_TOP_HEADLINES_COUNTRY ?? "us",
      topHeadlinesCategory: process.env.NEWSAPI_TOP_HEADLINES_CATEGORY ?? "sports",
    },
    theOddsApi: {
      configured: Boolean(getTheOddsApiKey()),
      expectedKey: "ODDSAPI",
      acceptedAliases: [...theOddsApiPrivateKeyAliases],
      detectedAlias: theOddsApiDetectedAlias ?? null,
      publicKeyDetected: Boolean(findConfiguredEnvName(theOddsApiPublicKeyAliases)),
      powers: ["dashboard.games", "dashboard.odds", "finder.livePropLines"],
      doesNotPower: ["player.statLogs", "hitRates", "dfsProjections"],
      baseUrl: process.env.THE_ODDS_API_BASE_URL ?? "https://api.the-odds-api.com/v4",
      regions: process.env.THE_ODDS_API_REGIONS ?? "us",
      bookmakers: process.env.THE_ODDS_API_BOOKMAKERS,
      markets: process.env.THE_ODDS_API_MARKETS ?? "h2h,spreads,totals",
      playerPropMarkets:
        process.env.THE_ODDS_API_PLAYER_PROP_MARKETS ??
        "player_points,player_rebounds,player_assists,player_threes,player_shots_on_goal,batter_hits,batter_total_bases,pitcher_strikeouts",
      playerPropEventLimit: Number(process.env.THE_ODDS_API_PLAYER_PROP_EVENT_LIMIT ?? 2),
      oddsFormat: process.env.THE_ODDS_API_ODDS_FORMAT ?? "american",
      dateFormat: process.env.THE_ODDS_API_DATE_FORMAT ?? "iso",
      eventIds: process.env.THE_ODDS_API_EVENT_IDS,
      commenceTimeFrom: process.env.THE_ODDS_API_COMMENCE_TIME_FROM,
      commenceTimeTo: process.env.THE_ODDS_API_COMMENCE_TIME_TO,
      includeLinks: process.env.THE_ODDS_API_INCLUDE_LINKS ?? "false",
      includeSids: process.env.THE_ODDS_API_INCLUDE_SIDS ?? "false",
      includeBetLimits: process.env.THE_ODDS_API_INCLUDE_BET_LIMITS ?? "false",
      includeRotationNumbers: process.env.THE_ODDS_API_INCLUDE_ROTATION_NUMBERS ?? "false",
      playerPropsNote:
        "The Odds API player props are requested fresh one event at a time with /sports/{sport}/events/{eventId}/odds. Each event/market/region costs quota.",
    },
    dfsProps: {
      configured: Boolean(getDfsPropsApiKey()),
      expectedKey: "DFS_PROPS_API_KEY",
      acceptedAliases: [...dfsPropsPrivateKeyAliases],
      detectedAlias: dfsPropsDetectedAlias ?? null,
      powers: ["finder.players", "finder.props", "player.statLogs"],
      note:
        "A DFS projections/stat-log provider is required to expand Finder and Players beyond demo rows.",
    },
  };
}

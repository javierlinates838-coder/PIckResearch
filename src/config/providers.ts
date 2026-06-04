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
  "THE_ODDS_API_KEY",
  "ODDS_API_KEY",
  "THEODDSAPI_API_KEY",
  "THE_ODDSAPI_API_KEY",
] as const;
const theOddsApiPublicKeyAliases = [
  "NEXT_PUBLIC_THE_ODDS_API_KEY",
  "NEXT_PUBLIC_ODDS_API_KEY",
] as const;

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

export function getProviderStatus() {
  const newsApiDetectedAlias = findConfiguredEnvName(newsApiPrivateKeyAliases);
  const theOddsApiDetectedAlias = findConfiguredEnvName(theOddsApiPrivateKeyAliases);

  return {
    newsapi: {
      configured: Boolean(getNewsApiKey()),
      expectedKey: "NEWSAPI_API_KEY",
      acceptedAliases: [...newsApiPrivateKeyAliases],
      detectedAlias: newsApiDetectedAlias ?? null,
      publicKeyDetected: Boolean(findConfiguredEnvName(newsApiPublicKeyAliases)),
      baseUrl: process.env.NEWSAPI_BASE_URL ?? "https://newsapi.org/v2",
      language: process.env.NEWSAPI_LANGUAGE ?? "en",
      sortBy: process.env.NEWSAPI_SORT_BY ?? "publishedAt",
      pageSize: Number(process.env.NEWSAPI_PAGE_SIZE ?? 25),
    },
    theOddsApi: {
      configured: Boolean(getTheOddsApiKey()),
      expectedKey: "THE_ODDS_API_KEY",
      acceptedAliases: [...theOddsApiPrivateKeyAliases],
      detectedAlias: theOddsApiDetectedAlias ?? null,
      publicKeyDetected: Boolean(findConfiguredEnvName(theOddsApiPublicKeyAliases)),
      baseUrl: process.env.THE_ODDS_API_BASE_URL ?? "https://api.the-odds-api.com/v4",
      regions: process.env.THE_ODDS_API_REGIONS ?? "us",
      markets: process.env.THE_ODDS_API_MARKETS ?? "h2h,spreads,totals",
      oddsFormat: process.env.THE_ODDS_API_ODDS_FORMAT ?? "american",
      dateFormat: process.env.THE_ODDS_API_DATE_FORMAT ?? "iso",
    },
  };
}

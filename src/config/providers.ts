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

export function getNewsApiKey() {
  return process.env.NEWSAPI_API_KEY ?? process.env.NEWS_API_KEY;
}

export function getTheOddsApiKey() {
  return process.env.THE_ODDS_API_KEY ?? process.env.ODDS_API_KEY;
}

export function getProviderStatus() {
  return {
    newsapi: {
      configured: Boolean(getNewsApiKey()),
      baseUrl: process.env.NEWSAPI_BASE_URL ?? "https://newsapi.org/v2",
      language: process.env.NEWSAPI_LANGUAGE ?? "en",
      sortBy: process.env.NEWSAPI_SORT_BY ?? "publishedAt",
      pageSize: Number(process.env.NEWSAPI_PAGE_SIZE ?? 25),
    },
    theOddsApi: {
      configured: Boolean(getTheOddsApiKey()),
      baseUrl: process.env.THE_ODDS_API_BASE_URL ?? "https://api.the-odds-api.com/v4",
      regions: process.env.THE_ODDS_API_REGIONS ?? "us",
      markets: process.env.THE_ODDS_API_MARKETS ?? "h2h,spreads,totals",
      oddsFormat: process.env.THE_ODDS_API_ODDS_FORMAT ?? "american",
      dateFormat: process.env.THE_ODDS_API_DATE_FORMAT ?? "iso",
    },
  };
}

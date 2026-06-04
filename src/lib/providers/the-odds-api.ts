import "server-only";

import { getProviderStatus, getTheOddsApiKey, theOddsApiSportKeys } from "@/config/providers";
import type { Game, MarketType, OddsSnapshot, SportKey, Team } from "@/types/sports";

type TheOddsApiMarketKey = "h2h" | "spreads" | "totals" | "outrights" | string;

interface TheOddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

interface TheOddsApiMarket {
  key: TheOddsApiMarketKey;
  last_update: string;
  outcomes: TheOddsApiOutcome[];
}

interface TheOddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: TheOddsApiMarket[];
}

export interface TheOddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: TheOddsApiBookmaker[];
}

interface FetchOddsOptions {
  sport?: SportKey;
  sportKey?: string;
  regions?: string;
  markets?: string;
  oddsFormat?: "american" | "decimal";
  dateFormat?: "iso" | "unix";
}

const marketMap: Record<string, MarketType> = {
  h2h: "moneyline",
  spreads: "spread",
  totals: "total",
};

function externalTeamId(name: string) {
  return `theoddsapi:team:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function inferSportFromKey(sportKey: string): SportKey {
  const entry = Object.entries(theOddsApiSportKeys).find(([, keys]) => keys.includes(sportKey));
  return (entry?.[0] as SportKey | undefined) ?? "soccer";
}

function toTeam(name: string, sport: SportKey, league: string): Team {
  return {
    id: externalTeamId(name),
    sport,
    league,
    name,
    abbreviation: name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 4)
      .toUpperCase(),
    primaryColor: "#10B981",
    secondaryColor: "#0F172A",
  };
}

export function resolveTheOddsApiSportKeys(options?: { sport?: SportKey; sportKey?: string }) {
  if (options?.sportKey) {
    return [options.sportKey];
  }

  if (options?.sport) {
    return theOddsApiSportKeys[options.sport];
  }

  return ["upcoming"];
}

export function buildTheOddsApiOddsUrl(sportKey: string, options?: FetchOddsOptions) {
  const status = getProviderStatus().theOddsApi;
  const url = new URL(`${status.baseUrl}/sports/${sportKey}/odds`);
  const apiKey = getTheOddsApiKey();

  if (!apiKey) {
    throw new Error("Missing THE_ODDS_API_KEY or ODDS_API_KEY.");
  }

  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", options?.regions ?? status.regions);
  url.searchParams.set("markets", options?.markets ?? status.markets);
  url.searchParams.set("oddsFormat", options?.oddsFormat ?? "american");
  url.searchParams.set("dateFormat", options?.dateFormat ?? "iso");

  return url;
}

export async function fetchTheOddsApiOdds(options?: FetchOddsOptions) {
  const sportKeys = resolveTheOddsApiSportKeys(options);
  const responses = await Promise.all(
    sportKeys.map(async (sportKey) => {
      const url = buildTheOddsApiOddsUrl(sportKey, options);
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 60,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`The Odds API request failed for ${sportKey}: ${response.status} ${message}`);
      }

      return (await response.json()) as TheOddsApiEvent[];
    }),
  );

  return responses.flat();
}

export function normalizeTheOddsApiGames(events: TheOddsApiEvent[]): Game[] {
  return events.map((event) => {
    const sport = inferSportFromKey(event.sport_key);

    return {
      id: `theoddsapi:game:${event.id}`,
      sport,
      league: event.sport_title,
      startsAt: event.commence_time,
      homeTeam: toTeam(event.home_team, sport, event.sport_title),
      awayTeam: toTeam(event.away_team, sport, event.sport_title),
      venue: "Provider scheduled event",
      status: "scheduled",
    };
  });
}

export function normalizeTheOddsApiOdds(events: TheOddsApiEvent[]): OddsSnapshot[] {
  return events.flatMap((event) =>
    event.bookmakers.flatMap((bookmaker) =>
      bookmaker.markets.flatMap((market) =>
        market.outcomes.map((outcome) => {
          const line = typeof outcome.point === "number" ? outcome.point : 0;

          return {
            id: `theoddsapi:odds:${event.id}:${bookmaker.key}:${market.key}:${outcome.name}:${line}`,
            gameId: `theoddsapi:game:${event.id}`,
            sportsbook: bookmaker.title,
            market: marketMap[market.key] ?? "moneyline",
            selection: outcome.name,
            line,
            price: outcome.price,
            openingLine: line,
            openingPrice: outcome.price,
            capturedAt: market.last_update ?? bookmaker.last_update,
          };
        }),
      ),
    ),
  );
}

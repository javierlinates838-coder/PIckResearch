import "server-only";

import { getProviderStatus, getTheOddsApiKey, theOddsApiSportKeys } from "@/config/providers";
import type { Game, MarketType, OddsSnapshot, PickApp, PickOpportunity, Player, SportKey, Team } from "@/types/sports";

type TheOddsApiMarketKey = "h2h" | "spreads" | "totals" | "outrights" | string;

interface TheOddsApiOutcome {
  name: string;
  price: number;
  point?: number;
  description?: string;
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
  bookmakers?: string;
  markets?: string;
  oddsFormat?: "american" | "decimal";
  dateFormat?: "iso" | "unix";
  eventIds?: string;
  commenceTimeFrom?: string;
  commenceTimeTo?: string;
  includeLinks?: "true" | "false";
  includeSids?: "true" | "false";
  includeBetLimits?: "true" | "false";
  includeRotationNumbers?: "true" | "false";
}

export interface TheOddsApiDiagnostics {
  requestedSportKeys: string[];
  succeededSportKeys: string[];
  failedSportKeys: string[];
  errors: string[];
  requestsRemaining?: string | null;
  requestsUsed?: string | null;
  requestsLast?: string | null;
}

export interface TheOddsApiOddsResult {
  events: TheOddsApiEvent[];
  diagnostics: TheOddsApiDiagnostics;
}

export interface TheOddsApiPlayerPropsResult {
  events: TheOddsApiEvent[];
  diagnostics: TheOddsApiDiagnostics;
}

const marketMap: Record<string, MarketType> = {
  h2h: "moneyline",
  spreads: "spread",
  totals: "total",
};

const playerPropMarketMap: Record<string, MarketType> = {
  player_points: "player_points",
  player_rebounds: "player_rebounds",
  player_assists: "player_assists",
  player_threes: "player_threes",
  player_goals: "player_goals",
  player_shots: "player_shots",
  player_shots_on_goal: "player_shots_on_goal",
  player_kills: "player_kills",
  batter_hits: "batter_hits",
  batter_total_bases: "batter_total_bases",
  pitcher_strikeouts: "pitcher_strikeouts",
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function externalTeamId(name: string) {
  return `theoddsapi:team:${slug(name)}`;
}

function inferSportFromKey(sportKey: string): SportKey {
  const entry = Object.entries(theOddsApiSportKeys).find(([, keys]) => keys.includes(sportKey));
  return (entry?.[0] as SportKey | undefined) ?? "soccer";
}

function sportsbookApp(title: string): PickApp {
  const normalized = title.toLowerCase();

  if (normalized.includes("draftkings")) return "DraftKings";
  if (normalized.includes("fanduel")) return "FanDuel";
  if (normalized.includes("betmgm")) return "BetMGM";

  return "OddsAPI";
}

function playerFromName(name: string, sport: SportKey, teamId: string): Player {
  return {
    id: `oddsapi-player-${slug(name)}`,
    sport,
    teamId,
    name,
    position: "PROP",
  };
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
  const bookmakers = options?.bookmakers ?? status.bookmakers;
  if (bookmakers) {
    url.searchParams.set("bookmakers", bookmakers);
  } else {
    url.searchParams.set("regions", options?.regions ?? status.regions);
  }
  url.searchParams.set("markets", options?.markets ?? status.markets);
  url.searchParams.set("oddsFormat", options?.oddsFormat ?? "american");
  url.searchParams.set("dateFormat", options?.dateFormat ?? "iso");
  const optionalParams = {
    eventIds: options?.eventIds ?? status.eventIds,
    commenceTimeFrom: options?.commenceTimeFrom ?? status.commenceTimeFrom,
    commenceTimeTo: options?.commenceTimeTo ?? status.commenceTimeTo,
    includeLinks: options?.includeLinks ?? status.includeLinks,
    includeSids: options?.includeSids ?? status.includeSids,
    includeBetLimits: options?.includeBetLimits ?? status.includeBetLimits,
    includeRotationNumbers: options?.includeRotationNumbers ?? status.includeRotationNumbers,
  };

  Object.entries(optionalParams).forEach(([key, value]) => {
    if (value && value !== "false") {
      url.searchParams.set(key, value);
    }
  });

  return url;
}

export function buildTheOddsApiEventOddsUrl(
  sportKey: string,
  eventId: string,
  options?: FetchOddsOptions,
) {
  const status = getProviderStatus().theOddsApi;
  const url = new URL(`${status.baseUrl}/sports/${sportKey}/events/${eventId}/odds`);
  const apiKey = getTheOddsApiKey();

  if (!apiKey) {
    throw new Error("Missing THE_ODDS_API_KEY or ODDS_API_KEY.");
  }

  url.searchParams.set("apiKey", apiKey);
  const bookmakers = options?.bookmakers ?? status.bookmakers;
  if (bookmakers) {
    url.searchParams.set("bookmakers", bookmakers);
  } else {
    url.searchParams.set("regions", options?.regions ?? status.regions);
  }
  url.searchParams.set("markets", options?.markets ?? status.playerPropMarkets);
  url.searchParams.set("oddsFormat", options?.oddsFormat ?? "american");
  url.searchParams.set("dateFormat", options?.dateFormat ?? "iso");

  if ((options?.includeLinks ?? status.includeLinks) === "true") {
    url.searchParams.set("includeLinks", "true");
  }
  if ((options?.includeSids ?? status.includeSids) === "true") {
    url.searchParams.set("includeSids", "true");
  }
  if ((options?.includeBetLimits ?? status.includeBetLimits) === "true") {
    url.searchParams.set("includeBetLimits", "true");
  }

  return url;
}

export async function fetchTheOddsApiOdds(options?: FetchOddsOptions) {
  const sportKeys = resolveTheOddsApiSportKeys(options);
  const results = await Promise.allSettled(
    sportKeys.map(async (sportKey) => {
      const url = buildTheOddsApiOddsUrl(sportKey, options);
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`The Odds API request failed for ${sportKey}: ${response.status} ${message}`);
      }

      return {
        sportKey,
        events: (await response.json()) as TheOddsApiEvent[],
        headers: {
          requestsRemaining: response.headers.get("x-requests-remaining"),
          requestsUsed: response.headers.get("x-requests-used"),
          requestsLast: response.headers.get("x-requests-last"),
        },
      };
    }),
  );

  const fulfilled = results.filter((result) => result.status === "fulfilled");
  const rejected = results.filter((result) => result.status === "rejected");
  const events = fulfilled.flatMap((result) => result.value.events);
  const lastHeader = fulfilled.at(-1)?.value.headers;
  const diagnostics: TheOddsApiDiagnostics = {
    requestedSportKeys: sportKeys,
    succeededSportKeys: fulfilled.map((result) => result.value.sportKey),
    failedSportKeys: sportKeys.filter(
      (sportKey) => !fulfilled.some((result) => result.value.sportKey === sportKey),
    ),
    errors: rejected.map((result) =>
      result.reason instanceof Error ? result.reason.message : String(result.reason),
    ),
    requestsRemaining: lastHeader?.requestsRemaining,
    requestsUsed: lastHeader?.requestsUsed,
    requestsLast: lastHeader?.requestsLast,
  };

  if (!fulfilled.length && rejected.length) {
    throw new Error(diagnostics.errors.join("; "));
  }

  return {
    events,
    diagnostics,
  };
}

export async function fetchTheOddsApiPlayerProps(options?: FetchOddsOptions) {
  const status = getProviderStatus().theOddsApi;
  const eventSeed = await fetchTheOddsApiOdds({
    ...options,
    markets: "h2h",
  });
  const sourceEvents = options?.eventIds
    ? eventSeed.events.filter((event) => options.eventIds?.split(",").includes(event.id))
    : eventSeed.events;
  const limitedEvents = sourceEvents.slice(0, Math.max(1, status.playerPropEventLimit));
  const results = await Promise.allSettled(
    limitedEvents.map(async (event) => {
      const url = buildTheOddsApiEventOddsUrl(event.sport_key, event.id, {
        ...options,
        markets: options?.markets ?? status.playerPropMarkets,
      });
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`The Odds API player props failed for ${event.id}: ${response.status} ${message}`);
      }

      return {
        sportKey: event.sport_key,
        event: (await response.json()) as TheOddsApiEvent,
        headers: {
          requestsRemaining: response.headers.get("x-requests-remaining"),
          requestsUsed: response.headers.get("x-requests-used"),
          requestsLast: response.headers.get("x-requests-last"),
        },
      };
    }),
  );
  const fulfilled = results.filter((result) => result.status === "fulfilled");
  const rejected = results.filter((result) => result.status === "rejected");
  const lastHeader = fulfilled.at(-1)?.value.headers ?? {
    requestsRemaining: eventSeed.diagnostics.requestsRemaining,
    requestsUsed: eventSeed.diagnostics.requestsUsed,
    requestsLast: eventSeed.diagnostics.requestsLast,
  };

  return {
    events: fulfilled.map((result) => result.value.event),
    diagnostics: {
      requestedSportKeys: limitedEvents.map((event) => event.sport_key),
      succeededSportKeys: fulfilled.map((result) => result.value.sportKey),
      failedSportKeys: rejected.map((_, index) => limitedEvents[index]?.sport_key ?? "unknown"),
      errors: rejected.map((result) =>
        result.reason instanceof Error ? result.reason.message : String(result.reason),
      ),
      requestsRemaining: lastHeader.requestsRemaining,
      requestsUsed: lastHeader.requestsUsed,
      requestsLast: lastHeader.requestsLast,
    },
  } satisfies TheOddsApiPlayerPropsResult;
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

export function normalizeTheOddsApiPlayerProps(events: TheOddsApiEvent[]): PickOpportunity[] {
  return events.flatMap((event) => {
    const sport = inferSportFromKey(event.sport_key);
    const team = toTeam(event.home_team, sport, event.sport_title);
    const opponent = toTeam(event.away_team, sport, event.sport_title);

    return event.bookmakers.flatMap((bookmaker) =>
      bookmaker.markets.flatMap((market) => {
        const mappedMarket = playerPropMarketMap[market.key];

        if (!mappedMarket) {
          return [];
        }

        return market.outcomes
          .filter((outcome) => typeof outcome.point === "number")
          .map((outcome) => {
            const playerName =
              outcome.description && !["over", "under"].includes(outcome.description.toLowerCase())
                ? outcome.description
                : outcome.name.replace(/\b(over|under)\b/gi, "").trim() || "Unknown Player";
            const side = outcome.name.toLowerCase().includes("under") ? "under" : "over";
            const line = outcome.point ?? 0;
            const player = playerFromName(playerName, sport, team.id);
            const app = sportsbookApp(bookmaker.title);

            return {
              id: `oddsapi:${event.id}:${bookmaker.key}:${market.key}:${slug(playerName)}:${side}:${line}`,
              sport,
              player,
              team,
              opponent,
              market: mappedMarket,
              app,
              sportsbook: bookmaker.title,
              odds: outcome.price,
              line,
              side,
              projection: line,
              diff: 0,
              l5HitRate: 0,
              l10HitRate: 0,
              l15HitRate: 0,
              seasonHitRate: 0,
              h2hHitRate: 0,
              streak: 0,
              opponentRank: 0,
              consistencyScore: 0,
              confidence: 0,
              edgeScore: 0,
              status: "live",
              injuryContext: "monitor",
              tags: [
                "Live OddsAPI line",
                bookmaker.title,
                mappedMarket.replace("player_", "").replaceAll("_", " "),
                `${side.toUpperCase()} ${line}`,
              ],
              rationale:
                "Live sportsbook player-prop line from The Odds API. Connect a stat-log provider to calculate hit rates, projections, consistency, and DvP.",
            } satisfies PickOpportunity;
          });
      }),
    );
  });
}

# Provider Audit

This audit compares the current PickResearch provider integrations with the public NewsAPI and The Odds API documentation.

## The Odds API

### Implemented
- API key lookup through `ODDSAPI`, `ODDSAPI_KEY`, `THE_ODDS_API_KEY`, and other fallbacks.
- `/v4/sports/{sport}/odds` URL builder.
- Sport-key mapping for NBA, MLB, NFL, NHL, tennis, soccer, and esports.
- Region-based odds requests.
- Bookmaker-specific odds requests via `THE_ODDS_API_BOOKMAKERS`.
- Featured markets via `THE_ODDS_API_MARKETS`.
- `oddsFormat` and `dateFormat`.
- `eventIds`, `commenceTimeFrom`, and `commenceTimeTo`.
- Optional response enrichment:
  - `includeLinks`
  - `includeSids`
  - `includeBetLimits`
  - `includeRotationNumbers`
- Quota header capture:
  - `x-requests-remaining`
  - `x-requests-used`
  - `x-requests-last`
- Event-level player-prop URL builder and fetcher for `/v4/sports/{sport}/events/{eventId}/odds`.
- Finder live player-prop rows from The Odds API when an odds key is configured.
- Fresh no-store requests on each page load.
- `THE_ODDS_API_PLAYER_PROP_EVENT_LIMIT` to control player-prop quota usage.

### Important limitation
The standard `/v4/sports/{sport}/odds` endpoint returns game-level markets such as `h2h`, `spreads`, `totals`, and `outrights`.

Player props are documented separately and must be requested one event at a time using:

```text
/v4/sports/{sport}/events/{eventId}/odds
```

with player-prop market keys such as:

- NBA: `player_points`, `player_rebounds`, `player_assists`, `player_threes`
- MLB: `batter_hits`, `batter_total_bases`, `pitcher_strikeouts`
- NHL: `player_shots_on_goal`, `player_goals`, `player_assists`
- Soccer: `player_shots`, `player_shots_on_target`, `player_assists`

The Odds API now sources sportsbook player-prop lines in Finder when event IDs and player markets are available, but it does not provide historical player stat logs or DFS-style hit-rate calculations by itself.

## NewsAPI

### Implemented
- API key lookup through `NEWSAPI_API_KEY` with fallbacks.
- `/v2/everything` URL builder.
- `/v2/top-headlines` URL builder through `NEWSAPI_ENDPOINT=top-headlines`.
- Server-side `X-Api-Key` authentication.
- Query configuration:
  - `q`
  - `searchIn`
  - `sources`
  - `domains`
  - `excludeDomains`
  - `from`
  - `to`
  - `language`
  - `sortBy`
  - `pageSize`
  - `page`
- Top-headlines configuration:
  - `country`
  - `category`
  - `sources`
- Article normalization into news feed items.

### Important limitation
NewsAPI only powers news and injury/feed context. It does not provide DFS prop lines, player pools, historical stat logs, or hit-rate calculations.

## DFS props and player stats

Finder, Players, and Player Detail pages require:

- DFS/sportsbook prop lines.
- Player identifiers.
- Historical game logs.
- Stat outcomes by prop market.
- Injury and matchup context.
- Defense-vs-position tables.

The current implementation uses live Odds API player-prop lines when available and falls back to a local demo DFS data layer only when no odds key is configured. A production implementation should still connect a DFS projections/stat-log provider or ingest stat logs into Supabase for hit rates, DvP, and projections.

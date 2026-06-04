# PickResearch

DFS player prop research platform for finding, filtering, and researching prop opportunities.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS responsive UI
- Supabase Postgres schema with RLS-ready user tables
- Zod-validated API routes
- Vercel deployment-ready scripts

## Features

- Pick Finder projections board with app filters, stat filters, line difference, L5/L10/L15 hit rates, H2H, streaks, and pick-builder queue
- Clickable player DFS research pages with current line, projection, recent averages, hit rates, streak, bar chart, and last-15 logs
- Provider-backed odds/news diagnostics remain available, but the primary product surface is player DFS props
- News engine for injuries, suspensions, lineups, coaching, transactions, and general alerts
- Server-only AI analysis endpoint
- Authenticated saved picks and favorite player/team APIs
- Support for NBA, MLB, NFL, NHL, Tennis, Soccer, and Esports

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in production values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
THE_ODDS_API_KEY=
THE_ODDS_API_REGIONS=us
THE_ODDS_API_BOOKMAKERS=
THE_ODDS_API_MARKETS=h2h,spreads,totals
THE_ODDS_API_PLAYER_PROP_MARKETS=player_points,player_rebounds,player_assists,player_threes,player_shots_on_goal,batter_hits,batter_total_bases,pitcher_strikeouts
THE_ODDS_API_ODDS_FORMAT=american
THE_ODDS_API_DATE_FORMAT=iso
THE_ODDS_API_EVENT_IDS=
THE_ODDS_API_COMMENCE_TIME_FROM=
THE_ODDS_API_COMMENCE_TIME_TO=
THE_ODDS_API_INCLUDE_LINKS=false
THE_ODDS_API_INCLUDE_SIDS=false
THE_ODDS_API_INCLUDE_BET_LIMITS=false
THE_ODDS_API_INCLUDE_ROTATION_NUMBERS=false
NEWSAPI_API_KEY=
NEWSAPI_ENDPOINT=everything
NEWSAPI_LANGUAGE=en
NEWSAPI_SORT_BY=publishedAt
NEWSAPI_PAGE_SIZE=25
NEWSAPI_QUERY=
NEWSAPI_SEARCH_IN=
NEWSAPI_SOURCES=
NEWSAPI_DOMAINS=
NEWSAPI_EXCLUDE_DOMAINS=
NEWSAPI_FROM=
NEWSAPI_TO=
NEWSAPI_TOP_HEADLINES_COUNTRY=us
NEWSAPI_TOP_HEADLINES_CATEGORY=sports
AI_PROVIDER_API_KEY=
```

The app uses mock provider data for local development until live provider adapters are configured.
`ODDS_API_KEY` and `NEWS_API_KEY` are still accepted as backwards-compatible fallbacks, but new deployments should use `THE_ODDS_API_KEY` and `NEWSAPI_API_KEY`.

## Provider Integrations

- The Odds API uses `/v4/sports/{sport}/odds` with `regions`, `markets`, `oddsFormat`, and `dateFormat`.
- The Odds API also supports `bookmakers`, `eventIds`, `commenceTimeFrom`, `commenceTimeTo`, `includeLinks`, `includeSids`, `includeBetLimits`, and `includeRotationNumbers`.
- The Odds API player props are not returned by the normal sport odds endpoint. They must be requested one event at a time from `/v4/sports/{sport}/events/{eventId}/odds` with player-prop market keys.
- NewsAPI uses `/v2/everything` with provider-safe server-side `X-Api-Key` authentication.
- NewsAPI also supports `top-headlines`, `searchIn`, `sources`, `domains`, `excludeDomains`, `from`, `to`, `language`, `sortBy`, `pageSize`, and `page`.
- `GET /api/providers/status` reports whether provider keys are configured without exposing secrets.
- Dashboard and news data prefer live provider data when keys are configured and fall back to mock data if keys are missing or providers are unavailable.

## Data Source Maturity

| Module | Current source | Notes |
| --- | --- | --- |
| Pick Finder projections | Demo metrics | PickFinder-style workflow; replace with imported DFS/sportsbook props for production. |
| Games | The Odds API or demo fallback | Live when `THE_ODDS_API_KEY` is configured. |
| Odds | The Odds API or demo fallback | Live latest prices. Historical movement needs persisted snapshots. |
| News | NewsAPI or demo fallback | Live when `NEWSAPI_API_KEY` is configured. |
| Public betting splits | Not live yet | Requires a dedicated splits provider or ingestion table. |
| Player DFS research pages | Demo metrics | Functional UX; requires stats/props provider ingestion before real betting use. |
| Team research metrics | De-emphasized | Team dashboards are not the primary product surface. |

The dashboard displays source badges, provider warnings, and live/demo status so users can tell what is trustworthy live data versus placeholder research scaffolding.

Important: `THE_ODDS_API_KEY` and `NEWSAPI_API_KEY` do not populate Finder players or DFS prop stat logs. They power dashboard odds/news only. To make `/finder`, `/players`, and `/players/[id]` live, connect and implement a DFS projections/stat-log provider via `DFS_PROPS_API_KEY` or a Supabase ingestion pipeline.

### Vercel Environment Variable Troubleshooting

If Vercel is not reading provider keys:

1. Go to Vercel Project -> Settings -> Environment Variables.
2. Add keys for the same environment you are deploying:
   - Pull request deployments use `Preview`.
   - Production domain deployments use `Production`.
   - Local `vercel dev` uses `Development`.
3. Use exact, case-sensitive names:
   - `THE_ODDS_API_KEY`
   - `NEWSAPI_API_KEY`
4. Redeploy after adding or changing env vars. Existing deployments do not automatically pick up new values.
5. Visit `/api/providers/status`.
   - `configured: true` means the server can read the private key.
   - `detectedAlias` shows which accepted private env name Vercel is reading.
   - `publicKeyDetected: true` means a `NEXT_PUBLIC_*` key was detected; remove it and use the private key name instead.

Accepted private fallbacks are `ODDS_API_KEY`, `THEODDSAPI_API_KEY`, `THE_ODDSAPI_API_KEY`, `NEWS_API_KEY`, and `NEWSAPI_KEY`, but the preferred names are `THE_ODDS_API_KEY` and `NEWSAPI_API_KEY`.

## Database

Apply the Supabase schema:

```bash
psql "$SUPABASE_DATABASE_URL" -f supabase/schema.sql
```

See `docs/architecture.md` for the complete architecture, API structure, folder structure, database design, security model, and deployment plan.
See `docs/provider-audit.md` for the NewsAPI and The Odds API feature-by-feature audit.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks

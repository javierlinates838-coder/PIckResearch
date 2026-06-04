# PickResearch

Production-ready sports research platform for finding betting edges and player prop opportunities.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS responsive UI
- Supabase Postgres schema with RLS-ready user tables
- Zod-validated API routes
- Vercel deployment-ready scripts

## Features

- Research dashboard with provider-backed odds/news, data-quality labels, provider warnings, and demo fallbacks
- Player research with last 5/10/season averages, splits, trends, consistency, hit rates, and matchup notes
- Team research with ratings, pace, recent form, trends, and injury impact
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
THE_ODDS_API_MARKETS=h2h,spreads,totals
THE_ODDS_API_ODDS_FORMAT=american
THE_ODDS_API_DATE_FORMAT=iso
NEWSAPI_API_KEY=
NEWSAPI_LANGUAGE=en
NEWSAPI_SORT_BY=publishedAt
NEWSAPI_PAGE_SIZE=25
NEWSAPI_QUERY=
AI_PROVIDER_API_KEY=
```

The app uses mock provider data for local development until live provider adapters are configured.
`ODDS_API_KEY` and `NEWS_API_KEY` are still accepted as backwards-compatible fallbacks, but new deployments should use `THE_ODDS_API_KEY` and `NEWSAPI_API_KEY`.

## Provider Integrations

- The Odds API uses `/v4/sports/{sport}/odds` with `regions`, `markets`, `oddsFormat`, and `dateFormat`.
- NewsAPI uses `/v2/everything` with provider-safe server-side `X-Api-Key` authentication.
- `GET /api/providers/status` reports whether provider keys are configured without exposing secrets.
- Dashboard and news data prefer live provider data when keys are configured and fall back to mock data if keys are missing or providers are unavailable.

## Data Source Maturity

| Module | Current source | Notes |
| --- | --- | --- |
| Games | The Odds API or demo fallback | Live when `THE_ODDS_API_KEY` is configured. |
| Odds | The Odds API or demo fallback | Live latest prices. Historical movement needs persisted snapshots. |
| News | NewsAPI or demo fallback | Live when `NEWSAPI_API_KEY` is configured. |
| Public betting splits | Not live yet | Requires a dedicated splits provider or ingestion table. |
| Player research metrics | Demo metrics | Requires stats/props provider ingestion before real betting use. |
| Team research metrics | Demo metrics | Requires stats provider ingestion before real betting use. |

The dashboard displays source badges, provider warnings, and live/demo status so users can tell what is trustworthy live data versus placeholder research scaffolding.

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

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks

# PickResearch

Production-ready sports research platform for finding betting edges and player prop opportunities.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS responsive UI
- Supabase Postgres schema with RLS-ready user tables
- Zod-validated API routes
- Vercel deployment-ready scripts

## Features

- Research dashboard with odds, line movement, public splits, sharp indicators, news, and games
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
ODDS_API_KEY=
NEWS_API_KEY=
AI_PROVIDER_API_KEY=
```

The app uses mock provider data for local development until live provider adapters are configured.

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

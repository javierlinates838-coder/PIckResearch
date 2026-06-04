# PickResearch Architecture

PickResearch is a modular sports research platform for discovering betting edges, player prop opportunities, matchup risks, and saved user research. The application is designed as a Vercel-hosted Next.js app backed by Supabase Postgres, with secure server-side data access and replaceable provider adapters for odds, news, injuries, and AI analysis.

## Product Modules

### 1. Research Dashboard
- Live odds by sport, league, game, market, and sportsbook.
- Line movement snapshots with open/current/best prices.
- Public betting percentages and sharp-vs-public signals.
- Injury and news feed for players, teams, and games.
- Upcoming games grouped by sport and start time.

### 2. Player Research
- Last 5, last 10, and season averages.
- Home/away splits and opponent matchup context.
- Usage, minutes, and opportunity trends.
- Consistency score and prop hit-rate calculations.
- Favoriting and notes for repeat research.

### 3. Team Research
- Offensive rating, defensive rating, pace, and trend metrics.
- Recent form and game-level matchup context.
- Favorite teams and team-specific notes.

### 4. News Engine
- Provider adapters for sports news, injury reports, lineup feeds, and beat-writer sources.
- Normalized news events tagged by sport, team, player, severity, and type.
- API surface designed for scheduled ingestion via Vercel Cron or Supabase Edge Functions.

### 5. AI Analysis Engine
- Server-only AI orchestration that receives normalized research context.
- Produces game summaries, matchup advantages, risk flags, and over/under prop rationale.
- Keeps provider API keys out of the browser.

### 6. User Research
- Saved picks, notes, favorite players, favorite teams, and result tracking.
- Supabase Auth-ready schema with row-level security policies.

## High-Level System Design

```text
Browser
  |
  | HTTPS, no provider keys
  v
Next.js App Router on Vercel
  |-- Server Components for dashboard/research pages
  |-- Route Handlers under /api for secure JSON APIs
  |-- Server Actions for authenticated mutations
  |
  | service/repository layer
  v
Supabase Postgres
  |-- Public normalized sports data
  |-- User-owned research data protected by RLS
  |
  +-- Scheduled ingestion jobs
      |-- Odds provider adapters
      |-- News/injury provider adapters
      |-- Stats provider adapters
      +-- AI provider adapter
```

## Database Schema

The canonical schema lives in `supabase/schema.sql`. It is organized around normalized sports reference data, event data, research metrics, provider snapshots, and user-owned research records.

### Reference Tables
- `sports`: NBA, MLB, NFL, NHL, Tennis, Soccer, Esports.
- `leagues`: League metadata by sport.
- `teams`: Team metadata, colors, abbreviation, active status.
- `players`: Player metadata linked to teams and sports.
- `sportsbooks`: Supported books and external provider keys.

### Game and Market Tables
- `games`: Scheduled and completed events.
- `odds_markets`: Market definitions such as spread, moneyline, total, and player props.
- `odds_snapshots`: Time-series odds and line movement.
- `betting_splits`: Public ticket/money percentages and sharp signal inputs.

### Research Tables
- `player_stat_logs`: Per-game player box score and usage data.
- `player_prop_outcomes`: Historical prop lines and outcomes for hit-rate calculation.
- `player_research_metrics`: Precomputed last 5/10/season aggregates, splits, trends, consistency, and hit rates.
- `team_research_metrics`: Team ratings, pace, recent form, and trend fields.

### News and AI Tables
- `news_items`: Normalized news, injury, suspension, lineup, and coaching events.
- `ai_analysis`: Generated analysis records attached to games, teams, players, or props.

### User Tables
- `profiles`: Supabase Auth profile extension.
- `saved_picks`: User picks and result tracking.
- `research_notes`: User notes attached to entities.
- `favorite_players`: User favorite players.
- `favorite_teams`: User favorite teams.

## API Structure

All route handlers validate query/body input with Zod and call server-only service modules.

```text
/api/dashboard
  GET: dashboard summary with games, odds, splits, news, and sharp indicators

/api/players
  GET: searchable player list

/api/players/[id]/research
  GET: player splits, trends, matchup analysis, consistency, and hit rates

/api/teams
  GET: searchable team list

/api/teams/[id]/research
  GET: team ratings, pace, trends, and recent form

/api/news
  GET: normalized news feed filtered by sport/team/player/type/severity

/api/ai/analyze
  POST: server-only AI research explanation endpoint

/api/user/picks
  GET/POST: authenticated saved picks

/api/user/favorites
  GET/POST/DELETE: authenticated favorite players and teams
```

## Folder Structure

```text
src/
  app/
    (marketing)/
    dashboard/
    players/
    teams/
    api/
  components/
    dashboard/
    layout/
    research/
    ui/
  config/
  data/
    mock/
  lib/
    ai/
    api/
    providers/
    repositories/
    supabase/
    utils/
    validators/
  types/
supabase/
  schema.sql
docs/
  architecture.md
```

## Security Model

- Client components never import provider SDKs or API keys.
- Supabase anon keys are only used for browser-safe operations; service-role access remains server-only.
- Route handlers use Zod validation and centralized API response helpers.
- User-owned data relies on Supabase Auth and RLS policies.
- External provider requests are isolated behind adapter interfaces in `src/lib/providers`.
- AI provider calls are performed only on the server.

## Deployment Plan

### Vercel
1. Create a Vercel project connected to the Git repository.
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ODDS_API_KEY`
   - `NEWS_API_KEY`
   - `AI_PROVIDER_API_KEY`
3. Configure build command: `npm run build`.
4. Configure output from the default Next.js build.

### Supabase
1. Create a Supabase project.
2. Apply `supabase/schema.sql`.
3. Enable Supabase Auth providers as needed.
4. Confirm RLS policies for user-owned tables.
5. Schedule ingestion jobs with Vercel Cron or Supabase Edge Functions.

### Data Ingestion
- Start with mock provider adapters for local development.
- Add production adapters per provider without changing UI or API contracts.
- Persist raw provider references in `source` and `external_*` columns for traceability.

## Initial Implementation Milestones

1. Scaffold Next.js, TypeScript, Tailwind, linting, and Vercel-compatible scripts.
2. Add typed domain models and Supabase clients.
3. Build dashboard, player research, team research, and news UI using mock data.
4. Add validated API route handlers.
5. Add Supabase schema and RLS policies.
6. Add AI analysis route with a deterministic fallback for local development.
7. Add authenticated user research mutations once Supabase Auth is configured.

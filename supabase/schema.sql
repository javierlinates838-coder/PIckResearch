create extension if not exists "pgcrypto";

create type sport_key as enum ('nba', 'mlb', 'nfl', 'nhl', 'tennis', 'soccer', 'esports');
create type market_type as enum (
  'moneyline',
  'spread',
  'total',
  'player_points',
  'player_rebounds',
  'player_assists',
  'player_shots',
  'player_strikeouts',
  'player_kills'
);
create type news_type as enum ('injury', 'suspension', 'lineup', 'coaching', 'transaction', 'general');
create type severity_level as enum ('low', 'medium', 'high', 'critical');
create type pick_result as enum ('pending', 'win', 'loss', 'push', 'void');

create table public.sports (
  key sport_key primary key,
  label text not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  sport sport_key not null references public.sports (key),
  name text not null,
  abbreviation text not null,
  country text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (sport, abbreviation)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  sport sport_key not null references public.sports (key),
  league_id uuid references public.leagues (id),
  external_id text,
  name text not null,
  abbreviation text not null,
  city text,
  primary_color text,
  secondary_color text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sport, abbreviation)
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  sport sport_key not null references public.sports (key),
  team_id uuid references public.teams (id),
  external_id text,
  name text not null,
  position text,
  jersey_number text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sportsbooks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  provider_key text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.provider_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('newsapi', 'theoddsapi', 'stats', 'ai')),
  status text not null check (status in ('started', 'succeeded', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  records_processed integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  sport sport_key not null references public.sports (key),
  league_id uuid references public.leagues (id),
  external_id text,
  starts_at timestamptz not null,
  home_team_id uuid references public.teams (id),
  away_team_id uuid references public.teams (id),
  venue text,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.odds_markets (
  id uuid primary key default gen_random_uuid(),
  sport sport_key not null references public.sports (key),
  market market_type not null,
  label text not null,
  active boolean not null default true,
  unique (sport, market)
);

create table public.odds_snapshots (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  sportsbook_id uuid references public.sportsbooks (id),
  market market_type not null,
  player_id uuid references public.players (id),
  selection text not null,
  line numeric,
  price integer,
  opening_line numeric,
  opening_price integer,
  source text,
  captured_at timestamptz not null default now()
);

create table public.betting_splits (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  market market_type not null,
  selection text not null,
  public_tickets_pct numeric not null check (public_tickets_pct >= 0 and public_tickets_pct <= 100),
  public_money_pct numeric not null check (public_money_pct >= 0 and public_money_pct <= 100),
  sharp_side text not null default 'none',
  confidence numeric not null check (confidence >= 0 and confidence <= 100),
  source text,
  captured_at timestamptz not null default now()
);

create table public.player_stat_logs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  game_id uuid references public.games (id) on delete set null,
  opponent_team_id uuid references public.teams (id),
  is_home boolean,
  minutes numeric,
  usage_pct numeric,
  points numeric,
  rebounds numeric,
  assists numeric,
  shots numeric,
  strikeouts numeric,
  kills numeric,
  played_at timestamptz not null,
  source text,
  created_at timestamptz not null default now()
);

create table public.player_prop_outcomes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  game_id uuid references public.games (id) on delete set null,
  market market_type not null,
  line numeric not null,
  actual numeric not null,
  hit boolean not null,
  sportsbook_id uuid references public.sportsbooks (id),
  played_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.player_research_metrics (
  player_id uuid primary key references public.players (id) on delete cascade,
  opponent_team_id uuid references public.teams (id),
  market market_type not null,
  current_line numeric,
  last5_average numeric,
  last10_average numeric,
  season_average numeric,
  home_average numeric,
  away_average numeric,
  usage_trend_pct numeric,
  minutes_trend_pct numeric,
  consistency_score numeric check (consistency_score >= 0 and consistency_score <= 100),
  hit_rate_last5 numeric check (hit_rate_last5 >= 0 and hit_rate_last5 <= 100),
  hit_rate_last10 numeric check (hit_rate_last10 >= 0 and hit_rate_last10 <= 100),
  hit_rate_season numeric check (hit_rate_season >= 0 and hit_rate_season <= 100),
  matchup_rank integer,
  matchup_note text,
  risk_flags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.team_research_metrics (
  team_id uuid primary key references public.teams (id) on delete cascade,
  offensive_rating numeric,
  defensive_rating numeric,
  pace numeric,
  recent_form text,
  net_rating_trend numeric,
  injury_impact text not null default 'low',
  trend_summary text,
  updated_at timestamptz not null default now()
);

create table public.news_items (
  id uuid primary key default gen_random_uuid(),
  sport sport_key not null references public.sports (key),
  type news_type not null,
  severity severity_level not null default 'low',
  title text not null,
  summary text not null,
  source text not null,
  url text,
  player_id uuid references public.players (id),
  team_id uuid references public.teams (id),
  game_id uuid references public.games (id),
  published_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  game_id uuid references public.games (id) on delete cascade,
  player_id uuid references public.players (id) on delete cascade,
  team_id uuid references public.teams (id) on delete cascade,
  market text,
  summary text not null,
  matchup_advantages text[] not null default '{}',
  risks text[] not null default '{}',
  valuation text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sport sport_key not null,
  entity_type text not null check (entity_type in ('game', 'player', 'team')),
  entity_id text not null,
  market text not null,
  selection text not null,
  line numeric,
  odds integer,
  sportsbook text,
  result pick_result not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.research_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_type text not null check (entity_type in ('game', 'player', 'team', 'prop')),
  entity_id text not null,
  title text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorite_players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  player_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, player_id)
);

create table public.favorite_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  team_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, team_id)
);

create index odds_snapshots_game_market_idx on public.odds_snapshots (game_id, market, captured_at desc);
create index betting_splits_game_market_idx on public.betting_splits (game_id, market, captured_at desc);
create index player_stat_logs_player_played_idx on public.player_stat_logs (player_id, played_at desc);
create index news_items_sport_published_idx on public.news_items (sport, published_at desc);
create index saved_picks_user_created_idx on public.saved_picks (user_id, created_at desc);
create index research_notes_user_entity_idx on public.research_notes (user_id, entity_type, entity_id);
create index provider_ingestion_runs_provider_started_idx on public.provider_ingestion_runs (provider, started_at desc);

alter table public.profiles enable row level security;
alter table public.saved_picks enable row level security;
alter table public.research_notes enable row level security;
alter table public.favorite_players enable row level security;
alter table public.favorite_teams enable row level security;
alter table public.ai_analysis enable row level security;
alter table public.provider_ingestion_runs enable row level security;

create policy "profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are editable by owner"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "saved picks are owned by user"
  on public.saved_picks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "research notes are owned by user"
  on public.research_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "favorite players are owned by user"
  on public.favorite_players for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "favorite teams are owned by user"
  on public.favorite_teams for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ai analysis owned by user or public system record"
  on public.ai_analysis for select
  using (user_id is null or auth.uid() = user_id);

create policy "ai analysis insert by owner"
  on public.ai_analysis for insert
  with check (user_id is null or auth.uid() = user_id);

insert into public.sports (key, label, description)
values
  ('nba', 'NBA', 'Basketball player props, usage, pace, and matchup research.'),
  ('mlb', 'MLB', 'Baseball props, lineup news, pitcher trends, and park context.'),
  ('nfl', 'NFL', 'Football usage, injuries, pace, and market movement.'),
  ('nhl', 'NHL', 'Hockey goalie news, shot props, lines, and pace.'),
  ('tennis', 'Tennis', 'Surface splits, form, and matchup tendencies.'),
  ('soccer', 'Soccer', 'Lineups, xG trends, injuries, and global markets.'),
  ('esports', 'Esports', 'Roster news, map pools, role usage, and kill props.')
on conflict (key) do update
set label = excluded.label,
    description = excluded.description;

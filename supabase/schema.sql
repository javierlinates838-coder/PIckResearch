-- ResellAI: eBay Reseller Assistant schema
create extension if not exists "pgcrypto";

create type listing_status as enum ('draft', 'listed', 'sold', 'shipped');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  ebay_user_id text,
  ebay_username text,
  ebay_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ebay_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status listing_status not null default 'draft',
  title text,
  description text,
  category text,
  brand text,
  model text,
  color text,
  condition text,
  keywords text[] not null default '{}',
  item_specifics jsonb not null default '{}'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  enhanced_photos jsonb not null default '[]'::jsonb,
  ai_identification jsonb,
  market_research jsonb,
  pricing jsonb,
  listing_copy jsonb,
  profit jsonb,
  ebay_item_id text,
  ebay_listing_url text,
  cost_basis numeric(12, 2),
  sale_price numeric(12, 2),
  shipping_cost numeric(12, 2),
  ebay_fees numeric(12, 2),
  tax_amount numeric(12, 2),
  net_profit numeric(12, 2),
  roi_pct numeric(8, 2),
  sold_at timestamptz,
  shipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.market_snapshots (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete cascade,
  query text not null,
  avg_sold_price numeric(12, 2),
  highest_sold_price numeric(12, 2),
  lowest_sold_price numeric(12, 2),
  sold_count integer not null default 0,
  trend text check (trend in ('rising', 'stable', 'falling')),
  suggested_bin_price numeric(12, 2),
  suggested_auction_price numeric(12, 2),
  comps jsonb not null default '[]'::jsonb,
  source text not null default 'ebay',
  captured_at timestamptz not null default now()
);

create table public.analytics_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  revenue numeric(12, 2) not null default 0,
  profit numeric(12, 2) not null default 0,
  items_sold integer not null default 0,
  items_listed integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index listings_user_status_idx on public.listings (user_id, status, updated_at desc);
create index listings_user_search_idx on public.listings using gin (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(model, '') || ' ' || coalesce(category, ''))
);
create index listings_user_created_idx on public.listings (user_id, created_at desc);
create index market_snapshots_listing_idx on public.market_snapshots (listing_id, captured_at desc);
create index analytics_daily_user_date_idx on public.analytics_daily (user_id, date desc);

alter table public.profiles enable row level security;
alter table public.ebay_tokens enable row level security;
alter table public.listings enable row level security;
alter table public.market_snapshots enable row level security;
alter table public.analytics_daily enable row level security;

create policy "profiles owned by user"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "ebay tokens owned by user"
  on public.ebay_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "listings owned by user"
  on public.listings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "market snapshots via listing owner"
  on public.market_snapshots for all
  using (
    listing_id is null
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  );

create policy "analytics owned by user"
  on public.analytics_daily for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

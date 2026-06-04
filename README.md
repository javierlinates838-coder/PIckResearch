# ResellAI — eBay Reseller Assistant

AI-powered web app to list items on eBay faster and maximize profit. Competes with Vendoo, List Perfectly, and SellHound with deeper AI pricing research and a streamlined listing workflow.

## Features

- **Photo upload (1–10)** — AI identifies product, brand, model, color, condition, category + confidence score
- **Market research** — eBay sold comps: avg/high/low, sold count, trend, suggested BIN & auction prices
- **AI listing generator** — SEO title, description, item specifics, keywords, shipping suggestions
- **Photo enhancer** — Background removal & white-background images via PhotoRoom API
- **Profit calculator** — Sale price, shipping, eBay fees, taxes, net profit, ROI
- **Inventory dashboard** — Search, filter by status (draft / listed / sold / shipped)
- **One-click eBay listing** — OAuth connect + publish API
- **AI pricing engine** — Aggressive, market, and quick-sale tiers + opportunity detection
- **Analytics** — Revenue charts, sell-through, avg profit, top categories
- **Mobile-first UI** — Apple-inspired design, smooth animations, dark mode

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Supabase (Postgres + auth-ready schema)
- OpenAI (vision + structured generation via AI SDK)
- eBay Developer API
- PhotoRoom API
- Vercel deployment

## Quick start

```bash
npm install
cp .env.example .env.local
# Add OPENAI_API_KEY for live AI; other keys optional (demo mode works)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See [`.env.example`](./.env.example). Minimum for full experience:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Product vision + listing + pricing AI |
| `NEXT_PUBLIC_SUPABASE_URL` | Persistent inventory |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side listing CRUD |
| `EBAY_*` | Live sold comps + OAuth publish |
| `PHOTOROOM_API_KEY` | Background removal |

Without API keys, the app runs in **demo mode** with mock market data and sample identifications.

## Database

Apply the schema in Supabase SQL editor:

```bash
# File: supabase/schema.sql
```

## Project structure

```
src/
  app/              # Pages & API routes
  components/       # UI (wizard, inventory, analytics)
  lib/
    ai/             # OpenAI vision, listing, pricing
    ebay/           # Browse API, OAuth
    photoroom/      # Image enhancement
    repositories/   # Listings + analytics (Supabase or in-memory)
  types/
```

## Deploy on Vercel

1. Push to GitHub and import in Vercel
2. Add environment variables from `.env.example`
3. Set `EBAY_OAUTH_REDIRECT_URI` to `https://your-domain.com/api/ebay/callback`
4. Run `supabase/schema.sql` on your Supabase project

## License

UNLICENSED — private use.

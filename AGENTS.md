# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Single Next.js 16 app (**PickResearch**) at repo root. No monorepo, Docker Compose, or separate backend. All routes live under `src/app/`.

### Required service

| Service | Command | URL |
|---------|---------|-----|
| Next.js dev server | `npm run dev` | http://localhost:3000 |

Mock/demo data is built in (`src/lib/providers/mock-sports-data.ts`, `src/lib/dfs/props-data.ts`). No API keys are required for UI smoke tests or the hello-world flow (Finder, Players, Dashboard, News).

### Optional external dependencies

- **Supabase** — required only for `/api/user/*` (saved picks, favorites). Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, those APIs return 503.
- **THE_ODDS_API_KEY** / **NEWSAPI_API_KEY** — live dashboard odds/news; app falls back to demo data when unset.
- **DFS_PROPS_API_KEY** — detected in `/api/providers/status` but not wired to live Finder/Players ingestion yet.

Copy `.env.example` → `.env.local` before running locally. See README for full variable list.

### Standard commands (repo root)

| Task | Command |
|------|---------|
| Install | `npm install` |
| Dev | `npm run dev` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |
| Production run | `npm run start` (after `npm run build`) |

There is **no** `npm test` script or test suite in this repo.

### Diagnostics

- `GET /api/providers/status` — which provider keys are configured (no secrets exposed).
- `GET /api/finder?sport=nba` — sample Finder JSON with demo props when no live providers.

### Long-running dev server

Use tmux for `npm run dev` so the session survives backgrounding:

```bash
SESSION_NAME="pickresearch-dev"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null \
  || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "/workspace" -- bash -l
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" 'cd /workspace && npm run dev' C-m
```

### Gotchas

- First `npm run build` may prompt about Next.js telemetry; it does not block the build.
- Reinstalling dependencies while `next dev` is running may require restarting the dev server for changes to apply reliably.
- User-authenticated flows need a real Supabase project, schema from `supabase/schema.sql`, and a Bearer token — not covered by demo/mock mode.

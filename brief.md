# FIFA World Cup 2026 Dashboard

A live tournament scoreboard built with Next.js 14, deployed on Vercel.

## What it does

Displays the full FIFA World Cup 2026 bracket — all 12 group stages (A–L) with standings tables, match results, and the knockout bracket from Round of 32 through the Final. Scores are persisted in Upstash Redis and auto-updated daily via a cron job that pulls finished match results from API-Football.

## How it works

1. **`lib/matches.ts`** — single source of truth for all static match data (fixtures, groups, flags)
2. **`lib/kv.ts`** — thin wrapper around Upstash Redis; scores stored under key `wc2026:scores`
3. **`app/page.tsx`** — server component that reads scores from Redis and passes them as props (ISR, revalidates every 3 minutes)
4. **`components/WorldCup2026.tsx`** — entire UI as a single client component; POSTs to `/api/scores` on every score save
5. **`app/api/cron/sync/route.ts`** — runs daily at 06:00 UTC; fetches finished fixtures from API-Football and writes results to Redis

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Redis env vars the app runs fine — scores just won't persist between page loads.

## Manually updating scores

POST to the admin endpoint with your `ADMIN_SECRET`:

```bash
curl -X POST https://radwank-design-worldcup26.vercel.app/api/admin/update \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"A|Mexico|South Africa": {"homeScore": 2, "awayScore": 1}}'
```

Score keys follow the format `"groupId|home|away"` (e.g. `"A|Mexico|South Africa"`).

## Manually triggering the cron sync

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://radwank-design-worldcup26.vercel.app/api/cron/sync
```

## Environment variables

| Variable | Purpose |
|---|---|
| `API_FOOTBALL_KEY` | API key from api-football.com |
| `ADMIN_SECRET` | Bearer token for manual score overrides |
| `KV_REST_API_URL` | Upstash Redis URL (auto-injected by Vercel) |
| `KV_REST_API_TOKEN` | Upstash Redis token (auto-injected by Vercel) |
| `CRON_SECRET` | Auto-injected by Vercel for cron authentication |

## Live URL

https://radwank-design-worldcup26.vercel.app

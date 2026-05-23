# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build — run this to verify before pushing
npm run lint       # ESLint check
npx tsc --noEmit   # TypeScript type check without building
```

**Note:** This machine requires `npm config set strict-ssl false` due to SSL interception. If `npm install` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, run that command first.

## Architecture

**Data flow:**
1. `lib/matches.ts` — single source of truth for all static match data (`GM_RAW`, `KO_RAW`, `GROUPS`, `FLAGS`). Both the React component and the API routes import from here. Never duplicate match data.
2. `lib/kv.ts` — thin wrapper around `@vercel/kv`. Scores are stored under one key (`wc2026:scores`) as `Record<string, {homeScore, awayScore}>`. Score keys are formatted `"${groupId}|${home}|${away}"` (e.g. `"A|Mexico|South Africa"`).
3. `app/page.tsx` — async server component that reads scores from KV and passes them as `initialScores` prop. Uses ISR (`revalidate = 180`).
4. `components/WorldCup2026.tsx` — the entire UI as a single `"use client"` component. It hydrates local state from `initialScores`, and POSTs to `/api/scores` on every score save/clear to persist changes.

**API routes:**
- `GET/POST /api/scores` — public; browser uses POST to save score edits
- `POST /api/admin/update` — requires `Authorization: Bearer $ADMIN_SECRET`; for programmatic/curl overrides
- `GET /api/cron/sync` — called by Vercel Cron every 3h; requires `Authorization: Bearer $CRON_SECRET` (auto-injected by Vercel); fetches finished fixtures from API-Football (league ID `1`, season `2026`) and merges into KV

**Cron config:** `vercel.json` declares the cron schedule. Vercel automatically injects `CRON_SECRET` and adds the `Authorization` header to cron requests.

## Environment Variables

| Variable | Where used |
|---|---|
| `API_FOOTBALL_KEY` | `app/api/cron/sync/route.ts` — x-apisports-key header |
| `ADMIN_SECRET` | `app/api/admin/update/route.ts` — bearer token check |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | auto-read by `@vercel/kv` |
| `CRON_SECRET` | auto-injected by Vercel for cron requests |

For local dev without KV, `lib/kv.ts` catches errors and returns `{}` — the dashboard renders fine with no persisted scores.

## Key Constraints

- The `@vercel/kv` package is deprecated but functional. The Upstash Redis integration via Vercel Marketplace injects the same `KV_*` env vars, so it's compatible.
- `app/api/cron/sync/route.ts` contains a `TEAM_MAP` that normalises API-Football team names to the canonical names used in `lib/matches.ts`. If a team name from the API doesn't map correctly, add it there.
- The component uses an inline `CSS` string (no external stylesheet or Tailwind). All styling changes go in that string.

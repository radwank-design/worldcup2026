# Manual Knockout Scores — Design

**Date:** 2026-06-28
**Status:** Approved (pending spec review)

## Problem

Scores can be entered and saved for the group stage (click a standings row → UPDATE
SCORE modal → save to KV). Knockout matches (Round of 32 through Final) appear only as
**read-only rows in the Schedule tab** and cannot be scored. The auto-sync cron also
only matches `GROUP_MATCHES`, so it skips knockout fixtures entirely.

The user wants to **manually enter and save knockout scores as the tournament
progresses**. No auto-advance of winners, no cron/API changes — manual entry only.

## Requirements

- Knockout match rows in the Schedule tab are clickable and open the existing UPDATE
  SCORE modal.
- Saving persists the score to KV; clearing removes it; both survive refresh.
- A saved score displays on the row (e.g. `2 – 1`) in place of `vs`.
- **All** knockout rows are editable, including Round of 16 and later, even though
  those still show placeholder team names (`Winner M101`) because there is no
  auto-advance. Scores persist keyed by match number regardless of team names.

## Non-Goals (YAGNI)

- No auto-advancement of winners into later rounds. `Winner M101` placeholders stay as-is.
- No changes to the cron sync (`/api/cron/sync`) or any API route.
- No dedicated bracket/knockout tab — reuse the Schedule tab and the existing modal.

## Design

### Persistence key scheme

Group scores are keyed `` `${group}|${home}|${away}` `` in the single KV blob
`wc2026:scores`. Knockout matches have no group but carry a unique match number `mn`.
New knockout key, namespaced with a `KO` prefix so it never collides with group keys
(A–L):

```
KO|${mn}|${home}|${away}        e.g.  "KO|73|South Africa|Canada"
```

`/api/scores` (GET/POST) already does a generic merge over arbitrary string keys, so
**no backend changes are needed** — the new keys ride in the same blob.

### State

`components/WorldCup2026.tsx` gains a parallel knockout-score map alongside the existing
group `results`:

```ts
type KoScores = Record<number, { homeScore: number | null; awayScore: number | null }>;
const [koScores, setKoScores] = useState<KoScores>(() => buildKoScores(initialScores));
```

- `buildKoScores(scores)` extracts entries whose key starts with `KO|`, parses out `mn`,
  and returns the map. Added next to `buildResults`.
- The existing on-mount `/api/scores` fetch (currently `setResults(buildResults(live))`)
  also calls `setKoScores(buildKoScores(live))` so saved knockout scores hydrate after
  ISR-cached HTML loads.

### Editing model

`editM` is generalized from `{ g, i }` to a discriminated union:

```ts
type EditTarget =
  | { kind: "group"; g: string; i: number }
  | { kind: "ko"; mn: number };
const [editM, setEditM] = useState<EditTarget | null>(null);
```

- `em` (teams + current score shown in the modal) resolves from `results[g][i]` for
  `kind:"group"`, or from the `KNOCKOUT_MATCHES` entry (for teams) merged with
  `koScores[mn]` (for the score) for `kind:"ko"`.
- `saveScore` / `clearScore` branch on `editM.kind`:
  - group → existing behavior (key `g|home|away`, update `results`).
  - ko → key `KO|${mn}|${home}|${away}`, update `koScores`, POST to `/api/scores`.

The modal markup itself is unchanged; only its data source generalizes.

### Schedule rendering

In the knockout branch of the Schedule tab (rows where `"mn" in m`):

- Row gets `cursor:pointer` + hover affordance, mirroring the group standings rows.
- `onClick` sets `editM = { kind: "ko", mn: m.mn }` and seeds the input from
  `koScores[m.mn]`.
- If `koScores[m.mn]` has a score, the row shows `homeScore – awayScore` instead of `vs`.
- Group-stage rows in the Schedule tab remain unchanged (not in scope).

## Components touched

- `components/WorldCup2026.tsx` — only file changed:
  - add `buildKoScores`
  - add `koScores` state + mount hydration
  - generalize `editM` union, `em` resolution, `saveScore`, `clearScore`
  - make knockout schedule rows clickable + show saved score

No changes to `lib/matches.ts`, `lib/kv.ts`, or any `app/api/*` route.

## Testing / verification

- `npx tsc --noEmit` and `npm run build` pass.
- Manual: in Schedule → Round of 32, click a match, enter a score, save; reload and
  confirm it persists and renders on the row. Repeat for a later round (placeholder
  team names) to confirm `mn`-keyed save works there too.
- Confirm group-stage editing still works unchanged.

## Limitation (documented, accepted)

Without auto-advance, Round of 16+ rows display `Winner M101`-style placeholder names.
Scores entered there are stored by match number and will display, but the participant
names remain placeholders until separately updated. This is an accepted trade-off of the
manual-only, no-auto-advance scope.

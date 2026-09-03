# Backlog

Living capture for Par🇮🇹le. We add items here while chatting. Nothing is a
commitment until it is marked **decided**.

## How we use this file

- Dump wants, changes, fixes, and improvements as they come up.
- Status: `inbox` → `decided` → `doing` → `done` (or `wont`).
- When we start work, we can turn decided items into issues or PRs.

## Constraints

Standing product rules, not work items.

- Visual parity with the live game: https://pietroppeter.github.io/wordle-it/.
  Details: [`REFERENCE.md`](./REFERENCE.md)
- Game Day, countdown, and Streak use the calendar date in **Europe/Rome**.
  Do not copy live-site timezone, DST, or leap-year bugs.
- Same Puzzle sequence as live Parle (same lists, First Game Day 3 January
  2022). [`docs/adr/0004-same-puzzle-sequence.md`](./docs/adr/0004-same-puzzle-sequence.md)
- Plays are the source of truth. Guest play works with no Account.
  [`docs/adr/0001-plays-are-source-of-truth.md`](./docs/adr/0001-plays-are-source-of-truth.md),
  [`docs/adr/0002-account-wins-on-login.md`](./docs/adr/0002-account-wins-on-login.md)

## Stack

React, [TanStack Start](https://tanstack.com/start), Tailwind,
[shadcn/ui](https://ui.shadcn.com/), PostgreSQL, [Drizzle](https://orm.drizzle.team/),
[WorkOS AuthKit](https://workos.com/docs/sdks/authkit-tanstack-start)
(`@workos/authkit-tanstack-react-start`), [Railway](https://railway.app/) Europe.

AuthKit is the hosted UI (not a custom login form): email magic link + Google,
Italian locale, no passwords. Apple later if we wrap as an iOS app.

Railway graph lives in [`.railway/railway.ts`](https://docs.railway.com/infrastructure-as-code).
Compose is local Postgres. Drizzle is schema. `railway config apply` is the graph.
Environments: `staging` and `production`, both on `main`. Push deploys staging.
Production is a manual deploy after staging is good. Separate Postgres per
environment. Secrets (WorkOS, including `WORKOS_REDIRECT_URI`) stay on Railway
via `preserve()`. [`docs/adr/0003-host-on-railway.md`](./docs/adr/0003-host-on-railway.md)

## Current snapshot (2026-09-03)

- Rewrite is live. Guest play works locally (`pnpm run dev`, port 3000) and on
  Railway with no Account. Accedi stores Account Plays in Postgres.
- Railway: [staging](https://parle-staging.up.railway.app/) and
  [production](https://parle-production-93f3.up.railway.app/).
- GitHub autodeploy is not connected yet. Until it is, promote with
  `railway redeploy --from-source --environment staging` (then production, by
  hand).

## Do

<!-- example: - [inbox] … -->

## Change

<!-- example: - [inbox] … -->

## Fix

<!-- example: - [inbox] … -->

## Improve

<!-- example: - [inbox] … -->

## Parking lot

Ideas not yet classified. Promote into the sections above when you want them.

- GitHub autodeploy (Railway already declares the GitHub source)
- Custom domain
- Random analytics sampling and public Plausible dashboard belong to upstream
- Upstream dictionary / share issues; not in scope until we pick them up
- Live multi-device sync (TanStack DB) — optional later, not for anti-cheat
- Convex — **[wont]** (would replace Postgres + Drizzle)

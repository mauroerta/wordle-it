# Modernization backlog

Living capture for this fork of [Par🇮🇹le](https://github.com/pietroppeter/wordle-it) (Italian Wordle). We add items here while chatting. Nothing is a commitment until it is marked **decided**.

## How we use this file

- Dump wants, changes, fixes, and improvements as they come up.
- Status: `inbox` → `decided` → `doing` → `done` (or `wont`).
- When we start work, we can turn decided items into issues or PRs.

## Constraints

- **[decided]** Visual parity with the live game: https://pietroppeter.github.io/wordle-it/
- **[decided]** Rewrite the implementation; do not redesign what players see.
- **[decided]** Timezone / game-day / streak behavior is an exception: fix it, do not copy the live site. Details: [`REFERENCE.md`](./REFERENCE.md)
- **[decided]** Same Puzzle sequence as live Parle (same lists, First Game Day 3 January 2022). Nim is offline; lists ship as data. [`docs/adr/0004-same-puzzle-sequence.md`](./docs/adr/0004-same-puzzle-sequence.md)

## Stack

- **[decided]** React
- **[decided]** [TanStack Start](https://tanstack.com/start) as the framework
- **[decided]** Tailwind CSS for styling (used to reproduce the existing look, not a new aesthetic)
- **[decided]** [shadcn/ui](https://ui.shadcn.com/) for base components
- **[decided]** PostgreSQL for data (not Convex)
- **[decided]** [Drizzle](https://orm.drizzle.team/) as the ORM
- **[decided]** [WorkOS AuthKit](https://workos.com/docs/sdks/authkit-tanstack-start) for authentication (`@workos/authkit-tanstack-react-start`)
  - Hosted AuthKit UI (not a custom login form)
  - Email magic link + Google
  - No passwords. Apple later if we wrap as an iOS app.
  - Locale: Italian
- **[decided]** [Railway](https://railway.app/) hosts the app and Postgres (not GitHub Pages, not Vercel + Neon)
  - Region: Europe
  - Custom domain later. First milestone: working app locally (Guest play, no Railway/WorkOS accounts required). Plug in Railway + WorkOS when those accounts exist.

## Current snapshot (2026-08-30)

- Fork of `pietroppeter/wordle-it`, hosted originally at https://pietroppeter.github.io/wordle-it/
- This clone: `mauroerta/wordle-it`
- Rewrite in progress: TanStack Start + React at the repo root. Guest play
  is local (no WorkOS/Railway yet) and playable at `npm run dev` (port 3000).
  Original static site and Nim dictionary tooling live in `legacy/`.
- Puzzle and allowed-guess lists extracted from `legacy/wordle-it.js` into `src/puzzle/`.
- Game Day is the calendar date in Europe/Rome. Plays are stored on the device. Statistics are computed from Plays.

## Do

- **[decided]** Persist Plays, not counters. Today the live game stores only aggregate Statistics plus today’s board; a new browser wipes everything. An Account owns Plays in Postgres (Drizzle). Statistics and Streak are always computed from Plays.
  - Identity: WorkOS AuthKit, using the official TanStack Start SDK.
  - Guests can play without logging in. In the new app they also store Plays on the device (not Wordle-style counters).
  - One Play per Player per Game Day — Guest or Account does not change that.
  - Creating an Account: the Guest becomes that Account; device Plays are kept.
  - Logging into an existing Account: Account always wins. Guest Plays on the device are replaced, not merged — even if the Account has no Play for today.
  - Logging out: new Guest with no Plays on that device. Account Plays stay on the server; logging in again restores them.
  - Two devices, same Account, same Game Day: the stored Play is the only board. Opening loads it; saving overwrites it (last write wins). No live sync. We are not trying to prevent cheating (a Guest tab can always try guesses separately).
  - New origin: no import from the live Parle `localStorage` counters. Players start with zero Plays (Statistics show 0).
  - Accedi / Esci live in the existing settings sheet. Header stays help | title | settings.
  - Tema nero and colori ad alto contrasto stay on the device. Hard mode stays as in the live game (on the Play, locked after the first guess).
  - Upstream pain this addresses: stats lost on new phone/browser ([#72](https://github.com/pietroppeter/wordle-it/issues/72), [#46](https://github.com/pietroppeter/wordle-it/issues/46), [#59](https://github.com/pietroppeter/wordle-it/issues/59), [#105](https://github.com/pietroppeter/wordle-it/issues/105), [#101](https://github.com/pietroppeter/wordle-it/issues/101)).
  - Decision records: [`docs/adr/0001-plays-are-source-of-truth.md`](./docs/adr/0001-plays-are-source-of-truth.md), [`docs/adr/0002-account-wins-on-login.md`](./docs/adr/0002-account-wins-on-login.md), [`docs/adr/0003-host-on-railway.md`](./docs/adr/0003-host-on-railway.md), [`docs/adr/0004-same-puzzle-sequence.md`](./docs/adr/0004-same-puzzle-sequence.md)

## Change

Product, branding, or behavior that should be different from upstream.

<!-- example: - [inbox] … -->

## Fix

- **[decided]** Game day is always the calendar date in **Italy (`Europe/Rome`)**, not the player’s local midnight.
  - If you are outside Italy and it is already past midnight locally, but not yet midnight in Italy, you must still be on Italy’s current puzzle.
  - Opening the game after local midnight must not jump to “tomorrow’s” Italian word, and must not break the streak the following day.
  - Same root bug on **anno bisestile** (leap year) and **ora legale** (DST): the current code treats a day as `Math.floor(ms / 86400000)` from local midnights (`$a` in `wordle-it.js`). That skips, duplicates, or desyncs a day when the day is not exactly 24 hours, or when the player’s date is not Italy’s date.
  - Streak is “completed yesterday’s Italy-date puzzle, now playing today’s Italy-date puzzle.”
  - Everyone worldwide should see the same word at the same moment (when that date starts in Italy).
  - Upstream (open unless noted): [#116](https://github.com/pietroppeter/wordle-it/issues/116), [#114](https://github.com/pietroppeter/wordle-it/issues/114), [#99](https://github.com/pietroppeter/wordle-it/issues/99), [#90](https://github.com/pietroppeter/wordle-it/issues/90), [#73](https://github.com/pietroppeter/wordle-it/issues/73), [#57](https://github.com/pietroppeter/wordle-it/issues/57), [#53](https://github.com/pietroppeter/wordle-it/issues/53), [#63](https://github.com/pietroppeter/wordle-it/issues/63), [#42](https://github.com/pietroppeter/wordle-it/issues/42), [#75](https://github.com/pietroppeter/wordle-it/issues/75), [#64](https://github.com/pietroppeter/wordle-it/issues/64), [#111](https://github.com/pietroppeter/wordle-it/issues/111), [#107](https://github.com/pietroppeter/wordle-it/issues/107). Related streak wipe: [#101](https://github.com/pietroppeter/wordle-it/issues/101). Closed location/streak: [#52](https://github.com/pietroppeter/wordle-it/issues/52).
  - Unmerged PRs (each only half of the fix): [#102](https://github.com/pietroppeter/wordle-it/pull/102) always use Italian timezone (still divides by 86400000); [#108](https://github.com/pietroppeter/wordle-it/pull/108) calendar-day diff for DST (still uses the player’s local date).

## Improve

Quality, DX, architecture, UX polish — not strictly broken, but worth better.

- **[decided]** Replace the minified Wordle bundle with the stack above, keeping visual parity.

## Parking lot

Ideas not yet classified. Promote into the sections above when you want them.

- Manifest / social meta still advertise `pietroppeter.github.io/wordle-it`
- Random analytics sampling and public Plausible dashboard belong to upstream
- Upstream also has many dictionary / share issues; not in scope until we pick them up
- Live multi-device sync (TanStack DB) — optional later, not for anti-cheat
- Convex — **[wont]** (would replace Postgres + Drizzle)
- Nim dictionary pipeline — offline only; not on Railway
- Custom domain — later, after local + Railway

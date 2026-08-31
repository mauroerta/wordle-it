# Visual and behavior reference

**Canonical live game:** https://pietroppeter.github.io/wordle-it/

That URL is the source of truth for how this game must **look**. If this repo, a screenshot, or memory disagrees with the live site on appearance, the live site wins.

## Constraints (current)

- Match the live game visually: layout, colors, typography, spacing, chrome, copy, keyboard, board, modals, toasts, stats, share, dark mode, colorblind mode.
- Implementation may be rewritten (see `MODERNIZATION.md` stack). Players should not be able to tell from looking.
- When checking look, open the URL above. Do not rely on this repo’s files alone.

### STATISTICHE (must match)

From the live game (`showStatsModal` / `restoringFromLocalStorage` in `wordle-it.js`):

- After a win: toast, then the STATISTICHE modal (highlight today’s guess-count bar).
- After a loss: toast with the solution, then the same modal.
- Coming back the same Game Day when today’s Play is already finished: STATISTICHE is the first thing shown (no delay).
- Modal contents: Partite, % Vittorie, Vinte di fila, Record di vittorie in fila, Distribuzione dei tentativi, Prossimo PARLE countdown, Condividi.
- First visit ever: help modal, not stats.

## Behavior exceptions

These must **not** copy the live site. See `MODERNIZATION.md`.

- Puzzle day, word of the day, countdown to next puzzle, and win streak use the **Europe/Rome** calendar, not the player’s local midnight.
- A game day is a calendar date in Italy, not “exactly 86400000 milliseconds.” That also covers **ora legale** (DST) and **anno bisestile** (leap year).
- Scores and stats persist on the server for logged-in users (WorkOS + Postgres). The live game keeps them only in `localStorage`.
- Login / account is a **new surface**. It is not on the live site. Keep the game board and header looking like Parle (help | title | settings). Accedi / Esci live in the existing settings sheet, not a fourth header icon. Auth UI is WorkOS AuthKit hosted (email magic link + Google), in Italian.
- Guests can play without an Account. They store Plays on the device. Creating an Account keeps those Plays. Logging into an existing Account replaces Guest Plays with the Account’s. Logging out starts a new empty Guest. Statistics are always computed from Plays.
- Two devices, same Account: the stored Play is the only board (last write wins). No live sync. Cheating is out of scope.
- New origin: Players start from zero Plays. Old live-site counters are not imported.
- Tema nero and colori ad alto contrasto stay on the device, not on the Account. Hard mode stays as in the live game (tied to the Play, locked after the first guess of the day).
- Same Puzzle sequence as the live Parle (same lists, First Game Day 3 January 2022). May differ from live on ora-legale edges because we fix Game Day math.
- Custom domain, Railway deploy, and WorkOS production keys wait until the app works locally. Guest play must work with no cloud accounts.

## What this does not freeze

Tooling, analytics ownership, docs, and the behavior exceptions above.

## Later (when we rewrite)

Use the live URL as the **visual** acceptance baseline. After any rewrite, the product must still look like https://pietroppeter.github.io/wordle-it/ unless a Change item in `MODERNIZATION.md` says otherwise. Do not copy its timezone / day-index / streak bugs.

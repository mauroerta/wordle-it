# AGENTS.md

Par🇮🇹le. Italian Wordle. Visual parity with the live game.
Game Day is Europe/Rome. Plays are the source of truth. Guest play
works with no cloud accounts.

## Product

`.agents/docs` is not used. These files are the current plan, not a menu.

- [CONTEXT.md](CONTEXT.md). Words to use. Update when a term is resolved.
- [REFERENCE.md](REFERENCE.md). How it must look. Open the live URL when
  checking appearance.
- [MODERNIZATION.md](MODERNIZATION.md). Decided work. Status: inbox →
  decided → doing → done.
- [docs/adr/](docs/adr/). Why, when the choice is surprising.

Live look: https://pietroppeter.github.io/wordle-it/

## Skills

Check `.agents/skills/` before you implement. Read and follow the matching
skill.

- `conventions`. TypeScript under `src/`. Binding.
- shadcn CLI for Dialog, Switch, Button, Sheet. The board is custom Parle UI.

TanStack Start, Drizzle, WorkOS: check current docs. Do not trust training data.

## Stack

TanStack Start, React, Tailwind, shadcn, Drizzle, Postgres. WorkOS AuthKit
and Railway Europe later. First milestone: local Guest play.

The original Nim/static site lives in `legacy/`. Do not serve it.

## Commands

See `package.json`. Typical loop: `pnpm install`, `pnpm run dev`, `pnpm run test`,
`pnpm run lint`. After edits, `pnpm lint:fix` then `pnpm format`.

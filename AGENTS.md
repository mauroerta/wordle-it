# AGENTS.md

Par🇮🇹le. Italian Wordle. Visual parity with the live game.
Game Day is Europe/Rome. Plays are the source of truth. Guest play
works with no cloud accounts.

## Product

`.agents/docs` is not used. These files are the current plan, not a menu.

- [CONTEXT.md](CONTEXT.md). Words to use. Update when a term is resolved.
- [REFERENCE.md](REFERENCE.md). How it must look. Open the live URL when
  checking appearance.
- [MODERNIZATION.md](MODERNIZATION.md). Living backlog. Status: inbox →
  decided → doing → done.
- [docs/adr/](docs/adr/). Why, when the choice is surprising.

Live look: https://pietroppeter.github.io/wordle-it/

## Skills

Check `.agents/skills/` before you implement. Read and follow the matching
skill.

- `conventions`. TypeScript under `src/`. Binding. Prefer shadcn for
  product UI; the board stays custom Parle.

TanStack Start, Drizzle, WorkOS: check current docs. Do not trust training data.

## Stack

TanStack Start, React, Tailwind, shadcn, Drizzle, Postgres, WorkOS AuthKit.
Railway Europe: `staging` and `production`, both on `main`. Details:
[`docs/adr/0003-host-on-railway.md`](docs/adr/0003-host-on-railway.md).

## Commands

See `package.json`. Typical loop: `pnpm install`, `pnpm run dev`, `pnpm run test`,
`pnpm run lint`. After edits, `pnpm lint:fix` then `pnpm format`. Before a
push, `pnpm build` and probe `node .output/server/index.mjs`: dev does not
bundle, and only the Nitro build shows chunking errors.

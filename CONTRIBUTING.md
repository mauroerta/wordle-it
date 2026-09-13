# Contribute

## Run locally

```bash
pnpm install
pnpm run dev
```

Opens at http://localhost:3000. Guest play works with no Account and no
Postgres.

## Account play (optional)

Copy `.env.example` to `.env`. Start Postgres and migrate:

```bash
docker compose up -d
pnpm run db:migrate
```

Fill the WorkOS keys in `.env`. Redirects are listed in `.env.example`.

### Demo Group Members

With Postgres up and at least one Group created in the app:

```bash
pnpm db:seed                 # only Group, or error listing slugs
pnpm db:seed par-le-nemici   # specific slug
```

Adds five synthetic Accounts with Plays (podium, finish-time ties, you below
3rd). Safe to re-run; refreshes demo Plays. Then refresh the Group page.

## Commands

See `package.json`. Typical loop: `pnpm run test`, `pnpm run lint`. After
edits, `pnpm lint:fix` then `pnpm format`. Before a push, `pnpm build` and
probe `node .output/server/index.mjs`: dev does not bundle.

## Deploy

Railway pulls `main` from GitHub; the working tree is not what ships. Needs
the Railway CLI signed in (`pnpm railway login`).

```bash
git push origin main
pnpm deploy:staging      # https://parle-staging.up.railway.app
pnpm deploy:production   # https://parole.up.railway.app, after staging looks right
```

## Product

- [AGENTS.md](AGENTS.md)
- [CONTEXT.md](CONTEXT.md)
- [REFERENCE.md](REFERENCE.md)
- [MODERNIZATION.md](MODERNIZATION.md)
- [docs/adr/](docs/adr/)

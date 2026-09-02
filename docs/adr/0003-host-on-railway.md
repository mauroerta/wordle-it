# Host app and Postgres on Railway

TanStack Start, Drizzle, and WorkOS need a server; GitHub Pages cannot run them. We put both the app and Postgres on Railway (Europe) so one platform owns deploy and data, instead of splitting Vercel + Neon. Europe matches Game Day (`Europe/Rome`) and the Italian audience.

The Railway graph lives in `.railway/railway.ts` (TypeScript IaC), not deprecated `railway.json`, Terraform, or the dashboard. Compose stays the local Postgres; Drizzle owns the schema; `railway config apply` is the graph.

One project, two persistent environments, both on `main`. Push to `main` deploys **staging**. Production is a manual deploy of that same commit after staging looks right. Staging has its own Postgres, so Account Plays never mix.

import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Any Postgres driver: postgres-js in production, PGlite in tests.
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

let db: Db | undefined

export function postgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export function getDb(): Db {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }
  if (!db) {
    db = drizzle({ client: postgres(url), schema })
  }
  return db
}

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

export type Db = ReturnType<typeof drizzle<typeof schema>>

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

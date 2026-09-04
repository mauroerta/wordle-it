import { PGlite } from "@electric-sql/pglite"
import { getTableName, sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import type { Db } from "./db"
import * as schema from "./schema"

// In-process Postgres with the real migrations applied. No server, no network.
export async function createTestDb(): Promise<Db> {
  const db = drizzle({ client: new PGlite(), schema })
  await migrate(db, { migrationsFolder: "drizzle" })
  return db
}

export async function truncateAll(db: Db): Promise<void> {
  const tables = Object.values(schema).map((table) =>
    sql.identifier(getTableName(table))
  )
  await db.execute(sql`TRUNCATE ${sql.join(tables, sql`, `)} CASCADE`)
}

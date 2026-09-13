import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../src/db/schema"
import { calendarDateInRome } from "../src/game-day/game-day"
import { seedDemoMembers } from "../src/group/demo-seed"
import { groups } from "../src/group/schema"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("DATABASE_URL is not set (copy .env.example to .env)")
    process.exit(1)
  }
  assertLocalDatabase(url)

  const client = postgres(url)
  const db = drizzle({ client, schema })
  const slugArg = process.argv[2]
  const all = await db
    .select({ id: groups.id, slug: groups.slug, name: groups.name })
    .from(groups)
    .orderBy(groups.name)

  if (all.length === 0) {
    console.error("No Groups yet. Create one in the app, then re-run.")
    await client.end()
    process.exit(1)
  }

  let target = all.find((group) => group.slug === slugArg)
  if (!target && slugArg) {
    console.error(`No Group with slug "${slugArg}". Existing:`)
    for (const group of all) {
      console.error(`  ${group.slug}  (${group.name})`)
    }
    await client.end()
    process.exit(1)
  }
  if (!target) {
    if (all.length > 1) {
      console.error("Several Groups — pass a slug:")
      for (const group of all) {
        console.error(`  pnpm db:seed ${group.slug}`)
      }
      await client.end()
      process.exit(1)
    }
    target = all[0]
  }

  const today = calendarDateInRome(new Date())
  const result = await seedDemoMembers({
    db,
    groupId: target.id,
    today,
  })
  console.log(
    `Seeded ${result.memberCount} demo Members into ${target.slug} (${target.name}) for ${today}`
  )
  await client.end()
}

main().catch(async (error) => {
  console.error(error)
  process.exit(1)
})

function assertLocalDatabase(url: string) {
  let host: string
  try {
    host = new URL(url).hostname
  } catch {
    console.error("DATABASE_URL is invalid")
    process.exit(1)
  }
  if (host !== "localhost" && host !== "127.0.0.1") {
    console.error(
      `Refusing to seed a non-local database (host: ${host}). Use local Postgres only.`
    )
    process.exit(1)
  }
}

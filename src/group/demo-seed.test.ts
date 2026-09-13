import { eq } from "drizzle-orm"
import { beforeAll, beforeEach, describe, expect, test } from "vitest"
import type { Db } from "../db/db"
import { createTestDb, truncateAll } from "../db/test-db"
import { ensureAccount } from "../player/account"
import { DEMO_ACCOUNT_PREFIX, DEMO_MEMBERS, seedDemoMembers } from "./demo-seed"
import { groups as groupsTable } from "./schema"
import { createGroups } from "./store"

const TODAY = "2026-09-03"

let db: Db
let groups: ReturnType<typeof createGroups>

async function groupIdFor(slug: string): Promise<string> {
  const [group] = await db
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.slug, slug))
  if (!group) {
    throw new Error(`missing group ${slug}`)
  }
  return group.id
}

beforeAll(async () => {
  db = await createTestDb()
  groups = createGroups({ db })
})

beforeEach(async () => {
  await truncateAll(db)
  await ensureAccount({ db, accountId: "mauro", name: "Mauro Rossi" })
})

describe("seedDemoMembers", () => {
  test("adds synthetic Members and shows podium plus the viewer below it", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const result = await seedDemoMembers({
      db,
      groupId: await groupIdFor(slug),
      today: TODAY,
    })
    expect(result.memberCount).toBe(DEMO_MEMBERS.length)

    const page = await groups.page({ slug, accountId: "mauro", today: TODAY })
    expect(
      [...page.members.map((member) => member.name)].sort((a, b) =>
        a.localeCompare(b, "it")
      )
    ).toEqual([
      "Anna Bianchi",
      "Bruno Conti",
      "Carla De Luca",
      "Dario Esposito",
      "Elena Farina",
      "Mauro Rossi",
    ])
    expect(
      page.today.map((row) => [row.place, row.name, row.attemptsLabel])
    ).toEqual([
      [1, "Anna Bianchi", "2/6"],
      [2, "Bruno Conti", "2/6"],
      [3, "Carla De Luca", "3/6"],
      [6, "Mauro Rossi", "—"],
    ])
  })

  test("re-running seed refreshes demo Plays without duplicating Members", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const groupId = await groupIdFor(slug)
    await seedDemoMembers({ db, groupId, today: TODAY })
    await seedDemoMembers({ db, groupId, today: TODAY })

    const page = await groups.page({ slug, accountId: "mauro", today: TODAY })
    expect(
      page.members.filter((member) =>
        member.accountId.startsWith(DEMO_ACCOUNT_PREFIX)
      )
    ).toHaveLength(DEMO_MEMBERS.length)
  })
})

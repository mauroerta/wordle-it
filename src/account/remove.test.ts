import { eq } from "drizzle-orm"
import { beforeAll, beforeEach, describe, expect, test } from "vitest"
import { createTestDb, truncateAll } from "../db/test-db"
import { createGroups } from "../group/store"
import { groupBlocks, groupMembers, groups } from "../group/schema"
import {
  accountNotificationPrefs,
  pushSubscriptions,
} from "../notification/schema"
import { createAccountPlays, ensureAccount } from "../player/account"
import { accounts, plays } from "../player/schema"
import type { Db } from "../db/db"
import { removeAccountData } from "./remove"

let db: Db

beforeAll(async () => {
  db = await createTestDb()
})

beforeEach(async () => {
  await truncateAll(db)
})

describe("removeAccountData", () => {
  test("removes the Account's data and transfers owned Groups", async () => {
    await ensureAccount({ db, accountId: "leaving", name: "Ada" })
    await ensureAccount({ db, accountId: "remaining", name: "Mauro" })
    const groupStore = createGroups({ db })
    const shared = await groupStore.create({
      name: "Amici",
      accountId: "leaving",
    })
    const sharedPage = await groupStore.page({
      slug: shared.slug,
      accountId: "leaving",
      today: "2026-09-11",
    })
    await groupStore.join({
      token: sharedPage.inviteToken,
      accountId: "remaining",
    })
    const solo = await groupStore.create({
      name: "Solo",
      accountId: "leaving",
    })
    const blocked = await groupStore.create({
      name: "Bloccati",
      accountId: "remaining",
    })
    const blockedPage = await groupStore.page({
      slug: blocked.slug,
      accountId: "remaining",
      today: "2026-09-11",
    })
    await groupStore.join({
      token: blockedPage.inviteToken,
      accountId: "leaving",
    })
    await groupStore.kick({
      slug: blocked.slug,
      ownerId: "remaining",
      accountId: "leaving",
    })
    await createAccountPlays({ db, accountId: "leaving" }).savePlay({
      gameDay: "2026-09-11",
      puzzle: "porta",
      guesses: [],
      evaluations: [],
      status: "in_progress",
      hardMode: false,
    })
    await db.insert(accountNotificationPrefs).values({
      accountId: "leaving",
      enabled: true,
    })
    await db.insert(pushSubscriptions).values({
      endpoint: "https://push.example/leaving",
      accountId: "leaving",
      p256dh: "key",
      auth: "secret",
    })

    await removeAccountData({ db, accountId: "leaving" })

    expect(
      await db.select().from(accounts).where(eq(accounts.id, "leaving"))
    ).toEqual([])
    expect(
      await db.select().from(plays).where(eq(plays.accountId, "leaving"))
    ).toEqual([])
    expect(
      await db
        .select()
        .from(accountNotificationPrefs)
        .where(eq(accountNotificationPrefs.accountId, "leaving"))
    ).toEqual([])
    expect(
      await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.accountId, "leaving"))
    ).toEqual([])
    expect(
      await db
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.accountId, "leaving"))
    ).toEqual([])
    expect(
      await db
        .select()
        .from(groupBlocks)
        .where(eq(groupBlocks.accountId, "leaving"))
    ).toEqual([])

    const remainingPage = await groupStore.page({
      slug: shared.slug,
      accountId: "remaining",
      today: "2026-09-11",
    })
    expect(remainingPage.isOwner).toBe(true)
    expect(
      await db.select().from(groups).where(eq(groups.slug, solo.slug))
    ).toEqual([])
  })
})

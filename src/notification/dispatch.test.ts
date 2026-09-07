import { beforeEach, describe, expect, test } from "vitest"
import { createTestDb, truncateAll } from "../db/test-db"
import type { Db } from "../db/db"
import { ensureAccount } from "../player/account"
import { plays } from "../player/schema"
import { createNotificationDispatch } from "./dispatch"
import { notificationDispatches } from "./schema"
import { createNotifications } from "./store"

let db: Db

beforeEach(async () => {
  if (!db) {
    db = await createTestDb()
  }
  await truncateAll(db)
})

describe("createNotifications", () => {
  test("prefs default off and round-trip", async () => {
    await ensureAccount({ db, accountId: "a1", name: "Ada" })
    const notifications = createNotifications({ db })
    expect(await notifications.getPrefs("a1")).toEqual({
      enabled: false,
      newPuzzle: false,
      hurryUp: false,
    })
    await notifications.setPrefs({
      accountId: "a1",
      prefs: { enabled: true, newPuzzle: true, hurryUp: false },
    })
    expect(await notifications.getPrefs("a1")).toEqual({
      enabled: true,
      newPuzzle: true,
      hurryUp: false,
    })
  })
})

describe("createNotificationDispatch", () => {
  test("sends once, drops gone endpoints, and does not reclaim", async () => {
    await ensureAccount({ db, accountId: "a1", name: "Ada" })
    const notifications = createNotifications({ db })
    await notifications.setPrefs({
      accountId: "a1",
      prefs: { enabled: true, newPuzzle: true, hurryUp: false },
    })
    await notifications.saveSubscription({
      accountId: "a1",
      subscription: {
        endpoint: "https://push.example/gone",
        p256dh: "k",
        auth: "t",
      },
    })
    await notifications.saveSubscription({
      accountId: "a1",
      subscription: {
        endpoint: "https://push.example/ok",
        p256dh: "k",
        auth: "t",
      },
    })
    const dispatch = createNotificationDispatch({ db })
    const sentEndpoints: string[] = []
    const at = new Date("2026-03-14T23:30:00Z")
    const first = await dispatch.run({
      at,
      sender: {
        async send(subscription) {
          sentEndpoints.push(subscription.endpoint)
          if (subscription.endpoint.endsWith("/gone")) {
            const error = new Error("gone") as Error & { statusCode: number }
            error.statusCode = 410
            throw error
          }
        },
      },
    })
    expect(first).toEqual({
      kind: "new_puzzle",
      claimed: true,
      sent: 1,
      dropped: 1,
    })
    expect(sentEndpoints.sort()).toEqual([
      "https://push.example/gone",
      "https://push.example/ok",
    ])
    const second = await dispatch.run({
      at,
      sender: {
        async send() {
          throw new Error("should not send")
        },
      },
    })
    expect(second).toEqual({
      kind: "new_puzzle",
      claimed: false,
      sent: 0,
      dropped: 0,
    })
  })

  test("releases claim when a send fails so cron can retry", async () => {
    await ensureAccount({ db, accountId: "a1", name: "Ada" })
    const notifications = createNotifications({ db })
    await notifications.setPrefs({
      accountId: "a1",
      prefs: { enabled: true, newPuzzle: true, hurryUp: false },
    })
    await notifications.saveSubscription({
      accountId: "a1",
      subscription: {
        endpoint: "https://push.example/a1",
        p256dh: "k",
        auth: "t",
      },
    })
    const dispatch = createNotificationDispatch({ db })
    const at = new Date("2026-03-14T23:30:00Z")
    await expect(
      dispatch.run({
        at,
        sender: {
          async send() {
            throw new Error("push provider down")
          },
        },
      })
    ).rejects.toThrow("push provider down")
    expect(await db.select().from(notificationDispatches)).toEqual([])
    const retry = await dispatch.run({
      at,
      sender: {
        async send() {},
      },
    })
    expect(retry).toEqual({
      kind: "new_puzzle",
      claimed: true,
      sent: 1,
      dropped: 0,
    })
  })

  test("hurry_up skips Accounts with a finished Play", async () => {
    await ensureAccount({ db, accountId: "done", name: "Done" })
    await ensureAccount({ db, accountId: "open", name: "Open" })
    await ensureAccount({ db, accountId: "none", name: "None" })
    const notifications = createNotifications({ db })
    for (const accountId of ["done", "open", "none"]) {
      await notifications.setPrefs({
        accountId,
        prefs: { enabled: true, newPuzzle: false, hurryUp: true },
      })
      await notifications.saveSubscription({
        accountId,
        subscription: {
          endpoint: `https://push.example/${accountId}`,
          p256dh: "k",
          auth: "t",
        },
      })
    }
    await db.insert(plays).values({
      accountId: "done",
      gameDay: "2026-03-15",
      puzzle: "carta",
      guesses: ["carta"],
      evaluations: [["correct", "correct", "correct", "correct", "correct"]],
      status: "won",
      hardMode: false,
    })
    await db.insert(plays).values({
      accountId: "open",
      gameDay: "2026-03-15",
      puzzle: "carta",
      guesses: ["nasce"],
      evaluations: [["absent", "absent", "absent", "absent", "absent"]],
      status: "in_progress",
      hardMode: false,
    })
    const dispatch = createNotificationDispatch({ db })
    const sent: string[] = []
    const result = await dispatch.run({
      at: new Date("2026-03-15T22:15:00Z"),
      sender: {
        async send(subscription) {
          sent.push(subscription.endpoint)
        },
      },
    })
    expect(result.kind).toBe("hurry_up")
    expect(result.claimed).toBe(true)
    expect(sent.sort()).toEqual([
      "https://push.example/none",
      "https://push.example/open",
    ])
  })

  test("idle Rome hours do nothing", async () => {
    const dispatch = createNotificationDispatch({ db })
    const result = await dispatch.run({
      at: new Date("2026-03-15T11:00:00Z"),
      sender: {
        async send() {
          throw new Error("should not send")
        },
      },
    })
    expect(result).toEqual({
      kind: null,
      claimed: false,
      sent: 0,
      dropped: 0,
    })
    expect(await db.select().from(notificationDispatches)).toEqual([])
  })
})

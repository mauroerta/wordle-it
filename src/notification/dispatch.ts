import { and, eq, inArray, or } from "drizzle-orm"
import type { Db } from "../db/db"
import { calendarDateInRome } from "../game-day/game-day"
import { plays } from "../player/schema"
import { notificationKindDueAt } from "./due"
import { notificationPayload } from "./payload"
import { wantsKind } from "./prefs"
import type { NotificationKind } from "./prefs"
import {
  accountNotificationPrefs,
  notificationDispatches,
  pushSubscriptions,
} from "./schema"
import { createWebPushSender, isGonePushError, vapidConfigured } from "./send"
import type { PushSender } from "./send"
import type { PushSubscriptionRecord } from "./store"

export type DispatchResult = {
  kind: NotificationKind | null
  claimed: boolean
  sent: number
  dropped: number
}

export function createNotificationDispatch({ db }: { db: Db }) {
  async function run({
    at = new Date(),
    sender,
  }: {
    at?: Date
    sender?: PushSender
  } = {}): Promise<DispatchResult> {
    const kind = notificationKindDueAt(at)
    if (!kind) {
      return { kind: null, claimed: false, sent: 0, dropped: 0 }
    }
    if (!vapidConfigured() && !sender) {
      throw new Error("VAPID keys are not set")
    }
    const push = sender ?? createWebPushSender()
    const gameDay = calendarDateInRome(at)
    const claimed = await claim({ gameDay, kind })
    if (!claimed) {
      return { kind, claimed: false, sent: 0, dropped: 0 }
    }
    try {
      const targets = await subscriptionsForKind({ kind, gameDay })
      const payload = JSON.stringify(notificationPayload(kind))
      const outcomes = await Promise.all(
        targets.map(async (subscription) => {
          try {
            await push.send(subscription, payload)
            return "sent" as const
          } catch (error) {
            if (isGonePushError(error)) {
              await db
                .delete(pushSubscriptions)
                .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
              return "dropped" as const
            }
            throw error
          }
        })
      )
      return {
        kind,
        claimed: true,
        sent: outcomes.filter((outcome) => outcome === "sent").length,
        dropped: outcomes.filter((outcome) => outcome === "dropped").length,
      }
    } catch (error) {
      await releaseClaim({ gameDay, kind })
      throw error
    }
  }

  async function claim({
    gameDay,
    kind,
  }: {
    gameDay: string
    kind: NotificationKind
  }): Promise<boolean> {
    const inserted = await db
      .insert(notificationDispatches)
      .values({ gameDay, kind })
      .onConflictDoNothing()
      .returning({ gameDay: notificationDispatches.gameDay })
    return inserted.length > 0
  }

  async function releaseClaim({
    gameDay,
    kind,
  }: {
    gameDay: string
    kind: NotificationKind
  }): Promise<void> {
    await db
      .delete(notificationDispatches)
      .where(
        and(
          eq(notificationDispatches.gameDay, gameDay),
          eq(notificationDispatches.kind, kind)
        )
      )
  }

  async function subscriptionsForKind({
    kind,
    gameDay,
  }: {
    kind: NotificationKind
    gameDay: string
  }): Promise<PushSubscriptionRecord[]> {
    const prefRows = await db.select().from(accountNotificationPrefs)
    const accountIds = prefRows
      .filter((row) =>
        wantsKind({
          prefs: {
            enabled: row.enabled,
            newPuzzle: row.newPuzzle,
            hurryUp: row.hurryUp,
          },
          kind,
        })
      )
      .map((row) => row.accountId)
    if (accountIds.length === 0) {
      return []
    }

    let eligibleIds = accountIds
    if (kind === "hurry_up") {
      const finished = await db
        .select({ accountId: plays.accountId })
        .from(plays)
        .where(
          and(
            eq(plays.gameDay, gameDay),
            inArray(plays.accountId, accountIds),
            or(eq(plays.status, "won"), eq(plays.status, "lost"))
          )
        )
      const finishedSet = new Set(finished.map((row) => row.accountId))
      eligibleIds = accountIds.filter((id) => !finishedSet.has(id))
      if (eligibleIds.length === 0) {
        return []
      }
    }

    return db
      .select({
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
      })
      .from(pushSubscriptions)
      .where(inArray(pushSubscriptions.accountId, eligibleIds))
  }

  return { run }
}

import { eq } from "drizzle-orm"
import type { Db } from "../db/db"
import { DEFAULT_NOTIFICATION_PREFS } from "./prefs"
import type { NotificationPrefs } from "./prefs"
import { accountNotificationPrefs, pushSubscriptions } from "./schema"

export type PushSubscriptionRecord = {
  endpoint: string
  p256dh: string
  auth: string
}

export function createNotifications({ db }: { db: Db }) {
  async function getPrefs(accountId: string): Promise<NotificationPrefs> {
    const [row] = await db
      .select()
      .from(accountNotificationPrefs)
      .where(eq(accountNotificationPrefs.accountId, accountId))
      .limit(1)
    if (!row) {
      return { ...DEFAULT_NOTIFICATION_PREFS }
    }
    return {
      enabled: row.enabled,
      newPuzzle: row.newPuzzle,
      hurryUp: row.hurryUp,
    }
  }

  async function setPrefs({
    accountId,
    prefs,
  }: {
    accountId: string
    prefs: NotificationPrefs
  }): Promise<NotificationPrefs> {
    await db
      .insert(accountNotificationPrefs)
      .values({
        accountId,
        enabled: prefs.enabled,
        newPuzzle: prefs.newPuzzle,
        hurryUp: prefs.hurryUp,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: accountNotificationPrefs.accountId,
        set: {
          enabled: prefs.enabled,
          newPuzzle: prefs.newPuzzle,
          hurryUp: prefs.hurryUp,
          updatedAt: new Date(),
        },
      })
    return prefs
  }

  async function saveSubscription({
    accountId,
    subscription,
  }: {
    accountId: string
    subscription: PushSubscriptionRecord
  }): Promise<void> {
    await db
      .insert(pushSubscriptions)
      .values({
        endpoint: subscription.endpoint,
        accountId,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          accountId,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      })
  }

  async function deleteSubscription(endpoint: string): Promise<void> {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
  }

  return {
    getPrefs,
    setPrefs,
    saveSubscription,
    deleteSubscription,
  }
}

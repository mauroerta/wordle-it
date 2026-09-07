import { createServerFn } from "@tanstack/react-start"
import {
  asNotificationPrefs,
  asPushSubscription,
  signedInNotifications,
} from "../server"

export const saveNotificationPrefs = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ prefs: asNotificationPrefs(data) }))
  .handler(async ({ data }) => {
    const { notifications, accountId } = await signedInNotifications()
    return notifications.setPrefs({ accountId, prefs: data.prefs })
  })

export const savePushSubscription = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({
    subscription: asPushSubscription(data),
  }))
  .handler(async ({ data }) => {
    const { notifications, accountId } = await signedInNotifications()
    await notifications.saveSubscription({
      accountId,
      subscription: data.subscription,
    })
  })

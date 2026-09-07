import { createServerFn } from "@tanstack/react-start"
import { signedInNotifications } from "../server"
import { vapidConfigured, vapidPublicKey } from "../send"

export const loadNotificationSettings = createServerFn({
  method: "GET",
}).handler(async () => {
  const { notifications, accountId } = await signedInNotifications()
  const prefs = await notifications.getPrefs(accountId)
  return {
    prefs,
    vapidPublicKey: vapidConfigured() ? vapidPublicKey() : null,
  }
})

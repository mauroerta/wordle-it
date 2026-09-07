import { getAuth } from "@workos/authkit-tanstack-react-start"
import { accountNameFromUser } from "../player/account-name"
import { createNotifications } from "./store"

export async function signedInNotifications() {
  const auth = await getAuth()
  if (!auth.user) {
    throw new Error("not signed in")
  }
  const { getDb } = await import("../db/db")
  const { ensureAccount } = await import("../player/account")
  const db = getDb()
  const accountId = auth.user.id
  await ensureAccount({
    db,
    accountId,
    name: accountNameFromUser(auth.user),
  })
  return {
    notifications: createNotifications({ db }),
    accountId,
  }
}

export function asNotificationPrefs(data: unknown) {
  if (!data || typeof data !== "object") {
    throw new Error("invalid prefs")
  }
  const record = data as Record<string, unknown>
  const prefs = record.prefs
  if (!prefs || typeof prefs !== "object") {
    throw new Error("invalid prefs")
  }
  const value = prefs as Record<string, unknown>
  if (
    typeof value.enabled !== "boolean" ||
    typeof value.newPuzzle !== "boolean" ||
    typeof value.hurryUp !== "boolean"
  ) {
    throw new Error("invalid prefs")
  }
  return {
    enabled: value.enabled,
    newPuzzle: value.newPuzzle,
    hurryUp: value.hurryUp,
  }
}

export function asPushSubscription(data: unknown) {
  if (!data || typeof data !== "object") {
    throw new Error("invalid subscription")
  }
  const record = data as Record<string, unknown>
  const subscription = record.subscription
  if (!subscription || typeof subscription !== "object") {
    throw new Error("invalid subscription")
  }
  const value = subscription as Record<string, unknown>
  if (
    typeof value.endpoint !== "string" ||
    value.endpoint.length === 0 ||
    typeof value.p256dh !== "string" ||
    value.p256dh.length === 0 ||
    typeof value.auth !== "string" ||
    value.auth.length === 0
  ) {
    throw new Error("invalid subscription")
  }
  return {
    endpoint: value.endpoint,
    p256dh: value.p256dh,
    auth: value.auth,
  }
}

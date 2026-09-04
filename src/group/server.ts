import { getAuth } from "@workos/authkit-tanstack-react-start"
import { calendarDateInRome } from "../game-day/game-day"
import { accountNameFromUser } from "../player/account-name"
import { GroupError } from "./error"

export async function signedInGroups() {
  const auth = await getAuth()
  if (!auth.user) {
    throw GroupError.signIn()
  }
  const { getDb } = await import("../db/db")
  const { ensureAccount } = await import("../player/account")
  const { createGroups } = await import("./store")
  const db = getDb()
  const accountId = auth.user.id
  await ensureAccount({
    db,
    accountId,
    name: accountNameFromUser(auth.user),
  })
  return {
    groups: createGroups({ db }),
    accountId,
    today: calendarDateInRome(new Date()),
  }
}

// Behind Railway's proxy the public host and scheme arrive as x-forwarded-*.
export async function requestOrigin(): Promise<string> {
  const { getRequestUrl } = await import("@tanstack/react-start/server")
  return getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin
}

export function asString(data: unknown, key: string): string {
  if (!data || typeof data !== "object" || !(key in data)) {
    throw new GroupError("Richiesta non valida")
  }
  const value = (data as Record<string, unknown>)[key]
  if (typeof value !== "string" || value.length === 0) {
    throw new GroupError("Richiesta non valida")
  }
  return value
}

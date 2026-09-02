import { createServerFn } from "@tanstack/react-start"
import { getAuth } from "@workos/authkit-tanstack-react-start"
import { isPlay } from "../play/play"
import type { Play } from "../play/play"
import { playerChangeForAuth } from "./player-change"

export const takePlayerChange = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ guestPlays: asPlays(data, "guestPlays") }))
  .handler(async ({ data }) => {
    const { db, accountId } = await signedInDb()
    const { createAccountPlays, ensureAccount } = await import("./account")
    const accountIsNew = await ensureAccount({ db, accountId })
    const store = createAccountPlays({ db, accountId })
    const change = playerChangeForAuth({
      accountIsNew,
      guestPlays: data.guestPlays,
      accountPlays: accountIsNew ? [] : await store.load(),
    })
    if (change.kind === "create_account") {
      await store.replaceAll(change.guestPlays)
    }
    return change
  })

export const saveAccountPlay = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ play: asPlay(data, "play") }))
  .handler(async ({ data }) => {
    const { db, accountId } = await signedInDb()
    const { createAccountPlays } = await import("./account")
    const store = createAccountPlays({ db, accountId })
    await store.savePlay(data.play)
  })

async function signedInDb() {
  const auth = await getAuth()
  if (!auth.user) {
    throw new Error("not signed in")
  }
  const { getDb } = await import("../db/db")
  return { db: getDb(), accountId: auth.user.id }
}

function asPlay(data: unknown, key: "play"): Play {
  if (!data || typeof data !== "object" || !(key in data)) {
    throw new Error("invalid Play")
  }
  const value = (data as Record<string, unknown>)[key]
  if (!isPlay(value)) {
    throw new Error("invalid Play")
  }
  return value
}

function asPlays(data: unknown, key: "guestPlays"): Play[] {
  if (!data || typeof data !== "object" || !(key in data)) {
    throw new Error("invalid Plays")
  }
  const value = (data as Record<string, unknown>)[key]
  if (!Array.isArray(value) || !value.every(isPlay)) {
    throw new Error("invalid Plays")
  }
  return value
}

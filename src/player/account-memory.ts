import type { Play } from "../play/play"
import { playerChangeForAuth } from "./player-change"
import type { PlayerChange } from "./player-change"

export function createMemoryAccount({
  accountId,
  plays,
  accounts,
}: {
  accountId: string
  plays: Map<string, Play[]>
  accounts: Set<string>
}) {
  const store = createMemoryAccountPlays({ accountId, storage: plays })

  async function takeChange(guestPlays: Play[]): Promise<PlayerChange> {
    const accountIsNew = !accounts.has(accountId)
    accounts.add(accountId)
    const change = playerChangeForAuth({
      accountIsNew,
      guestPlays,
      accountPlays: accountIsNew ? [] : await store.load(),
    })
    if (change.kind === "create_account") {
      await store.replaceAll(change.guestPlays)
    }
    return change
  }

  return { takeChange, savePlay: store.savePlay }
}

export function createMemoryAccountPlays({
  accountId,
  storage,
}: {
  accountId: string
  storage: Map<string, Play[]>
}) {
  async function load(): Promise<Play[]> {
    return storage.get(accountId) ?? []
  }

  async function playForGameDay(gameDay: string): Promise<Play | undefined> {
    const plays = await load()
    return plays.find((play) => play.gameDay === gameDay)
  }

  async function savePlay(play: Play): Promise<void> {
    const plays = await load()
    const rest = plays.filter((stored) => stored.gameDay !== play.gameDay)
    storage.set(accountId, [...rest, play])
  }

  async function replaceAll(plays: Play[]): Promise<void> {
    storage.set(accountId, plays)
  }

  return { load, playForGameDay, savePlay, replaceAll }
}

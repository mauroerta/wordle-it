import { describe, expect, test } from "vitest"
import { createEmptyPlay, submitGuess } from "../play/play"
import { createMemoryAccountPlays } from "./account-memory"

function wonPlay(gameDay: string, puzzle: string) {
  return submitGuess({
    play: createEmptyPlay({ gameDay, puzzle, hardMode: false }),
    guess: puzzle,
  })
}

describe("createMemoryAccountPlays", () => {
  test("keeps Plays per Account", async () => {
    const storage = new Map()
    const mauro = createMemoryAccountPlays({
      accountId: "user_mauro",
      storage,
    })
    const other = createMemoryAccountPlays({
      accountId: "user_other",
      storage,
    })
    const play = wonPlay("2026-09-01", "curva")
    await mauro.savePlay(play)
    expect(await mauro.playForGameDay("2026-09-01")).toEqual(play)
    expect(await other.load()).toEqual([])
  })

  test("replaceAll is the Account's Plays after a Player change", async () => {
    const storage = new Map()
    const store = createMemoryAccountPlays({
      accountId: "user_mauro",
      storage,
    })
    await store.savePlay(wonPlay("2026-09-01", "curva"))
    const kept = [wonPlay("2026-08-31", "liana")]
    await store.replaceAll(kept)
    expect(await store.load()).toEqual(kept)
  })
})

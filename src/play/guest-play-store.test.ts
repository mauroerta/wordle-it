import { describe, expect, test } from "vitest"
import { createEmptyPlay, submitGuess } from "./play"
import { createGuestPlayStore } from "./guest-play-store"

function memoryStore(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

describe("createGuestPlayStore", () => {
  test("replaces the Play for a Game Day", () => {
    const store = createGuestPlayStore({ storage: memoryStore() })
    const first = createEmptyPlay({
      gameDay: "2026-08-30",
      puzzle: "porta",
      hardMode: false,
    })
    store.savePlay(submitGuess({ play: first, guess: "cassa" }))
    store.savePlay(submitGuess({ play: store.playForGameDay("2026-08-30")!, guess: "porta" }))
    expect(store.load()).toHaveLength(1)
    expect(store.playForGameDay("2026-08-30")?.status).toBe("won")
    expect(store.hasEverPlayed()).toBe(true)
  })

  test("empty storage is a first visit", () => {
    const store = createGuestPlayStore({ storage: memoryStore() })
    expect(store.hasEverPlayed()).toBe(false)
  })

  test("replaceAll writes the given Plays", () => {
    const store = createGuestPlayStore({ storage: memoryStore() })
    const play = submitGuess({
      play: createEmptyPlay({
        gameDay: "2026-08-30",
        puzzle: "porta",
        hardMode: false,
      }),
      guess: "porta",
    })
    store.replaceAll([play])
    expect(store.load()).toEqual([play])
    store.replaceAll([])
    expect(store.load()).toEqual([])
    expect(store.hasEverPlayed()).toBe(false)
  })
})

import { describe, expect, test } from "vitest"
import { createEmptyPlay, submitGuess } from "../play/play"
import { createMemoryAccount } from "./account-memory"
import { createPlayer } from "./player"

function memoryStore(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

function wonPlay(gameDay: string, puzzle: string) {
  return submitGuess({
    play: createEmptyPlay({ gameDay, puzzle, hardMode: false }),
    guess: puzzle,
  })
}

function accountWorld() {
  return {
    accountId: "user_mauro",
    plays: new Map(),
    accounts: new Set<string>(),
  }
}

function signedInWorld() {
  const { accountId, plays, accounts } = accountWorld()
  const player = createPlayer({
    storage: memoryStore(),
    account: createMemoryAccount({ accountId, plays, accounts }),
  })
  return { player, accountId, plays, accounts }
}

describe("createPlayer", () => {
  test("replaces the Play for a Game Day", () => {
    const player = createPlayer({ storage: memoryStore() })
    const first = createEmptyPlay({
      gameDay: "2026-08-30",
      puzzle: "porta",
      hardMode: false,
    })
    player.savePlay(submitGuess({ play: first, guess: "cassa" }))
    player.savePlay(
      submitGuess({
        play: player.playForGameDay("2026-08-30")!,
        guess: "porta",
      })
    )
    expect(player.load()).toHaveLength(1)
    expect(player.playForGameDay("2026-08-30")?.status).toBe("won")
    expect(player.hasEverPlayed()).toBe(true)
  })

  test("empty storage is a first visit", () => {
    const player = createPlayer({ storage: memoryStore() })
    expect(player.hasEverPlayed()).toBe(false)
  })

  test("onSignIn keeps the Plays on this device", async () => {
    const player = createPlayer({ storage: memoryStore() })
    const play = wonPlay("2026-08-31", "liana")
    player.savePlay(play)
    await player.onSignIn()
    expect(player.load()).toEqual([play])
  })

  test("onSignOut leaves no Plays on this device", () => {
    const player = createPlayer({ storage: memoryStore() })
    player.savePlay(wonPlay("2026-08-30", "porta"))
    player.onSignOut()
    expect(player.load()).toEqual([])
    expect(player.hasEverPlayed()).toBe(false)
  })

  test("creating an Account keeps Guest Plays on a later sign-in", async () => {
    const storage = memoryStore()
    const play = wonPlay("2026-08-31", "liana")
    const guest = createPlayer({ storage })
    await guest.savePlay(play)

    const { accountId, plays, accounts } = accountWorld()
    const player = createPlayer({
      storage,
      account: createMemoryAccount({ accountId, plays, accounts }),
    })
    await player.onSignIn()
    expect(player.load()).toEqual([play])

    const otherDevice = createPlayer({
      storage: memoryStore(),
      account: createMemoryAccount({ accountId, plays, accounts }),
    })
    await otherDevice.onSignIn()
    expect(otherDevice.load()).toEqual([play])
  })

  test("signing into an existing Account uses the Account Plays", async () => {
    const storage = memoryStore()
    const guest = createPlayer({ storage })
    await guest.savePlay(wonPlay("2026-08-31", "liana"))

    const { accountId, plays, accounts } = accountWorld()
    accounts.add(accountId)
    const accountPlay = wonPlay("2026-08-30", "porta")
    plays.set(accountId, [accountPlay])
    const player = createPlayer({
      storage,
      account: createMemoryAccount({ accountId, plays, accounts }),
    })
    await player.onSignIn()
    expect(player.load()).toEqual([accountPlay])
  })

  test("signing into an existing Account discards Guest Plays even when the Account has none", async () => {
    const storage = memoryStore()
    const guest = createPlayer({ storage })
    await guest.savePlay(wonPlay("2026-08-31", "liana"))

    const { accountId, plays, accounts } = accountWorld()
    accounts.add(accountId)
    const player = createPlayer({
      storage,
      account: createMemoryAccount({ accountId, plays, accounts }),
    })
    await player.onSignIn()
    expect(player.load()).toEqual([])
  })

  test("savePlay after sign-in is on the Account", async () => {
    const { player, accountId, plays, accounts } = signedInWorld()
    await player.onSignIn()
    const play = wonPlay("2026-09-01", "curva")
    await player.savePlay(play)

    const otherDevice = createPlayer({
      storage: memoryStore(),
      account: createMemoryAccount({ accountId, plays, accounts }),
    })
    await otherDevice.onSignIn()
    expect(otherDevice.load()).toEqual([play])
  })

  test("onSignOut leaves Account Plays for the next sign-in", async () => {
    const { player, accountId, plays, accounts } = signedInWorld()
    await player.onSignIn()
    const play = wonPlay("2026-08-30", "porta")
    await player.savePlay(play)
    player.onSignOut()
    expect(player.load()).toEqual([])

    const nextVisit = createPlayer({
      storage: memoryStore(),
      account: createMemoryAccount({ accountId, plays, accounts }),
    })
    await nextVisit.onSignIn()
    expect(nextVisit.load()).toEqual([play])
  })
})

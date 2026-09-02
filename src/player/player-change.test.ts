import { describe, expect, test } from "vitest"
import { createEmptyPlay, submitGuess } from "../play/play"
import { playerChangeForAuth, playsAfterPlayerChange } from "./player-change"

function guestPlay() {
  return submitGuess({
    play: createEmptyPlay({
      gameDay: "2026-08-31",
      puzzle: "liana",
      hardMode: false,
    }),
    guess: "cassa",
  })
}

function accountPlay() {
  return submitGuess({
    play: createEmptyPlay({
      gameDay: "2026-08-30",
      puzzle: "muoio",
      hardMode: false,
    }),
    guess: "muoio",
  })
}

describe("playsAfterPlayerChange", () => {
  test("creating an Account keeps the Guest Plays", () => {
    const guestPlays = [guestPlay()]
    expect(
      playsAfterPlayerChange({ kind: "create_account", guestPlays })
    ).toEqual(guestPlays)
  })

  test("signing into an existing Account uses the Account Plays", () => {
    const accountPlays = [accountPlay()]
    expect(
      playsAfterPlayerChange({
        kind: "sign_in",
        accountPlays,
      })
    ).toEqual(accountPlays)
  })

  test("signing into an existing Account discards Guest Plays even when the Account has none", () => {
    expect(
      playsAfterPlayerChange({
        kind: "sign_in",
        accountPlays: [],
      })
    ).toEqual([])
  })

  test("signing out leaves no Plays on this device", () => {
    expect(playsAfterPlayerChange({ kind: "sign_out" })).toEqual([])
  })
})

describe("playerChangeForAuth", () => {
  test("a new Account keeps the Guest Plays", () => {
    const guestPlays = [guestPlay()]
    expect(
      playerChangeForAuth({
        accountIsNew: true,
        guestPlays,
        accountPlays: [],
      })
    ).toEqual({ kind: "create_account", guestPlays })
  })

  test("a returning Account uses the Account Plays", () => {
    const accountPlays = [accountPlay()]
    expect(
      playerChangeForAuth({
        accountIsNew: false,
        guestPlays: [guestPlay()],
        accountPlays,
      })
    ).toEqual({ kind: "sign_in", accountPlays })
  })
})

import { describe, expect, test } from "vitest"
import {
  GuessRejectedError,
  createEmptyPlay,
  rejectionForGuess,
  setHardMode,
  submitGuess,
} from "./play"

function playOf(puzzle: string) {
  return createEmptyPlay({
    gameDay: "2026-08-30",
    puzzle,
    hardMode: false,
  })
}

describe("rejectionForGuess", () => {
  test("returns the live copy for a word not in either list", () => {
    expect(rejectionForGuess({ play: playOf("porta"), guess: "xyzzy" })).toBe(
      "Non nella lista di parole"
    )
  })

  test("returns the live copy when the draft is short", () => {
    expect(rejectionForGuess({ play: playOf("porta"), guess: "casa" })).toBe(
      "Non abbastanza lettere"
    )
  })
})

describe("submitGuess", () => {
  test("rejects words not in either list", () => {
    expect(() => submitGuess({ play: playOf("porta"), guess: "zzzzz" })).toThrow(
      GuessRejectedError
    )
  })

  test("wins on the puzzle", () => {
    const next = submitGuess({ play: playOf("porta"), guess: "porta" })
    expect(next.status).toBe("won")
    expect(next.evaluations[0]?.every((mark) => mark === "correct")).toBe(true)
  })

  test("loses on the sixth miss", () => {
    let play = playOf("porta")
    const misses = ["cassa", "sasso", "massa", "bassa", "tassa", "nassa"]
    for (const guess of misses) {
      play = submitGuess({ play, guess })
    }
    expect(play.status).toBe("lost")
    expect(play.guesses).toHaveLength(6)
  })
})

describe("setHardMode", () => {
  test("locks after the first guess", () => {
    const play = submitGuess({ play: playOf("porta"), guess: "cassa" })
    expect(() => setHardMode({ play, hardMode: true })).toThrow(
      GuessRejectedError
    )
  })
})

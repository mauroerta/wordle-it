import { describe, expect, test } from "vitest"
import { evaluateGuess, letterEvaluations } from "./evaluate-guess"

describe("evaluateGuess", () => {
  test("all correct", () => {
    expect(evaluateGuess({ guess: "porta", puzzle: "porta" })).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ])
  })

  test("all absent", () => {
    expect(evaluateGuess({ guess: "xyzzy", puzzle: "porta" })).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ])
  })

  test("present then consumes the remaining letter", () => {
    expect(evaluateGuess({ guess: "aroma", puzzle: "porta" })).toEqual([
      "absent",
      "present",
      "present",
      "absent",
      "correct",
    ])
  })

  test("duplicate letters: greens first, leftover yellows", () => {
    expect(evaluateGuess({ guess: "nanna", puzzle: "nonna" })).toEqual([
      "correct",
      "absent",
      "correct",
      "correct",
      "correct",
    ])
  })
})

describe("letterEvaluations", () => {
  test("keeps the strongest mark per letter", () => {
    expect(
      letterEvaluations({
        guesses: ["aroma", "porta"],
        evaluations: [
          ["absent", "present", "present", "absent", "correct"],
          ["correct", "correct", "correct", "correct", "correct"],
        ],
      })
    ).toEqual({
      a: "correct",
      r: "correct",
      o: "correct",
      m: "absent",
      p: "correct",
      t: "correct",
    })
  })
})

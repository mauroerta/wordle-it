import { describe, expect, test } from "vitest"
import { hardModeError } from "./hard-mode"

describe("hardModeError", () => {
  test("allows the first guess", () => {
    expect(
      hardModeError({
        guess: "aroma",
        previousGuess: undefined,
        previousMarks: undefined,
      })
    ).toBeUndefined()
  })

  test("requires greens to stay", () => {
    expect(
      hardModeError({
        guess: "sasso",
        previousGuess: "porta",
        previousMarks: ["absent", "absent", "absent", "absent", "correct"],
      })
    ).toBe("La quinta lettera deve essere A")
  })

  test("requires a green in the first tile", () => {
    expect(
      hardModeError({
        guess: "sasso",
        previousGuess: "porta",
        previousMarks: ["correct", "absent", "absent", "absent", "absent"],
      })
    ).toBe("La prima lettera deve essere P")
  })

  test("requires yellows to be reused", () => {
    expect(
      hardModeError({
        guess: "cassa",
        previousGuess: "aroma",
        previousMarks: ["absent", "present", "present", "absent", "correct"],
      })
    ).toBe("Deve contenere R")
  })
})

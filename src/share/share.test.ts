import { describe, expect, test } from "vitest"
import { shareText } from "./share"

describe("shareText", () => {
  test("formats a win", () => {
    expect(
      shareText({
        evaluations: [
          ["absent", "present", "absent", "absent", "correct"],
          ["correct", "correct", "correct", "correct", "correct"],
        ],
        dayOffset: 1700,
        guessesUsed: 2,
        hardMode: true,
        won: true,
        nightmode: false,
        colorblind: false,
      })
    ).toBe("Par🇮🇹le n°1700 2/6*\n\n⬜🟨⬜⬜🟩\n🟩🟩🟩🟩🟩")
  })
})

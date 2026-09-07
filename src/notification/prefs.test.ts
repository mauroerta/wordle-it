import { describe, expect, test } from "vitest"
import { DEFAULT_NOTIFICATION_PREFS, wantsKind } from "./prefs"

describe("wantsKind", () => {
  test("master off blocks every kind", () => {
    const prefs = {
      enabled: false,
      newPuzzle: true,
      hurryUp: true,
    }
    expect(wantsKind({ prefs, kind: "new_puzzle" })).toBe(false)
    expect(wantsKind({ prefs, kind: "hurry_up" })).toBe(false)
  })

  test("master on respects each kind toggle", () => {
    const prefs = {
      enabled: true,
      newPuzzle: true,
      hurryUp: false,
    }
    expect(wantsKind({ prefs, kind: "new_puzzle" })).toBe(true)
    expect(wantsKind({ prefs, kind: "hurry_up" })).toBe(false)
  })

  test("defaults want nothing", () => {
    expect(
      wantsKind({ prefs: DEFAULT_NOTIFICATION_PREFS, kind: "new_puzzle" })
    ).toBe(false)
  })
})

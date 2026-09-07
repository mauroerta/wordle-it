import { describe, expect, test } from "vitest"
import { notificationKindDueAt } from "./due"

describe("notificationKindDueAt", () => {
  test("Rome midnight is New Puzzle", () => {
    // 2026-03-15 00:30 Europe/Rome = 2026-03-14 23:30 UTC (CET)
    expect(notificationKindDueAt(new Date("2026-03-14T23:30:00Z"))).toBe(
      "new_puzzle"
    )
  })

  test("Rome 23:00 is Hurry-up", () => {
    // 2026-03-15 23:15 Europe/Rome = 2026-03-15 22:15 UTC (CET)
    expect(notificationKindDueAt(new Date("2026-03-15T22:15:00Z"))).toBe(
      "hurry_up"
    )
  })

  test("other Rome hours are idle", () => {
    // 2026-03-15 12:00 Europe/Rome = 2026-03-15 11:00 UTC
    expect(notificationKindDueAt(new Date("2026-03-15T11:00:00Z"))).toBe(null)
  })

  test("CEST midnight still maps to New Puzzle", () => {
    // 2026-07-15 00:10 Europe/Rome = 2026-07-14 22:10 UTC (CEST)
    expect(notificationKindDueAt(new Date("2026-07-14T22:10:00Z"))).toBe(
      "new_puzzle"
    )
  })
})

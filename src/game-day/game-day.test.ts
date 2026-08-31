import { describe, expect, test } from "vitest"
import {
  FIRST_GAME_DAY,
  addCalendarDays,
  calendarDateInRome,
  daysBetweenGameDays,
  formatCountdown,
  gameDayIndex,
  msUntilNextRomeMidnight,
  romeMidnightUtc,
} from "./game-day"

describe("calendarDateInRome", () => {
  test("First Game Day at Rome midnight is 2022-01-03", () => {
    expect(calendarDateInRome(romeMidnightUtc(FIRST_GAME_DAY))).toBe(
      FIRST_GAME_DAY
    )
  })

  test("a New York evening still uses Italy's date", () => {
    const newYorkEvening = new Date("2026-08-30T22:30:00-04:00")
    expect(calendarDateInRome(newYorkEvening)).toBe("2026-08-31")
  })
})

describe("gameDayIndex", () => {
  test("First Game Day is 0", () => {
    expect(gameDayIndex(romeMidnightUtc(FIRST_GAME_DAY))).toBe(0)
  })

  test("the next calendar date is 1", () => {
    expect(gameDayIndex(romeMidnightUtc("2022-01-04"))).toBe(1)
  })

  test("ora legale does not skip a Game Day", () => {
    const before = romeMidnightUtc("2026-03-28")
    const after = romeMidnightUtc("2026-03-30")
    expect(gameDayIndex(after) - gameDayIndex(before)).toBe(2)
  })

  test("anno bisestile counts 29 February", () => {
    expect(
      daysBetweenGameDays("2024-02-28", "2024-03-01")
    ).toBe(2)
  })
})

describe("countdown", () => {
  test("formats remaining time", () => {
    expect(formatCountdown(3_661_000)).toBe("01:01:01")
  })

  test("next midnight is the following Rome calendar date", () => {
    const now = romeMidnightUtc("2026-08-30")
    const ms = msUntilNextRomeMidnight(new Date(now.getTime() + 1_000))
    expect(ms).toBeGreaterThan(86_000_000)
    expect(addCalendarDays("2026-08-30", 1)).toBe("2026-08-31")
  })
})

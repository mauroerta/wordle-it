import { describe, expect, test } from "vitest"
import type { Play } from "../play/play"
import { averageAttemptsFromPlays, statisticsFromPlays } from "./statistics"

function won(gameDay: string, guesses: number): Play {
  return {
    gameDay,
    puzzle: "porta",
    guesses: Array.from({ length: guesses }, () => "porta"),
    evaluations: Array.from({ length: guesses }, () => [
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]),
    status: "won",
    hardMode: false,
  }
}

function lost(gameDay: string): Play {
  return {
    gameDay,
    puzzle: "porta",
    guesses: ["cassa", "sasso", "massa", "bassa", "tassa", "nassa"],
    evaluations: Array.from({ length: 6 }, () => [
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ]),
    status: "lost",
    hardMode: false,
  }
}

describe("statisticsFromPlays", () => {
  test("computes totals from Plays", () => {
    const stats = statisticsFromPlays({
      plays: [won("2026-08-28", 3), lost("2026-08-29"), won("2026-08-30", 2)],
      today: "2026-08-30",
    })
    expect(stats.gamesPlayed).toBe(3)
    expect(stats.gamesWon).toBe(2)
    expect(stats.winPercentage).toBe(67)
    expect(stats.currentStreak).toBe(1)
    expect(stats.maxStreak).toBe(1)
    expect(stats.guesses[2]).toBe(1)
    expect(stats.guesses[3]).toBe(1)
    expect(stats.guesses.fail).toBe(1)
  })

  test("a skipped Game Day breaks the current streak", () => {
    const stats = statisticsFromPlays({
      plays: [won("2026-08-28", 1)],
      today: "2026-08-30",
    })
    expect(stats.currentStreak).toBe(0)
    expect(stats.maxStreak).toBe(1)
  })
})

describe("averageAttemptsFromPlays", () => {
  test("counts a loss as 7 and ignores in-progress", () => {
    expect(
      averageAttemptsFromPlays([
        won("2026-08-28", 3),
        lost("2026-08-29"),
        { ...won("2026-08-30", 1), status: "in_progress" },
      ])
    ).toBe(5)
  })

  test("is undefined when there are no finished Plays", () => {
    expect(averageAttemptsFromPlays([])).toBeUndefined()
  })
})

import { describe, expect, test } from "vitest"
import type { Play } from "../../play/play"
import { podium } from "./podium"

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

describe("podium", () => {
  test("takes the top 5 for current Streak, sharing place on ties", () => {
    const rows = podium({
      today: "2026-09-03",
      metric: "currentStreak",
      members: [
        {
          accountId: "m",
          name: "Mauro Rossi",
          plays: [won("2026-09-02", 3), won("2026-09-03", 2)],
        },
        {
          accountId: "a",
          name: "Anna Bianchi",
          plays: [won("2026-09-03", 4)],
        },
        {
          accountId: "l",
          name: "Luca Verdi",
          plays: [won("2026-09-03", 1)],
        },
      ],
    })
    expect(rows.map((row) => [row.place, row.name, row.value])).toEqual([
      [1, "Mauro Rossi", 2],
      [2, "Anna Bianchi", 1],
      [2, "Luca Verdi", 1],
    ])
  })

  test("ranks average with loss as 7, lower better", () => {
    const rows = podium({
      today: "2026-09-03",
      metric: "average",
      members: [
        { accountId: "r", name: "Roberta Neri", plays: [won("2026-09-03", 3)] },
        { accountId: "m", name: "Mauro Rossi", plays: [won("2026-09-03", 6)] },
      ],
    })
    expect(rows.map((row) => [row.place, row.name, row.value])).toEqual([
      [1, "Roberta Neri", 3],
      [2, "Mauro Rossi", 6],
    ])
  })
})

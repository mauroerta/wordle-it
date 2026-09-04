import { describe, expect, test } from "vitest"
import type { Play } from "../../play/play"
import { todayRanking } from "./today"

function won(guesses: number, hardMode = false): Play {
  return {
    gameDay: "2026-09-03",
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
    hardMode,
  }
}

function lost(hardMode = false): Play {
  return {
    gameDay: "2026-09-03",
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
    hardMode,
  }
}

describe("todayRanking", () => {
  test("ranks wins by attempts, then losses, then not played, with shared place", () => {
    const rows = todayRanking({
      members: [
        { accountId: "m", name: "Mauro Rossi", play: won(3) },
        { accountId: "a", name: "Anna Bianchi", play: won(3, true) },
        { accountId: "l", name: "Luca Verdi", play: lost(true) },
        { accountId: "g", name: "Giulia Neri", play: undefined },
        {
          accountId: "p",
          name: "Paolo Blu",
          play: { ...won(1), status: "in_progress" },
        },
      ],
    })
    expect(
      rows.map((row) => [row.place, row.name, row.attemptsLabel, row.bucket])
    ).toEqual([
      [1, "Anna Bianchi", "3/6*", "won"],
      [1, "Mauro Rossi", "3/6", "won"],
      [3, "Luca Verdi", "X/6*", "lost"],
      [4, "Giulia Neri", "—", "not_played"],
      [4, "Paolo Blu", "—", "not_played"],
    ])
  })
})

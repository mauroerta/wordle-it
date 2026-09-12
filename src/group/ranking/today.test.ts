import { describe, expect, test } from "vitest"
import type { Play } from "../../play/play"
import { todayPodium, todayRanking } from "./today"

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
  test("ranks wins by attempts, then finish time, then losses and not played", () => {
    const rows = todayRanking({
      members: [
        {
          accountId: "m",
          name: "Mauro Rossi",
          play: won(3),
          finishedAt: 2000,
        },
        {
          accountId: "a",
          name: "Anna Bianchi",
          play: won(3, true),
          finishedAt: 1000,
        },
        {
          accountId: "l",
          name: "Luca Verdi",
          play: lost(true),
          finishedAt: 3000,
        },
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
      [2, "Mauro Rossi", "3/6", "won"],
      [3, "Luca Verdi", "X/6*", "lost"],
      [4, "Giulia Neri", "—", "not_played"],
      [5, "Paolo Blu", "—", "not_played"],
    ])
  })

  test("same attempts: earlier finish takes the higher place", () => {
    const rows = todayRanking({
      members: [
        {
          accountId: "m",
          name: "Mauro Rossi",
          play: won(2),
          finishedAt: 5000,
        },
        {
          accountId: "a",
          name: "Anna Bianchi",
          play: won(2),
          finishedAt: 1000,
        },
      ],
    })
    expect(rows.map((row) => [row.place, row.name])).toEqual([
      [1, "Anna Bianchi"],
      [2, "Mauro Rossi"],
    ])
  })
})

describe("todayPodium", () => {
  test("keeps only the first three places", () => {
    const rows = todayPodium({
      members: [
        {
          accountId: "a",
          name: "Anna",
          play: won(1),
          finishedAt: 1,
        },
        {
          accountId: "b",
          name: "Bruno",
          play: won(2),
          finishedAt: 2,
        },
        {
          accountId: "c",
          name: "Carla",
          play: won(3),
          finishedAt: 3,
        },
        {
          accountId: "d",
          name: "Dario",
          play: won(4),
          finishedAt: 4,
        },
      ],
    })
    expect(rows.map((row) => [row.place, row.name])).toEqual([
      [1, "Anna"],
      [2, "Bruno"],
      [3, "Carla"],
    ])
  })
})

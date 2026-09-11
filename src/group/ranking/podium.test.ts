import { describe, expect, test } from "vitest"
import type { Play } from "../../play/play"
import { formatPodiumValue, podium } from "./podium"
import type { PodiumMetric } from "./podium"

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

function ranks(
  metric: PodiumMetric,
  members: { accountId: string; name: string; plays: Play[] }[],
  today = "2026-09-03"
) {
  return podium({ today, metric, members }).map((row) => [
    row.place,
    row.name,
    row.value,
  ])
}

describe("podium", () => {
  test("takes the top 5 for current Streak, sharing place on ties", () => {
    expect(
      ranks("currentStreak", [
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
      ])
    ).toEqual([
      [1, "Mauro Rossi", 2],
      [2, "Anna Bianchi", 1],
      [2, "Luca Verdi", 1],
    ])
  })

  test("a loss today puts current Streak at 0", () => {
    expect(
      ranks("currentStreak", [
        {
          accountId: "a",
          name: "Anna Bianchi",
          plays: [won("2026-09-02", 2), won("2026-09-03", 3)],
        },
        {
          accountId: "m",
          name: "Mauro Rossi",
          plays: [won("2026-09-02", 2), lost("2026-09-03")],
        },
      ])
    ).toEqual([
      [1, "Anna Bianchi", 2],
      [2, "Mauro Rossi", 0],
    ])
  })

  test("not playing today keeps yesterday's current Streak on the Podium", () => {
    expect(
      ranks(
        "currentStreak",
        [
          {
            accountId: "m",
            name: "Mauro Rossi",
            plays: [
              won("2026-09-08", 1),
              won("2026-09-09", 1),
              won("2026-09-10", 1),
            ],
          },
          {
            accountId: "a",
            name: "Anna Bianchi",
            plays: [won("2026-09-10", 2)],
          },
        ],
        "2026-09-11"
      )
    ).toEqual([
      [1, "Mauro Rossi", 3],
      [2, "Anna Bianchi", 1],
    ])
  })

  test("ranks max Streak higher better", () => {
    expect(
      ranks("maxStreak", [
        {
          accountId: "m",
          name: "Mauro Rossi",
          plays: [won("2026-09-01", 2), won("2026-09-02", 2)],
        },
        {
          accountId: "a",
          name: "Anna Bianchi",
          plays: [won("2026-09-03", 4)],
        },
      ])
    ).toEqual([
      [1, "Mauro Rossi", 2],
      [2, "Anna Bianchi", 1],
    ])
  })

  test("ranks average with loss as 7, lower better", () => {
    expect(
      ranks("average", [
        { accountId: "r", name: "Roberta Neri", plays: [won("2026-09-03", 3)] },
        {
          accountId: "m",
          name: "Mauro Rossi",
          plays: [won("2026-09-02", 2), lost("2026-09-03")],
        },
      ])
    ).toEqual([
      [1, "Roberta Neri", 3],
      [2, "Mauro Rossi", 4.5],
    ])
  })

  test("ranks win percentage higher better", () => {
    expect(
      ranks("winPercentage", [
        {
          accountId: "m",
          name: "Mauro Rossi",
          plays: [won("2026-09-02", 3), lost("2026-09-03")],
        },
        {
          accountId: "a",
          name: "Anna Bianchi",
          plays: [won("2026-09-03", 4)],
        },
      ])
    ).toEqual([
      [1, "Anna Bianchi", 100],
      [2, "Mauro Rossi", 50],
    ])
  })

  test("ranks games played higher better", () => {
    expect(
      ranks("gamesPlayed", [
        {
          accountId: "a",
          name: "Anna Bianchi",
          plays: [won("2026-09-02", 3), won("2026-09-03", 2)],
        },
        {
          accountId: "m",
          name: "Mauro Rossi",
          plays: [won("2026-09-03", 4)],
        },
      ])
    ).toEqual([
      [1, "Anna Bianchi", 2],
      [2, "Mauro Rossi", 1],
    ])
  })

  test("ranks losses lower better", () => {
    expect(
      ranks("losses", [
        { accountId: "m", name: "Mauro Rossi", plays: [won("2026-09-03", 3)] },
        { accountId: "a", name: "Anna Bianchi", plays: [lost("2026-09-03")] },
      ])
    ).toEqual([
      [1, "Mauro Rossi", 0],
      [2, "Anna Bianchi", 1],
    ])
  })

  test("no finished Play has no average and no losses and sits last", () => {
    const members = [
      { accountId: "m", name: "Mauro Rossi", plays: [won("2026-09-03", 3)] },
      { accountId: "l", name: "Luca Verdi", plays: [] },
      {
        accountId: "p",
        name: "Paolo Blu",
        plays: [{ ...won("2026-09-03", 1), status: "in_progress" as const }],
      },
    ]
    expect(ranks("average", members)).toEqual([
      [1, "Mauro Rossi", 3],
      [2, "Luca Verdi", undefined],
      [2, "Paolo Blu", undefined],
    ])
    expect(ranks("losses", members)).toEqual([
      [1, "Mauro Rossi", 0],
      [2, "Luca Verdi", undefined],
      [2, "Paolo Blu", undefined],
    ])
  })

  test("keeps everyone tied for fifth when the Podium is full", () => {
    const members = [
      { accountId: "1", name: "Anna", plays: [won("2026-09-01", 1)] },
      {
        accountId: "2",
        name: "Bruno",
        plays: [won("2026-09-01", 1), won("2026-09-02", 1)],
      },
      {
        accountId: "3",
        name: "Carla",
        plays: [
          won("2026-09-01", 1),
          won("2026-09-02", 1),
          won("2026-09-03", 1),
        ],
      },
      {
        accountId: "4",
        name: "Dario",
        plays: [
          won("2026-08-31", 1),
          won("2026-09-01", 1),
          won("2026-09-02", 1),
          won("2026-09-03", 1),
        ],
      },
      { accountId: "5", name: "Elena", plays: [] },
      { accountId: "6", name: "Fabio", plays: [] },
      { accountId: "7", name: "Greta", plays: [] },
    ]
    expect(ranks("gamesPlayed", members)).toEqual([
      [1, "Dario", 4],
      [2, "Carla", 3],
      [3, "Bruno", 2],
      [4, "Anna", 1],
      [5, "Elena", 0],
      [5, "Fabio", 0],
      [5, "Greta", 0],
    ])
  })

  test("drops Members past fifth when places are distinct", () => {
    const days = [
      "2026-08-28",
      "2026-08-29",
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
    ]
    const members = Array.from({ length: 7 }, (_, i) => ({
      accountId: String(i),
      name: `Player ${i}`,
      plays: days.slice(0, 7 - i).map((gameDay) => won(gameDay, 3)),
    }))
    expect(ranks("gamesPlayed", members)).toEqual([
      [1, "Player 0", 7],
      [2, "Player 1", 6],
      [3, "Player 2", 5],
      [4, "Player 3", 4],
      [5, "Player 4", 3],
    ])
  })
})

describe("formatPodiumValue", () => {
  test("shows a dash when there is no value", () => {
    expect(formatPodiumValue({ metric: "average", value: undefined })).toBe("—")
  })

  test("formats average with one decimal in Italian", () => {
    expect(formatPodiumValue({ metric: "average", value: 4.5 })).toBe("4,5")
  })
})

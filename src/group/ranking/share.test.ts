import { describe, expect, test } from "vitest"
import type { TodayRow } from "./today"
import { shareTodayText, sharePodiumText } from "./share"

describe("shareTodayText", () => {
  test("formats today’s roster as chat text", () => {
    const rows: TodayRow[] = [
      {
        accountId: "a",
        name: "Anna Bianchi",
        place: 1,
        bucket: "won",
        attemptsLabel: "3/6*",
        hardMode: true,
      },
      {
        accountId: "m",
        name: "Mauro Rossi",
        place: 1,
        bucket: "won",
        attemptsLabel: "3/6",
        hardMode: false,
      },
      {
        accountId: "g",
        name: "Giulia Neri",
        place: 3,
        bucket: "not_played",
        attemptsLabel: "—",
        hardMode: false,
      },
    ]
    expect(
      shareTodayText({ groupName: "Famiglia Rossi", dayOffset: 1700, rows })
    ).toBe(
      "Par🇮🇹le n°1700 · Famiglia Rossi\n\n1. Anna Bianchi  3/6*\n1. Mauro Rossi  3/6\n3. Giulia Neri  —"
    )
  })
})

describe("sharePodiumText", () => {
  test("formats one metric podium", () => {
    expect(
      sharePodiumText({
        groupName: "Famiglia Rossi",
        metric: "maxStreak",
        rows: [
          { accountId: "m", name: "Mauro Rossi", place: 1, value: 100 },
          { accountId: "a", name: "Anna Bianchi", place: 2, value: 40 },
        ],
      })
    ).toBe(
      "Par🇮🇹le · Famiglia Rossi\nRecord di vittorie in fila\n\n1. Mauro Rossi  100\n2. Anna Bianchi  40"
    )
  })
})

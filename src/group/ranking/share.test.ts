import { describe, expect, test } from "vitest"
import type { TodayRow } from "./today"
import { shareTodayText, sharePodiumText } from "./share"

describe("shareTodayText", () => {
  test("shares only the podium with medal emojis", () => {
    const rows: TodayRow[] = [
      {
        accountId: "a",
        name: "Anna Bianchi",
        place: 1,
        bucket: "won",
        attemptsLabel: "3/6*",
        hardMode: true,
        belowPodium: false,
      },
      {
        accountId: "m",
        name: "Mauro Rossi",
        place: 2,
        bucket: "won",
        attemptsLabel: "3/6",
        hardMode: false,
        belowPodium: false,
      },
      {
        accountId: "l",
        name: "Luca Verdi",
        place: 3,
        bucket: "lost",
        attemptsLabel: "X/6",
        hardMode: false,
        belowPodium: false,
      },
      {
        accountId: "g",
        name: "Giulia Neri",
        place: 4,
        bucket: "not_played",
        attemptsLabel: "—",
        hardMode: false,
        belowPodium: true,
      },
    ]
    expect(
      shareTodayText({ groupName: "Famiglia Rossi", dayOffset: 1700, rows })
    ).toBe(
      "Par🇮🇹le n°1700 · Famiglia Rossi\n\n🥇 Anna Bianchi  3/6*\n🥈 Mauro Rossi  3/6\n🥉 Luca Verdi  X/6"
    )
  })

  test("omits the viewer row below the podium from share", () => {
    const rows: TodayRow[] = [
      {
        accountId: "a",
        name: "Anna",
        place: 1,
        bucket: "won",
        attemptsLabel: "1/6",
        hardMode: false,
        belowPodium: false,
      },
      {
        accountId: "b",
        name: "Bruno",
        place: 2,
        bucket: "won",
        attemptsLabel: "2/6",
        hardMode: false,
        belowPodium: false,
      },
      {
        accountId: "c",
        name: "Carla",
        place: 3,
        bucket: "won",
        attemptsLabel: "3/6",
        hardMode: false,
        belowPodium: false,
      },
      {
        accountId: "d",
        name: "Dario",
        place: 4,
        bucket: "won",
        attemptsLabel: "4/6",
        hardMode: false,
        belowPodium: true,
      },
    ]
    expect(shareTodayText({ groupName: "Amici", dayOffset: 10, rows })).toBe(
      "Par🇮🇹le n°10 · Amici\n\n🥇 Anna  1/6\n🥈 Bruno  2/6\n🥉 Carla  3/6"
    )
  })
})

describe("sharePodiumText", () => {
  test("formats one metric podium with medals", () => {
    expect(
      sharePodiumText({
        groupName: "Famiglia Rossi",
        metric: "maxStreak",
        rows: [
          {
            accountId: "m",
            name: "Mauro Rossi",
            place: 1,
            value: 100,
            belowPodium: false,
          },
          {
            accountId: "a",
            name: "Anna Bianchi",
            place: 2,
            value: 40,
            belowPodium: false,
          },
          {
            accountId: "l",
            name: "Luca Verdi",
            place: 2,
            value: 40,
            belowPodium: false,
          },
          {
            accountId: "g",
            name: "Giulia Neri",
            place: 4,
            value: 10,
            belowPodium: true,
          },
        ],
      })
    ).toBe(
      "Par🇮🇹le · Famiglia Rossi\nRecord di vittorie in fila\n\n🥇 Mauro Rossi  100\n🥈 Anna Bianchi  40\n🥈 Luca Verdi  40"
    )
  })

  test("everyone tied for first shares the gold medal", () => {
    expect(
      sharePodiumText({
        groupName: "Famiglia Rossi",
        metric: "currentStreak",
        rows: [
          {
            accountId: "a",
            name: "Anna Bianchi",
            place: 1,
            value: 3,
            belowPodium: false,
          },
          {
            accountId: "l",
            name: "Luca Verdi",
            place: 1,
            value: 3,
            belowPodium: false,
          },
          {
            accountId: "m",
            name: "Mauro Rossi",
            place: 1,
            value: 3,
            belowPodium: false,
          },
        ],
      })
    ).toBe(
      "Par🇮🇹le · Famiglia Rossi\nVinte di fila\n\n🥇 Anna Bianchi  3\n🥇 Luca Verdi  3\n🥇 Mauro Rossi  3"
    )
  })
})

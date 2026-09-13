import { inArray } from "drizzle-orm"
import type { Db } from "../db/db"
import { addCalendarDays } from "../game-day/game-day"
import type { Play, PlayStatus } from "../play/play"
import { accounts, plays } from "../player/schema"
import { groupMembers } from "./schema"

export const DEMO_ACCOUNT_PREFIX = "demo-parle-"

type DemoMemberSpec = {
  id: string
  name: string
  /** Finished Plays relative to today: negative = past Game Days. */
  history: { daysAgo: number; guesses: number; status?: PlayStatus }[]
  /** When today’s Play finished (ms). Earlier ranks higher on a draw. */
  todayFinishedAt?: number
}

// Five synthetic Members that exercise podium, ties, finish-time, and “below 3rd”.
export const DEMO_MEMBERS: DemoMemberSpec[] = [
  {
    id: `${DEMO_ACCOUNT_PREFIX}anna`,
    name: "Anna Bianchi",
    history: [
      { daysAgo: 4, guesses: 3 },
      { daysAgo: 3, guesses: 2 },
      { daysAgo: 2, guesses: 4 },
      { daysAgo: 1, guesses: 3 },
      { daysAgo: 0, guesses: 2 },
    ],
    todayFinishedAt: Date.parse("2026-01-01T08:00:00Z"),
  },
  {
    id: `${DEMO_ACCOUNT_PREFIX}bruno`,
    name: "Bruno Conti",
    history: [
      { daysAgo: 1, guesses: 3 },
      { daysAgo: 0, guesses: 2 },
    ],
    todayFinishedAt: Date.parse("2026-01-01T10:00:00Z"),
  },
  {
    id: `${DEMO_ACCOUNT_PREFIX}carla`,
    name: "Carla De Luca",
    history: [
      { daysAgo: 2, guesses: 5 },
      { daysAgo: 0, guesses: 3 },
    ],
    todayFinishedAt: Date.parse("2026-01-01T09:00:00Z"),
  },
  {
    id: `${DEMO_ACCOUNT_PREFIX}dario`,
    name: "Dario Esposito",
    history: [
      { daysAgo: 3, guesses: 6, status: "lost" },
      { daysAgo: 2, guesses: 6, status: "lost" },
      { daysAgo: 0, guesses: 5 },
    ],
    todayFinishedAt: Date.parse("2026-01-01T12:00:00Z"),
  },
  {
    id: `${DEMO_ACCOUNT_PREFIX}elena`,
    name: "Elena Farina",
    history: [],
  },
]

export async function seedDemoMembers({
  db,
  groupId,
  today,
}: {
  db: Db
  groupId: string
  today: string
}): Promise<{ memberCount: number }> {
  const demoIds = DEMO_MEMBERS.map((member) => member.id)

  for (const member of DEMO_MEMBERS) {
    await db
      .insert(accounts)
      .values({ id: member.id, name: member.name })
      .onConflictDoUpdate({
        target: accounts.id,
        set: { name: member.name },
      })
    await db
      .insert(groupMembers)
      .values({ groupId, accountId: member.id, role: "member" })
      .onConflictDoNothing()
  }

  await db.delete(plays).where(inArray(plays.accountId, demoIds))

  const playRows = DEMO_MEMBERS.flatMap((member) =>
    member.history.map((entry) => {
      const play = demoPlay({
        gameDay: addCalendarDays(today, -entry.daysAgo),
        guesses: entry.guesses,
        status: entry.status ?? "won",
      })
      const finishedAt =
        entry.daysAgo === 0 && member.todayFinishedAt !== undefined
          ? new Date(member.todayFinishedAt)
          : new Date()
      return {
        accountId: member.id,
        gameDay: play.gameDay,
        puzzle: play.puzzle,
        guesses: play.guesses,
        evaluations: play.evaluations,
        status: play.status,
        hardMode: play.hardMode,
        updatedAt: finishedAt,
      }
    })
  )
  if (playRows.length > 0) {
    await db.insert(plays).values(playRows)
  }

  return { memberCount: DEMO_MEMBERS.length }
}

function demoPlay({
  gameDay,
  guesses,
  status,
}: {
  gameDay: string
  guesses: number
  status: PlayStatus
}): Play {
  const count = status === "lost" ? 6 : guesses
  return {
    gameDay,
    puzzle: "porta",
    guesses: Array.from({ length: count }, () =>
      status === "lost" ? "cassa" : "porta"
    ),
    evaluations: Array.from({ length: count }, () =>
      status === "lost"
        ? (["absent", "absent", "absent", "absent", "absent"] as const)
        : (["correct", "correct", "correct", "correct", "correct"] as const)
    ),
    status,
    hardMode: false,
  }
}

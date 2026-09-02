import { eq } from "drizzle-orm"
import type { Db } from "../db/db"
import type { Play } from "../play/play"
import { accounts, plays } from "./schema"

export async function ensureAccount({
  db,
  accountId,
}: {
  db: Db
  accountId: string
}): Promise<boolean> {
  const inserted = await db
    .insert(accounts)
    .values({ id: accountId })
    .onConflictDoNothing()
    .returning({ id: accounts.id })
  return inserted.length > 0
}

export function createAccountPlays({
  db,
  accountId,
}: {
  db: Db
  accountId: string
}) {
  async function load(): Promise<Play[]> {
    const rows = await db
      .select()
      .from(plays)
      .where(eq(plays.accountId, accountId))
    return rows.map(playFromRow)
  }

  async function playForGameDay(gameDay: string): Promise<Play | undefined> {
    const all = await load()
    return all.find((play) => play.gameDay === gameDay)
  }

  async function savePlay(play: Play): Promise<void> {
    const row = rowFromPlay({ accountId, play })
    await db
      .insert(plays)
      .values(row)
      .onConflictDoUpdate({
        target: [plays.accountId, plays.gameDay],
        set: {
          puzzle: row.puzzle,
          guesses: row.guesses,
          evaluations: row.evaluations,
          status: row.status,
          hardMode: row.hardMode,
          updatedAt: new Date(),
        },
      })
  }

  async function replaceAll(nextPlays: Play[]): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(plays).where(eq(plays.accountId, accountId))
      if (nextPlays.length === 0) {
        return
      }
      await tx
        .insert(plays)
        .values(nextPlays.map((play) => rowFromPlay({ accountId, play })))
    })
  }

  return { load, playForGameDay, savePlay, replaceAll }
}

function rowFromPlay({ accountId, play }: { accountId: string; play: Play }) {
  return {
    accountId,
    gameDay: play.gameDay,
    puzzle: play.puzzle,
    guesses: play.guesses,
    evaluations: play.evaluations,
    status: play.status,
    hardMode: play.hardMode,
    updatedAt: new Date(),
  }
}

function playFromRow(row: typeof plays.$inferSelect): Play {
  return {
    gameDay: row.gameDay,
    puzzle: row.puzzle,
    guesses: row.guesses,
    evaluations: row.evaluations,
    status: row.status,
    hardMode: row.hardMode,
  }
}

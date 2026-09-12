import type { Play } from "../../play/play"

export type TodayBucket = "won" | "lost" | "not_played"

export type TodayRow = {
  accountId: string
  name: string
  place: number
  bucket: TodayBucket
  attemptsLabel: string
  hardMode: boolean
}

export type TodayMember = {
  accountId: string
  name: string
  play: Play | undefined
  /** When the Play finished (won/lost). Earlier wins a same-attempts draw. */
  finishedAt?: number
}

export const TODAY_PODIUM_SIZE = 3

const TODAY_MEDALS = ["🥇", "🥈", "🥉"] as const

export function todayMedal(place: number): string | undefined {
  if (place < 1 || place > TODAY_PODIUM_SIZE) {
    return undefined
  }
  return TODAY_MEDALS[place - 1]
}

function bucketOf(play: Play | undefined): TodayBucket {
  if (!play || play.status === "in_progress") {
    return "not_played"
  }
  if (play.status === "lost") {
    return "lost"
  }
  return "won"
}

function bucketOrder(bucket: TodayBucket): number {
  if (bucket === "won") {
    return 0
  }
  if (bucket === "lost") {
    return 1
  }
  return 2
}

export function attemptsLabel({ play }: { play: Play | undefined }): string {
  if (!play || play.status === "in_progress") {
    return "—"
  }
  const score = play.status === "lost" ? "X" : String(play.guesses.length)
  return play.hardMode ? `${score}/6*` : `${score}/6`
}

export function todayRanking({
  members,
}: {
  members: TodayMember[]
}): TodayRow[] {
  const sorted = [...members].sort((a, b) => {
    const bucketA = bucketOf(a.play)
    const bucketB = bucketOf(b.play)
    if (bucketA !== bucketB) {
      return bucketOrder(bucketA) - bucketOrder(bucketB)
    }
    if (bucketA === "won") {
      const guessDelta =
        (a.play?.guesses.length ?? 0) - (b.play?.guesses.length ?? 0)
      if (guessDelta !== 0) {
        return guessDelta
      }
    }
    if (bucketA !== "not_played") {
      const timeA = a.finishedAt ?? Number.POSITIVE_INFINITY
      const timeB = b.finishedAt ?? Number.POSITIVE_INFINITY
      if (timeA !== timeB) {
        return timeA - timeB
      }
    }
    return a.name.localeCompare(b.name, "it")
  })

  return sorted.map((member, index) => {
    const bucket = bucketOf(member.play)
    return {
      accountId: member.accountId,
      name: member.name,
      place: index + 1,
      bucket,
      attemptsLabel: attemptsLabel({ play: member.play }),
      hardMode: member.play?.hardMode === true && bucket !== "not_played",
    }
  })
}

export function todayPodium({
  members,
}: {
  members: TodayMember[]
}): TodayRow[] {
  return todayRanking({ members }).filter(
    (row) => row.place <= TODAY_PODIUM_SIZE
  )
}

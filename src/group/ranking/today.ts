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
    return a.name.localeCompare(b.name, "it")
  })

  const rows: TodayRow[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i + 1
    while (j < sorted.length && sameTodayRank(sorted[i], sorted[j])) {
      j += 1
    }
    const place = i + 1
    for (let k = i; k < j; k++) {
      const member = sorted[k]
      const bucket = bucketOf(member.play)
      rows.push({
        accountId: member.accountId,
        name: member.name,
        place,
        bucket,
        attemptsLabel: attemptsLabel({ play: member.play }),
        hardMode: member.play?.hardMode === true && bucket !== "not_played",
      })
    }
    i = j
  }
  return rows
}

function sameTodayRank(a: TodayMember, b: TodayMember): boolean {
  const bucketA = bucketOf(a.play)
  const bucketB = bucketOf(b.play)
  if (bucketA !== bucketB) {
    return false
  }
  if (bucketA === "won") {
    return a.play?.guesses.length === b.play?.guesses.length
  }
  return true
}

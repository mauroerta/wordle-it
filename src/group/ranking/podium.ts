import type { Play } from "../../play/play"
import {
  averageAttemptsFromPlays,
  statisticsFromPlays,
} from "../../statistics/statistics"

export type PodiumMetric =
  | "currentStreak"
  | "maxStreak"
  | "average"
  | "winPercentage"
  | "gamesPlayed"
  | "losses"

export type PodiumMember = {
  accountId: string
  name: string
  plays: Play[]
}

export type PodiumRow = {
  accountId: string
  name: string
  place: number
  value: number | undefined
}

const METRIC_LABELS: Record<PodiumMetric, string> = {
  currentStreak: "Vinte di fila",
  maxStreak: "Record di vittorie in fila",
  average: "Media tentativi",
  winPercentage: "% Vittorie",
  gamesPlayed: "Partite",
  losses: "Sconfitte",
}

export function podiumLabel(metric: PodiumMetric): string {
  return METRIC_LABELS[metric]
}

const PODIUM_SIZE = 5

export const PODIUM_METRICS: PodiumMetric[] = [
  "currentStreak",
  "maxStreak",
  "average",
  "winPercentage",
  "gamesPlayed",
  "losses",
]

export function rankMetric({
  members,
  today,
  metric,
}: {
  members: PodiumMember[]
  today: string
  metric: PodiumMetric
}): PodiumRow[] {
  const scored = members.map((member) => ({
    accountId: member.accountId,
    name: member.name,
    value: metricValue({ plays: member.plays, today, metric }),
  }))
  const sorted = [...scored].sort((a, b) => {
    const delta = compareMetric({ metric, a: a.value, b: b.value })
    if (delta !== 0) {
      return delta
    }
    return a.name.localeCompare(b.name, "it")
  })
  const rows: PodiumRow[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i + 1
    while (j < sorted.length && sorted[i].value === sorted[j].value) {
      j += 1
    }
    const place = i + 1
    for (let k = i; k < j; k++) {
      rows.push({ ...sorted[k], place })
    }
    i = j
  }
  return rows
}

export function podium({
  members,
  today,
  metric,
}: {
  members: PodiumMember[]
  today: string
  metric: PodiumMetric
}): PodiumRow[] {
  return rankMetric({ members, today, metric }).filter(
    (row) => row.place <= PODIUM_SIZE
  )
}

export function formatPodiumValue({
  metric,
  value,
}: {
  metric: PodiumMetric
  value: number | undefined
}): string {
  if (value === undefined) {
    return "—"
  }
  if (metric === "average") {
    return value.toLocaleString("it-IT", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
  }
  return String(value)
}

function metricValue({
  plays,
  today,
  metric,
}: {
  plays: Play[]
  today: string
  metric: PodiumMetric
}): number | undefined {
  const stats = statisticsFromPlays({ plays, today })
  if (metric === "losses") {
    return stats.gamesPlayed === 0 ? undefined : stats.guesses.fail
  }
  if (metric === "currentStreak") {
    return stats.currentStreak
  }
  if (metric === "maxStreak") {
    return stats.maxStreak
  }
  if (metric === "average") {
    return averageAttemptsFromPlays(plays)
  }
  if (metric === "winPercentage") {
    return stats.winPercentage
  }
  return stats.gamesPlayed
}

function compareMetric({
  metric,
  a,
  b,
}: {
  metric: PodiumMetric
  a: number | undefined
  b: number | undefined
}): number {
  if (a === undefined && b === undefined) {
    return 0
  }
  if (a === undefined) {
    return 1
  }
  if (b === undefined) {
    return -1
  }
  const lowerIsBetter = metric === "average" || metric === "losses"
  return lowerIsBetter ? a - b : b - a
}

import type { TodayRow } from "./today"
import {
  formatPodiumValue,
  podiumLabel,
  PODIUM_SIZE,
  podiumMedal,
} from "./podium"
import type { PodiumMetric, PodiumRow } from "./podium"

export function shareTodayText({
  groupName,
  dayOffset,
  rows,
}: {
  groupName: string
  dayOffset: number
  rows: TodayRow[]
}): string {
  const body = rows
    .filter((row) => !row.belowPodium && row.place <= PODIUM_SIZE)
    .map((row) => {
      const medal = podiumMedal(row.place) ?? `${row.place}.`
      return `${medal} ${row.name}  ${row.attemptsLabel}`
    })
    .join("\n")
  return `Par🇮🇹le n°${dayOffset} · ${groupName}\n\n${body}`
}

export function sharePodiumText({
  groupName,
  metric,
  rows,
}: {
  groupName: string
  metric: PodiumMetric
  rows: PodiumRow[]
}): string {
  const body = rows
    .filter((row) => !row.belowPodium && row.place <= PODIUM_SIZE)
    .map((row) => {
      const medal = podiumMedal(row.place) ?? `${row.place}.`
      return `${medal} ${row.name}  ${formatPodiumValue({ metric, value: row.value })}`
    })
    .join("\n")
  return `Par🇮🇹le · ${groupName}\n${podiumLabel(metric)}\n\n${body}`
}

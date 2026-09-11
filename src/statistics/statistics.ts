import type { Play } from "../play/play"
import { addCalendarDays, daysBetweenGameDays } from "../game-day/game-day"

export type Statistics = {
  gamesPlayed: number
  gamesWon: number
  winPercentage: number
  currentStreak: number
  maxStreak: number
  guesses: Record<1 | 2 | 3 | 4 | 5 | 6 | "fail", number>
}

export function averageAttemptsFromPlays(plays: Play[]): number | undefined {
  const finished = plays.filter((play) => play.status !== "in_progress")
  if (finished.length === 0) {
    return undefined
  }
  let total = 0
  for (const play of finished) {
    total += play.status === "lost" ? 7 : play.guesses.length
  }
  return total / finished.length
}

export function statisticsFromPlays({
  plays,
  today,
}: {
  plays: Play[]
  today: string
}): Statistics {
  const finished = plays.filter((play) => play.status !== "in_progress")
  const wins = finished.filter((play) => play.status === "won")
  const guesses = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    fail: 0,
  } as Statistics["guesses"]

  for (const play of finished) {
    if (play.status === "lost") {
      guesses.fail += 1
      continue
    }
    const n = play.guesses.length
    if (n >= 1 && n <= 6) {
      guesses[n as 1 | 2 | 3 | 4 | 5 | 6] += 1
    }
  }

  const gamesPlayed = finished.length
  const gamesWon = wins.length
  const winPercentage =
    gamesPlayed === 0 ? 0 : Math.round((gamesWon / gamesPlayed) * 100)

  const wonDays = new Set(wins.map((play) => play.gameDay))
  const todayFinished = finished.find((play) => play.gameDay === today)
  const currentStreak =
    todayFinished?.status === "lost" ? 0 : streakEndingNear({ wonDays, today })
  const maxStreak = longestStreak(wonDays)

  return {
    gamesPlayed,
    gamesWon,
    winPercentage,
    currentStreak,
    maxStreak,
    guesses,
  }
}

function streakEndingNear({
  wonDays,
  today,
}: {
  wonDays: Set<string>
  today: string
}): number {
  if (wonDays.has(today)) {
    return countBack({ wonDays, from: today })
  }
  // Not finished today: streak stays alive through yesterday's win.
  const yesterday = addCalendarDays(today, -1)
  if (wonDays.has(yesterday)) {
    return countBack({ wonDays, from: yesterday })
  }
  return 0
}

function countBack({
  wonDays,
  from,
}: {
  wonDays: Set<string>
  from: string
}): number {
  let streak = 0
  let day = from
  while (wonDays.has(day)) {
    streak += 1
    day = addCalendarDays(day, -1)
  }
  return streak
}

function longestStreak(wonDays: Set<string>): number {
  const days = [...wonDays].sort()
  let best = 0
  let run = 0
  let prev: string | undefined
  for (const day of days) {
    if (prev && daysBetweenGameDays(prev, day) === 1) {
      run += 1
    } else {
      run = 1
    }
    best = Math.max(best, run)
    prev = day
  }
  return best
}

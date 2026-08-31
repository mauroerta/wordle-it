export const ROME_TIME_ZONE = "Europe/Rome"
export const FIRST_GAME_DAY = "2022-01-03"

export function calendarDateInRome(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ROME_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at)
}

export function daysBetweenGameDays(from: string, to: string): number {
  return utcCalendarDay(to) - utcCalendarDay(from)
}

export function gameDayIndex(at: Date): number {
  const index = daysBetweenGameDays(FIRST_GAME_DAY, calendarDateInRome(at))
  if (index < 0) {
    throw new Error("Game Day is before First Game Day")
  }
  return index
}

export function addCalendarDays(isoDate: string, days: number): string {
  const utc = Date.UTC(
    Number(isoDate.slice(0, 4)),
    Number(isoDate.slice(5, 7)) - 1,
    Number(isoDate.slice(8, 10)) + days
  )
  const next = new Date(utc)
  return [
    String(next.getUTCFullYear()),
    pad2(next.getUTCMonth() + 1),
    pad2(next.getUTCDate()),
  ].join("-")
}

export function romeMidnightUtc(isoDate: string): Date {
  const year = Number(isoDate.slice(0, 4))
  const month = Number(isoDate.slice(5, 7))
  const day = Number(isoDate.slice(8, 10))
  let utc = Date.UTC(year, month - 1, day, 0, 0, 0)
  for (let i = 0; i < 4; i++) {
    const parts = romeDateTime(new Date(utc))
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    )
    const wanted = Date.UTC(year, month - 1, day, 0, 0, 0)
    utc += wanted - asUtc
  }
  return new Date(utc)
}

export function msUntilNextRomeMidnight(at: Date): number {
  const tomorrow = addCalendarDays(calendarDateInRome(at), 1)
  return romeMidnightUtc(tomorrow).getTime() - at.getTime()
}

export function formatCountdown(ms: number): string {
  const clamped = Math.max(0, ms)
  const hours = Math.floor(clamped / 3_600_000)
  const minutes = Math.floor((clamped % 3_600_000) / 60_000)
  const seconds = Math.floor((clamped % 60_000) / 1_000)
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
}

function utcCalendarDay(isoDate: string): number {
  return Math.round(
    Date.UTC(
      Number(isoDate.slice(0, 4)),
      Number(isoDate.slice(5, 7)) - 1,
      Number(isoDate.slice(8, 10))
    ) / 86_400_000
  )
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function romeDateTime(at: Date): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
} {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ROME_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at)
  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value)
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  }
}

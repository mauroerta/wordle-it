import type { Play } from "./play"

export type KeyValueStore = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

const STORAGE_KEY = "parle.plays"

export function createGuestPlayStore({
  storage,
}: {
  storage: KeyValueStore
}) {
  function load(): Play[] {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return []
      }
      return parsed.filter(isPlay)
    } catch {
      return []
    }
  }

  function playForGameDay(gameDay: string): Play | undefined {
    return load().find((play) => play.gameDay === gameDay)
  }

  function savePlay(play: Play): void {
    const rest = load().filter((stored) => stored.gameDay !== play.gameDay)
    storage.setItem(STORAGE_KEY, JSON.stringify([...rest, play]))
  }

  function hasEverPlayed(): boolean {
    return load().some((play) => play.guesses.length > 0)
  }

  return { load, playForGameDay, savePlay, hasEverPlayed }
}

function isPlay(value: unknown): value is Play {
  if (!value || typeof value !== "object") {
    return false
  }
  const play = value as Partial<Play>
  return (
    typeof play.gameDay === "string" &&
    typeof play.puzzle === "string" &&
    Array.isArray(play.guesses) &&
    Array.isArray(play.evaluations) &&
    (play.status === "in_progress" ||
      play.status === "won" ||
      play.status === "lost") &&
    typeof play.hardMode === "boolean"
  )
}

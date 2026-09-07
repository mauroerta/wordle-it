import { hourInRome } from "../game-day/game-day"
import type { NotificationKind } from "./prefs"

export function notificationKindDueAt(at: Date): NotificationKind | null {
  const hour = hourInRome(at)
  if (hour === 0) {
    return "new_puzzle"
  }
  if (hour === 23) {
    return "hurry_up"
  }
  return null
}

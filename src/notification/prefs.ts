export type NotificationKind = "new_puzzle" | "hurry_up"

export type NotificationPrefs = {
  enabled: boolean
  newPuzzle: boolean
  hurryUp: boolean
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: false,
  newPuzzle: false,
  hurryUp: false,
}

export function wantsKind({
  prefs,
  kind,
}: {
  prefs: NotificationPrefs
  kind: NotificationKind
}): boolean {
  if (!prefs.enabled) {
    return false
  }
  if (kind === "new_puzzle") {
    return prefs.newPuzzle
  }
  return prefs.hurryUp
}

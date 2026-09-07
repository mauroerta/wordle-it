import type { NotificationKind } from "./prefs"

export function notificationPayload(kind: NotificationKind): {
  title: string
  body: string
} {
  if (kind === "new_puzzle") {
    return {
      title: "Par🇮🇹le",
      body: "È pronto il Puzzle di oggi",
    }
  }
  return {
    title: "Par🇮🇹le",
    body: "Manca poco a mezzanotte: hai ancora il Puzzle di oggi",
  }
}

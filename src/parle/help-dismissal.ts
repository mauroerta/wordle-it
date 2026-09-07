import type { KeyValueStore } from "../player/device"

export const HELP_DISMISSED_KEY = "parle.helpDismissed"

export function createHelpDismissal({ storage }: { storage: KeyValueStore }) {
  function isDismissed(): boolean {
    return storage.getItem(HELP_DISMISSED_KEY) === "1"
  }

  function dismiss(): void {
    storage.setItem(HELP_DISMISSED_KEY, "1")
  }

  return { isDismissed, dismiss }
}

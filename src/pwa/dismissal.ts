import type { KeyValueStore } from "../player/device"

export const PWA_INSTALL_DISMISSED_KEY = "parle.pwaInstallDismissed"

export function createPwaInstallDismissal({
  storage,
}: {
  storage: KeyValueStore
}) {
  function isDismissed(): boolean {
    return storage.getItem(PWA_INSTALL_DISMISSED_KEY) === "1"
  }

  function dismiss(): void {
    storage.setItem(PWA_INSTALL_DISMISSED_KEY, "1")
  }

  return { isDismissed, dismiss }
}

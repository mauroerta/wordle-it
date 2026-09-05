import { useEffect, useMemo, useState } from "react"
import { createPwaInstallDismissal } from "../dismissal"
import { installKind, readInstallEnvironment } from "../installability"
import type { InstallKind } from "../installability"

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>
}

export type PwaInstallController = {
  kind: InstallKind
  canPrompt: boolean
  nativeAvailable: boolean
  open: boolean
  openPrompt: () => void
  closePrompt: () => void
  dismissPrompt: () => void
  install: () => Promise<"accepted" | "dismissed" | "unavailable">
}

const AUTO_OPEN_DELAY_MS = 2500

export function usePwaInstall({
  blocked = false,
}: {
  blocked?: boolean
} = {}): PwaInstallController {
  const dismissal = useMemo(
    () =>
      createPwaInstallDismissal({
        storage: window.localStorage,
      }),
    []
  )
  const [kind, setKind] = useState<InstallKind>(() =>
    installKind(readInstallEnvironment())
  )
  const [nativePrompt, setNativePrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function syncKind() {
      setKind(installKind(readInstallEnvironment()))
    }

    const media = window.matchMedia("(display-mode: standalone)")
    media.addEventListener("change", syncKind)
    window.addEventListener("appinstalled", syncKind)
    return () => {
      media.removeEventListener("change", syncKind)
      window.removeEventListener("appinstalled", syncKind)
    }
  }, [])

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setNativePrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    if (kind === "installed") {
      setOpen(false)
      setNativePrompt(null)
    }
  }, [kind])

  useEffect(() => {
    if (kind === "installed" || dismissal.isDismissed() || blocked) {
      return
    }
    // Chromium: wait until the browser says install is available.
    if (kind === "browser" && !nativePrompt) {
      return
    }

    const id = window.setTimeout(() => setOpen(true), AUTO_OPEN_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [kind, nativePrompt, blocked, dismissal])

  const canPrompt = kind === "ios" || kind === "browser"
  const nativeAvailable = nativePrompt !== null

  function openPrompt() {
    if (!canPrompt) {
      return
    }
    setOpen(true)
  }

  function closePrompt() {
    setOpen(false)
  }

  function dismissPrompt() {
    dismissal.dismiss()
    setOpen(false)
  }

  async function install(): Promise<"accepted" | "dismissed" | "unavailable"> {
    if (!nativePrompt) {
      return "unavailable"
    }
    const result = await nativePrompt.prompt()
    setNativePrompt(null)
    if (result.outcome === "accepted") {
      setKind("installed")
      setOpen(false)
    } else {
      dismissal.dismiss()
      setOpen(false)
    }
    return result.outcome
  }

  return {
    kind,
    canPrompt,
    nativeAvailable,
    open,
    openPrompt,
    closePrompt,
    dismissPrompt,
    install,
  }
}

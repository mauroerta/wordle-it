import { useEffect, useState } from "react"
import { loadNotificationSettings } from "../queries/notifications"
import {
  saveNotificationPrefs,
  savePushSubscription,
} from "../mutations/notifications"
import type { NotificationPrefs } from "../prefs"
import { DEFAULT_NOTIFICATION_PREFS } from "../prefs"
import { ensurePushSubscription } from "../subscribe"

export type NotificationSettingsController = {
  prefs: NotificationPrefs
  ready: boolean
  available: boolean
  busy: boolean
  error: string | null
  setEnabled: (enabled: boolean) => void
  setNewPuzzle: (newPuzzle: boolean) => void
  setHurryUp: (hurryUp: boolean) => void
}

export function useNotificationSettings({
  signedIn,
}: {
  signedIn: boolean
}): NotificationSettingsController {
  const [prefs, setPrefs] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS
  )
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!signedIn) {
      setPrefs(DEFAULT_NOTIFICATION_PREFS)
      setVapidPublicKey(null)
      setReady(false)
      setError(null)
      return
    }
    let cancelled = false
    void loadNotificationSettings().then((settings) => {
      if (cancelled) {
        return
      }
      setPrefs(settings.prefs)
      setVapidPublicKey(settings.vapidPublicKey)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [signedIn])

  async function persist(next: NotificationPrefs) {
    setBusy(true)
    setError(null)
    setPrefs(next)
    try {
      if (next.enabled || next.newPuzzle || next.hurryUp) {
        if (!vapidPublicKey) {
          throw new Error("Notifiche non configurate sul server")
        }
        const subscription = await ensurePushSubscription({ vapidPublicKey })
        await savePushSubscription({ data: { subscription } })
      }
      await saveNotificationPrefs({ data: { prefs: next } })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Errore")
      const settings = await loadNotificationSettings()
      setPrefs(settings.prefs)
    } finally {
      setBusy(false)
    }
  }

  return {
    prefs,
    ready,
    available: Boolean(vapidPublicKey),
    busy,
    error,
    setEnabled(enabled) {
      void persist(
        enabled && !prefs.newPuzzle && !prefs.hurryUp
          ? { enabled: true, newPuzzle: true, hurryUp: true }
          : { ...prefs, enabled }
      )
    },
    setNewPuzzle(newPuzzle) {
      void persist({
        ...prefs,
        enabled: newPuzzle || prefs.hurryUp ? true : prefs.enabled,
        newPuzzle,
      })
    },
    setHurryUp(hurryUp) {
      void persist({
        ...prefs,
        enabled: hurryUp || prefs.newPuzzle ? true : prefs.enabled,
        hurryUp,
      })
    },
  }
}

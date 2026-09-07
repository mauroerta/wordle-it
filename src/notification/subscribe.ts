export async function ensurePushSubscription({
  vapidPublicKey,
}: {
  vapidPublicKey: string
}): Promise<{
  endpoint: string
  p256dh: string
  auth: string
}> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push non supportato su questo dispositivo")
  }
  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    throw new Error("Permesso notifiche negato")
  }
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    }))
  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Sottoscrizione push incompleta")
  }
  return {
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  }
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i)
  }
  return output
}

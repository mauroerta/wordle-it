import webpush from "web-push"
import type { PushSubscriptionRecord } from "./store"

export type PushSender = {
  send: (subscription: PushSubscriptionRecord, payload: string) => Promise<void>
}

export function vapidConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
  )
}

export function vapidPublicKey(): string {
  const key = process.env.VAPID_PUBLIC_KEY
  if (!key) {
    throw new Error("VAPID_PUBLIC_KEY is not set")
  }
  return key
}

export function createWebPushSender(): PushSender {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  if (!publicKey || !privateKey || !subject) {
    throw new Error("VAPID keys are not set")
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  return {
    async send(subscription, payload) {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload
      )
    },
  }
}

export function isGonePushError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false
  }
  const statusCode = (error as { statusCode?: number }).statusCode
  return statusCode === 404 || statusCode === 410
}

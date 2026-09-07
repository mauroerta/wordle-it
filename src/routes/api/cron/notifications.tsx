import { createFileRoute } from "@tanstack/react-router"
import { createNotificationDispatch } from "../../../notification/dispatch"

export const Route = createFileRoute("/api/cron/notifications")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        if (!cronAuthorized(request)) {
          return Response.json({ error: "unauthorized" }, { status: 401 })
        }
        const { getDb } = await import("../../../db/db")
        const result = await createNotificationDispatch({
          db: getDb(),
        }).run()
        return Response.json(result)
      },
    },
  },
})

function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return false
  }
  const header = request.headers.get("authorization")
  return header === `Bearer ${secret}`
}

import {
  defineRailway,
  fn,
  github,
  postgres,
  preserve,
  project,
  service,
} from "railway/iac"

export default defineRailway((ctx) => {
  const db = postgres("postgres")
  const source = github("mauroerta/wordle-it", { branch: "main" })

  const web = service("parle", {
    source,
    build: "pnpm build",
    start: "pnpm start",
    replicas: { "europe-west4-drams3a": 1 },
    // Custom domains cannot be registered via IaC; production already has this in the dashboard.
    ...(ctx.isEnvironment("production")
      ? { domains: ["parole.mauroerta.me"] as const }
      : {}),
    env: {
      DATABASE_URL: db.env.DATABASE_URL,
      WORKOS_CLIENT_ID: preserve(),
      WORKOS_API_KEY: preserve(),
      WORKOS_COOKIE_PASSWORD: preserve(),
      WORKOS_REDIRECT_URI: preserve(),
      VAPID_PUBLIC_KEY: preserve(),
      VAPID_PRIVATE_KEY: preserve(),
      VAPID_SUBJECT: preserve(),
      CRON_SECRET: preserve(),
    },
  })

  // Hourly UTC; dispatch picks Europe/Rome midnight and 23:00 (DST-safe).
  // Set PARLE_URL to the public https origin of `parle` in each environment.
  const notificationsCron = fn("notifications-cron", {
    source,
    build: "echo ok",
    start: "node scripts/dispatch-notifications.mjs",
    deploy: { cronSchedule: "5 * * * *" },
    env: {
      PARLE_URL: preserve(),
      CRON_SECRET: preserve(),
    },
  })

  return project("parle", {
    resources: [db, web, notificationsCron],
    environments: ["staging", "production"],
  })
})

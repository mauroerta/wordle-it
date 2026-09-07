const url = process.env.PARLE_URL
const secret = process.env.CRON_SECRET

if (!url || !secret) {
  console.error("PARLE_URL and CRON_SECRET are required")
  process.exit(1)
}

const target = new URL("/api/cron/notifications", url)
const response = await fetch(target, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
})

if (!response.ok) {
  const body = await response.text()
  console.error(`dispatch failed: ${response.status} ${body}`)
  process.exit(1)
}

console.log(await response.text())

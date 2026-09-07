const CACHE = "parle-v3"

const PRECACHE = [
  "/",
  "/manifest.json",
  "/parle_logo_192x192.png",
  "/parle_logo_512x512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("push", (event) => {
  event.waitUntil(showPushNotification(event))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(openParle())
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") {
    return
  }
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) {
    return
  }
  // Leave Vite / Nitro module graph alone (dev and prod hashed entrypoints).
  if (isDevModule(url)) {
    return
  }
  if (url.pathname.startsWith("/api/")) {
    return
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirstAppShell(request, url.pathname === "/"))
    return
  }
  if (isStatic(url.pathname)) {
    event.respondWith(cacheFirst(request))
  }
})

function isDevModule(url) {
  if (url.searchParams.has("import")) {
    return true
  }
  const path = url.pathname
  return (
    path.startsWith("/src/") ||
    path.startsWith("/node_modules/") ||
    path.startsWith("/@") ||
    path.startsWith("/.vite/")
  )
}

async function showPushNotification(event) {
  let title = "Par🇮🇹le"
  let body = "Nuovo aggiornamento"
  if (event.data) {
    try {
      const payload = event.data.json()
      if (typeof payload.title === "string") {
        title = payload.title
      }
      if (typeof payload.body === "string") {
        body = payload.body
      }
    } catch {
      body = event.data.text()
    }
  }
  await self.registration.showNotification(title, {
    body,
    icon: "/parle_logo_192x192.png",
    badge: "/parle_logo_192x192.png",
    data: { url: "/" },
  })
}

async function openParle() {
  const url = "/"
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  })
  for (const client of windows) {
    if ("focus" in client) {
      await client.focus()
      if ("navigate" in client) {
        await client.navigate(url)
      }
      return
    }
  }
  await self.clients.openWindow(url)
}

function isStatic(pathname) {
  return /\.(?:js|css|png|ico|webp|woff2?|ttf|json|map)$/i.test(pathname)
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE)
    await cache.put(request, response.clone())
  }
  return response
}

async function networkFirstAppShell(request, isHome) {
  try {
    const response = await fetch(request)
    if (isHome && response.ok) {
      const cache = await caches.open(CACHE)
      await cache.put("/", response.clone())
    }
    return response
  } catch {
    const cached = await caches.match("/")
    if (cached) {
      return cached
    }
    throw new Error("offline")
  }
}

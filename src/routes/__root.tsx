import type { ReactNode } from "react"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { getAuth } from "@workos/authkit-tanstack-react-start"
import { workosConfigured } from "../auth/workos-configured"

import appCss from "../styles.css?url"
import parleCss from "../parle/parle.css?url"

export const Route = createRootRoute({
  ssr: true,
  loader: async () => {
    if (!workosConfigured()) {
      return { accountEmail: null as string | null, accountEnabled: false }
    }
    const auth = await getAuth()
    return {
      accountEmail: auth.user?.email ?? null,
      accountEnabled: true,
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, user-scalable=no",
      },
      {
        title: "Par🇮🇹le - Un gioco di parole al giorno (Wordle in italiano)",
      },
      {
        name: "description",
        content:
          "Indovina la parola nascosta in 6 tentativi. Un nuovo puzzle ogni giorno.",
      },
      { name: "theme-color", content: "#6aaa64" },
      {
        property: "og:title",
        content: "Par🇮🇹le - Un gioco di parole al giorno (Wordle in italiano)",
      },
      {
        property: "og:description",
        content:
          "Indovina la parola nascosta in 6 tentativi. Un nuovo puzzle ogni giorno.",
      },
      { property: "og:image", content: "/parle_og_1200x630.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: parleCss },
      { rel: "icon", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/parle_logo_192x192.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="parle">
      <header className="parle-header">
        <div className="parle-title">PAR🇮🇹LE</div>
      </header>
      <p className="parle-not-found">Pagina non trovata</p>
    </div>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

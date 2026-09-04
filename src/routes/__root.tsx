import type { ReactNode } from "react"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { loadViewer } from "../auth/viewer"
import { THEME_BOOT_SCRIPT } from "../theme/theme-boot"

import appCss from "../styles.css?url"
import parleCss from "../parle/parle.css?url"

export const Route = createRootRoute({
  ssr: true,
  // Who is signed in is route context: guards read it in beforeLoad.
  beforeLoad: () => loadViewer(),
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
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Parle" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
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
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/parle_logo_32x32.png",
      },
      { rel: "apple-touch-icon", href: "/parle_logo_192x192.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
    // SW caches hashed assets; skip in Vite or a refresh serves yesterday's board.
    scripts: import.meta.env.PROD
      ? [
          {
            children:
              "if('serviceWorker'in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})",
          },
        ]
      : [],
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
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {children}
        <Scripts />
      </body>
    </html>
  )
}

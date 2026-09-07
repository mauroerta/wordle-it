import type { Plugin } from "vite"
import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    patchSecFetchDest(),
    nitro(),
  ],
})

export default config

// Nitro intercepts module requests when Sec-Fetch-Dest is missing (SW refetch,
// some browsers, curl) and returns HTML 404. Mark them as scripts for Vite.
function patchSecFetchDest(): Plugin {
  return {
    name: "patch-sec-fetch-dest",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.headers["sec-fetch-dest"] || !req.url) {
          next()
          return
        }
        if (
          req.url.includes("?import") ||
          /\.[mc]?[jt]sx?(\?|$)/.test(req.url) ||
          /\.css(\?|$)/.test(req.url) ||
          /\.json(\?|$)/.test(req.url)
        ) {
          req.headers["sec-fetch-dest"] = "script"
        }
        next()
      })
    },
  }
}

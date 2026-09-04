import { createServerFn } from "@tanstack/react-start"
import { getAuth } from "@workos/authkit-tanstack-react-start"
import { workosConfigured } from "./workos-configured"

export type Viewer = {
  accountEmail: string | null
  accountEnabled: boolean
}

// Server function: root beforeLoad re-runs in the browser on every client
// navigation, where WORKOS_* env vars are absent and the session cookie is
// only readable by the server.
export const loadViewer = createServerFn({ method: "GET" }).handler(
  async (): Promise<Viewer> => {
    if (!workosConfigured()) {
      return { accountEmail: null, accountEnabled: false }
    }
    const auth = await getAuth()
    return { accountEmail: auth.user?.email ?? null, accountEnabled: true }
  }
)

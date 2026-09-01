import { createFileRoute } from "@tanstack/react-router"
import { getSignInUrl } from "@workos/authkit-tanstack-react-start"

export const Route = createFileRoute("/api/auth/sign-in")({
  server: {
    handlers: {
      GET: async () => {
        const url = await getSignInUrl()
        return new Response(null, {
          status: 307,
          headers: { Location: url },
        })
      },
    },
  },
})

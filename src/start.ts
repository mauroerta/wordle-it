import { createCsrfMiddleware, createStart } from "@tanstack/react-start"
import { authkitMiddleware } from "@workos/authkit-tanstack-react-start"
import { workosConfigured } from "./auth/workos-configured"

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
})

export const startInstance = createStart(() => ({
  requestMiddleware: workosConfigured()
    ? [csrfMiddleware, authkitMiddleware()]
    : [csrfMiddleware],
}))

import { createServerFn } from "@tanstack/react-start"
import { getRequestUrl } from "@tanstack/react-start/server"
import { asString, signedInGroups } from "../server"

export const listMyGroups = createServerFn({ method: "GET" }).handler(
  async () => {
    const { groups, accountId, today } = await signedInGroups()
    return groups.listHub({ accountId, today })
  }
)

export const myGroupTeasers = createServerFn({ method: "GET" }).handler(
  async () => {
    const { groups, accountId, today } = await signedInGroups()
    return groups.teasers({ accountId, today })
  }
)

export const loadGroupPage = createServerFn({ method: "GET" })
  .validator((data: unknown) => ({ slug: asString(data, "slug") }))
  .handler(async ({ data }) => {
    const { groups, accountId, today } = await signedInGroups()
    const page = await groups.page({ slug: data.slug, accountId, today })
    // Static import, handler-only: Start strips it from the client bundle.
    // A dynamic import of this module breaks the Nitro SSR chunk (ssr_exports).
    // Behind Railway's proxy the public host and scheme are x-forwarded-*.
    const inviteOrigin = getRequestUrl({
      xForwardedHost: true,
      xForwardedProto: true,
    }).origin
    return { page, inviteOrigin }
  })

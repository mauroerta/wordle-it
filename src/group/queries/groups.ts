import { createServerFn } from "@tanstack/react-start"
import { asString, requestOrigin, signedInGroups } from "../server"

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
    const [page, inviteOrigin] = await Promise.all([
      groups.page({ slug: data.slug, accountId, today }),
      requestOrigin(),
    ])
    return { page, inviteOrigin }
  })

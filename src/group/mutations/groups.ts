import { createServerFn } from "@tanstack/react-start"
import { asString, signedInGroups } from "../server"

export const createGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ name: asString(data, "name") }))
  .handler(async ({ data }) => {
    const { groups, accountId } = await signedInGroups()
    return groups.create({ name: data.name, accountId })
  })

export const joinGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ token: asString(data, "token") }))
  .handler(async ({ data }) => {
    const { groups, accountId } = await signedInGroups()
    return groups.join({ token: data.token, accountId })
  })

export const leaveGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ slug: asString(data, "slug") }))
  .handler(async ({ data }) => {
    const { groups, accountId } = await signedInGroups()
    await groups.leave({ slug: data.slug, accountId })
  })

export const kickMember = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({
    slug: asString(data, "slug"),
    accountId: asString(data, "accountId"),
  }))
  .handler(async ({ data }) => {
    const { groups, accountId } = await signedInGroups()
    await groups.kick({
      slug: data.slug,
      ownerId: accountId,
      accountId: data.accountId,
    })
  })

export const pardonMember = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({
    slug: asString(data, "slug"),
    accountId: asString(data, "accountId"),
  }))
  .handler(async ({ data }) => {
    const { groups, accountId } = await signedInGroups()
    await groups.pardon({
      slug: data.slug,
      ownerId: accountId,
      accountId: data.accountId,
    })
  })

export const rotateGroupInvite = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ slug: asString(data, "slug") }))
  .handler(async ({ data }) => {
    const { groups, accountId } = await signedInGroups()
    return {
      inviteToken: await groups.rotateInvite({
        slug: data.slug,
        accountId,
      }),
    }
  })

export const renameGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({
    slug: asString(data, "slug"),
    name: asString(data, "name"),
  }))
  .handler(async ({ data }) => {
    const { groups, accountId } = await signedInGroups()
    await groups.rename({ slug: data.slug, accountId, name: data.name })
  })

export const deleteGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ slug: asString(data, "slug") }))
  .handler(async ({ data }) => {
    const { groups, accountId } = await signedInGroups()
    await groups.remove({ slug: data.slug, accountId })
  })

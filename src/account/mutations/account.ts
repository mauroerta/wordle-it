import { createServerFn } from "@tanstack/react-start"
import { deleteCookie } from "@tanstack/react-start/server"
import { getAuth } from "@workos/authkit-tanstack-react-start"

export const deleteAccount = createServerFn({ method: "POST" }).handler(
  async () => {
    const auth = await getAuth()
    if (!auth.user) {
      throw new Error("not signed in")
    }

    const { getDb } = await import("../../db/db")
    const { removeAccountData } = await import("../remove")
    await removeAccountData({ db: getDb(), accountId: auth.user.id })

    const { NotFoundException, WorkOS } = await import("@workos-inc/node")
    const workos = new WorkOS(process.env.WORKOS_API_KEY)
    try {
      await workos.userManagement.deleteUser(auth.user.id)
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error
      }
    }

    deleteCookie(process.env.WORKOS_COOKIE_NAME ?? "wos-session", {
      path: "/",
      domain: process.env.WORKOS_COOKIE_DOMAIN || undefined,
    })
  }
)

import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router"
import { PageChrome } from "../../../chrome/page-chrome"
import { joinGroup } from "../../../group/mutations/groups"

export const Route = createFileRoute("/_authed/invite/$token")({
  loader: async ({ params }) => {
    try {
      const { slug } = await joinGroup({ data: { token: params.token } })
      throw redirect({ to: "/groups/$slug", params: { slug } })
    } catch (error) {
      if (isRedirect(error)) {
        throw error
      }
      return {
        error: error instanceof Error ? error.message : "Invito non valido",
      }
    }
  },
  component: InviteJoin,
})

function InviteJoin() {
  const data = Route.useLoaderData()
  return (
    <PageChrome heading="Invito" back={{ to: "/groups", label: "Gruppi" }}>
      <p className="parle-groups-error">{data.error}</p>
    </PageChrome>
  )
}

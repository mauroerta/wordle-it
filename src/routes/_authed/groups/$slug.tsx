import { createFileRoute, notFound } from "@tanstack/react-router"
import { GroupDetailPage } from "../../../group/components/page"
import { signInRequired } from "../../../group/error"
import { loadGroupPage } from "../../../group/queries/groups"

export const Route = createFileRoute("/_authed/groups/$slug")({
  loader: async ({ params }) => {
    try {
      return await loadGroupPage({ data: { slug: params.slug } })
    } catch (error) {
      if (signInRequired(error)) {
        throw error
      }
      throw notFound()
    }
  },
  component: GroupSlug,
})

function GroupSlug() {
  const { page, inviteOrigin } = Route.useLoaderData()
  return <GroupDetailPage page={page} inviteOrigin={inviteOrigin} />
}

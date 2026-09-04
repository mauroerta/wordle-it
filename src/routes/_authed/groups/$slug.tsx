import { createFileRoute, notFound } from "@tanstack/react-router"
import { PageChrome } from "../../../chrome/page-chrome"
import { GroupDetailPage } from "../../../group/components/page"
import { groupMissing, signInRequired } from "../../../group/error"
import { loadGroupPage } from "../../../group/queries/groups"

export const Route = createFileRoute("/_authed/groups/$slug")({
  loader: async ({ params }) => {
    try {
      return await loadGroupPage({ data: { slug: params.slug } })
    } catch (error) {
      if (signInRequired(error)) {
        throw error
      }
      if (groupMissing(error)) {
        throw notFound()
      }
      throw error
    }
  },
  errorComponent: GroupPageError,
  component: GroupSlug,
})

function GroupPageError({ error }: { error: Error }) {
  return (
    <PageChrome heading="Gruppo" back={{ to: "/groups", label: "Gruppi" }}>
      <p className="parle-groups-error">{error.message}</p>
    </PageChrome>
  )
}

function GroupSlug() {
  const { page, inviteOrigin } = Route.useLoaderData()
  return <GroupDetailPage page={page} inviteOrigin={inviteOrigin} />
}

import { createFileRoute } from "@tanstack/react-router"
import { GroupHubPage } from "../../../group/components/hub-page"
import { listMyGroups } from "../../../group/queries/groups"

export const Route = createFileRoute("/_authed/groups/")({
  loader: async () => ({ rows: await listMyGroups() }),
  component: GroupsIndex,
})

function GroupsIndex() {
  const { rows } = Route.useLoaderData()
  return <GroupHubPage rows={rows} />
}

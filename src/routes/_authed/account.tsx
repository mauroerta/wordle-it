import { createFileRoute } from "@tanstack/react-router"
import { AccountPage } from "../../account/components/page"

export const Route = createFileRoute("/_authed/account")({
  component: AccountRoute,
})

function AccountRoute() {
  const { accountEmail } = Route.useRouteContext()
  return <AccountPage accountEmail={accountEmail!} />
}

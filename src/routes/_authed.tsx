import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { signInHref } from "../player/sign-in"

// Pathless layout: everything under it needs an Account. Server functions
// still check auth themselves; this only makes the redirect happen early.
export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    if (!context.accountEmail) {
      throw redirect({
        href: signInHref(location.pathname),
        reloadDocument: true,
      })
    }
  },
  component: Outlet,
})

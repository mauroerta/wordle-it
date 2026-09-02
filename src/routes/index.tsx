import { createFileRoute, getRouteApi } from "@tanstack/react-router"
import { ParleGame } from "../parle/parle-game"
import { createPlayer, createServerAccount } from "../player/player"

const rootRoute = getRouteApi("__root__")

export const Route = createFileRoute("/")({
  ssr: false,
  loader: async ({ parentMatchPromise }) => {
    const parent = await parentMatchPromise
    const accountEmail = parent.loaderData?.accountEmail
    if (!accountEmail) {
      return
    }
    const player = createPlayer({
      storage: window.localStorage,
      account: createServerAccount(),
    })
    await player.onSignIn()
  },
  component: App,
})

function App() {
  const { accountEmail, accountEnabled } = rootRoute.useLoaderData()
  return (
    <ParleGame accountEmail={accountEmail} accountEnabled={accountEnabled} />
  )
}

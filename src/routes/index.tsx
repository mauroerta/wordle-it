import { createFileRoute } from "@tanstack/react-router"
import { ParleGame } from "../parle/parle-game"
import { createPlayer, createServerAccount } from "../player/player"

// The board is device state (guest Plays in localStorage), so it stays client-only.
export const Route = createFileRoute("/")({
  ssr: false,
  loader: async ({ context }) => {
    if (!context.accountEmail) {
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
  const { accountEmail, accountEnabled } = Route.useRouteContext()
  return (
    <ParleGame accountEmail={accountEmail} accountEnabled={accountEnabled} />
  )
}

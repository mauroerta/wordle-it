import { createFileRoute, getRouteApi } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { ParleGame } from "../parle/parle-game"

const rootRoute = getRouteApi("__root__")

export const Route = createFileRoute("/")({ component: App })

function App() {
  const { accountEmail, accountEnabled } = rootRoute.useLoaderData()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  if (!ready) {
    return null
  }
  return (
    <ParleGame accountEmail={accountEmail} accountEnabled={accountEnabled} />
  )
}

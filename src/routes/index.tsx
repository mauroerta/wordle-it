import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { ParleGame } from "../parle/parle-game"

export const Route = createFileRoute("/")({ component: App })

function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  if (!ready) {
    return null
  }
  return <ParleGame />
}

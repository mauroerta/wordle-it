import { createFileRoute } from "@tanstack/react-router"
import { CreditsPage } from "../parle/components/credits-page"

export const Route = createFileRoute("/credits")({
  component: CreditsPage,
})

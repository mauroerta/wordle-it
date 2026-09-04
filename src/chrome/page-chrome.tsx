import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"

export type BackLink = { to: "/" | "/groups"; label: string }

// Header and scrolling body for every page that is not the game itself.
// Theme classes come from THEME_BOOT_SCRIPT in the root document.
export function PageChrome({
  heading,
  back,
  children,
}: {
  heading: string
  back: BackLink
  children: ReactNode
}) {
  return (
    <div className="parle parle-screen">
      <header className="parle-header">
        <div className="parle-menu">
          <Link to={back.to} className="parle-back">
            <BackIcon />
            <span>{back.label}</span>
          </Link>
        </div>
        <Link to="/" className="parle-title">
          PAR🇮🇹LE
        </Link>
        <div className="parle-menu" />
      </header>
      <div className="parle-screen-body">
        <h1>{heading}</h1>
        {children}
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path
        fill="var(--color-tone-3)"
        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
      />
    </svg>
  )
}

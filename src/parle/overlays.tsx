import type { ReactNode } from "react"
import { GameIcon } from "./game-icon"

export function PageOverlay({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="parle-page-overlay">
      <div className="parle-page">
        <header className="parle-page-header">
          <h1>{title}</h1>
          <button className="parle-page-close" type="button" onClick={onClose}>
            <GameIcon name="close" />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}

export function ModalOverlay({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="parle-modal-overlay" onClick={onClose}>
      <div className="parle-modal" onClick={(event) => event.stopPropagation()}>
        {children}
        <button className="parle-modal-close" type="button" onClick={onClose}>
          <GameIcon name="close" />
        </button>
      </div>
    </div>
  )
}

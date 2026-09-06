import { useLayoutEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import {
  Dialog,
  DialogClose,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog"
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
    <ParleDialog kind="page" disablePointerDismissal onClose={onClose}>
      <header className="parle-page-header">
        <DialogTitle render={<h1 />}>{title}</DialogTitle>
        <DialogClose className="parle-page-close">
          <GameIcon name="close" />
          <span className="sr-only">Chiudi</span>
        </DialogClose>
      </header>
      {children}
    </ParleDialog>
  )
}

export function ModalOverlay({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <ParleDialog kind="modal" onClose={onClose}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      {children}
      <DialogClose className="parle-modal-close">
        <GameIcon name="close" />
        <span className="sr-only">Chiudi</span>
      </DialogClose>
    </ParleDialog>
  )
}

function ParleDialog({
  kind,
  children,
  disablePointerDismissal,
  onClose,
}: {
  kind: "page" | "modal"
  children: ReactNode
  disablePointerDismissal?: boolean
  onClose: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setContainer(hostRef.current?.closest(".parle") ?? null)
  }, [])

  return (
    <>
      <div ref={hostRef} hidden />
      {container ? (
        <Dialog
          open
          disablePointerDismissal={disablePointerDismissal}
          onOpenChange={(next) => {
            if (!next) {
              onClose()
            }
          }}
        >
          <DialogPortal container={container}>
            {kind === "modal" ? (
              <DialogPrimitive.Backdrop className="parle-modal-overlay" />
            ) : null}
            <DialogPrimitive.Popup
              className={
                kind === "page" ? "parle-page-overlay" : "parle-modal-layer"
              }
            >
              <div className={kind === "page" ? "parle-page" : "parle-modal"}>
                {children}
              </div>
            </DialogPrimitive.Popup>
          </DialogPortal>
        </Dialog>
      ) : null}
    </>
  )
}

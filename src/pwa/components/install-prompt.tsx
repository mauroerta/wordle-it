import { DownloadIcon, ShareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PwaInstallController } from "../hooks/use-pwa-install"

export function InstallPrompt({ install }: { install: PwaInstallController }) {
  const isIos = install.kind === "ios"
  const showNativeInstall = install.nativeAvailable

  return (
    <Dialog
      open={install.open}
      onOpenChange={(next) => {
        if (!next) {
          install.dismissPrompt()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Installa Parle</DialogTitle>
          <DialogDescription>{descriptionFor(install)}</DialogDescription>
        </DialogHeader>
        {isIos ? <IosSteps /> : null}
        {!isIos && !showNativeInstall ? <BrowserSteps /> : null}
        <DialogFooter>
          <Button variant="outline" onClick={install.dismissPrompt}>
            Non ora
          </Button>
          {showNativeInstall ? (
            <Button
              onClick={() => {
                void install.install()
              }}
            >
              <DownloadIcon data-icon="inline-start" />
              Installa
            </Button>
          ) : (
            <Button onClick={install.dismissPrompt}>Ho capito</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function descriptionFor(install: PwaInstallController): string {
  if (install.kind === "ios") {
    return "Aggiungi Parle alla schermata Home per aprirlo come un'app, anche senza connessione."
  }
  if (install.nativeAvailable) {
    return "Installa Parle sul dispositivo: icona sulla Home, avvio a tutto schermo."
  }
  return "Aggiungi Parle dalla barra del browser per aprirlo come un'app."
}

function IosSteps() {
  return (
    <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
      <li className="flex items-start gap-2">
        <span className="font-medium text-foreground">1.</span>
        <span className="flex items-center gap-1.5">
          Tocca
          <ShareIcon aria-hidden className="size-4 text-foreground" />
          Condividi nella barra di Safari
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="font-medium text-foreground">2.</span>
        <span>
          Scorri e scegli{" "}
          <strong className="text-foreground">Aggiungi a Home</strong>
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="font-medium text-foreground">3.</span>
        <span>
          Conferma con <strong className="text-foreground">Aggiungi</strong>
        </span>
      </li>
    </ol>
  )
}

function BrowserSteps() {
  return (
    <p className="text-sm text-muted-foreground">
      Apri il menu del browser e scegli{" "}
      <strong className="text-foreground">Installa app</strong> o{" "}
      <strong className="text-foreground">Aggiungi a schermata Home</strong>.
    </p>
  )
}

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { PageChrome } from "../../chrome/page-chrome"
import { useNotificationSettings } from "../../notification/hooks/use-notification-settings"
import { createPlayer } from "../../player/player"
import { deleteAccount } from "../mutations/account"
import {
  ParleSwitch,
  SettingRow,
  SettingSection,
} from "../../parle/components/setting-controls"

export function AccountPage({ accountEmail }: { accountEmail: string }) {
  const notifications = useNotificationSettings({ signedIn: true })
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  function onSignOut() {
    createPlayer({ storage: window.localStorage }).onSignOut()
    window.location.href = "/api/auth/sign-out"
  }

  async function onDeleteAccount() {
    setDeleting(true)
    setDeleteError(false)
    try {
      await deleteAccount()
      createPlayer({ storage: window.localStorage }).onSignOut()
      window.location.href = "/"
    } catch {
      setDeleteError(true)
      setDeleting(false)
    }
  }

  return (
    <PageChrome heading="Account" back={{ to: "/", label: "Gioco" }}>
      <div className="parle-settings">
        <SettingSection>
          <SettingRow title="Account" description={accountEmail}>
            <button
              type="button"
              className="parle-account-action"
              onClick={onSignOut}
            >
              Esci
            </button>
          </SettingRow>
        </SettingSection>
        <SettingSection>
          <SettingRow
            title="Notifiche"
            description={
              !notifications.available
                ? "Non disponibili su questo ambiente"
                : notifications.error
                  ? notifications.error
                  : "Promemoria sul Puzzle di oggi"
            }
          >
            <ParleSwitch
              checked={notifications.prefs.enabled}
              disabled={
                !notifications.ready ||
                !notifications.available ||
                notifications.busy
              }
              label="Notifiche"
              onCheckedChange={notifications.setEnabled}
            />
          </SettingRow>
          <SettingRow
            title="Nuova parola a mezzanotte"
            description="Alle 00:00 Europe/Rome"
          >
            <ParleSwitch
              checked={notifications.prefs.newPuzzle}
              disabled={
                !notifications.ready ||
                !notifications.available ||
                !notifications.prefs.enabled ||
                notifications.busy
              }
              label="Nuova parola a mezzanotte"
              onCheckedChange={notifications.setNewPuzzle}
            />
          </SettingRow>
          <SettingRow
            title="Promemoria alle 23"
            description="Se non hai finito il Puzzle di oggi"
          >
            <ParleSwitch
              checked={notifications.prefs.hurryUp}
              disabled={
                !notifications.ready ||
                !notifications.available ||
                !notifications.prefs.enabled ||
                notifications.busy
              }
              label="Promemoria alle 23"
              onCheckedChange={notifications.setHurryUp}
            />
          </SettingRow>
        </SettingSection>
        <SettingSection title="Zona pericolosa" danger>
          <SettingRow
            title="Elimina account"
            description="Elimina definitivamente i tuoi dati da Par🇮🇹le"
          >
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="destructive">Elimina</Button>}
                onClick={() => setDeleteError(false)}
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminare il tuo account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Partite, statistiche, notifiche e appartenenze ai gruppi
                    verranno eliminate definitivamente. Questa azione non può
                    essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {deleteError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Non è stato possibile eliminare l’account. Riprova.
                    </AlertDescription>
                  </Alert>
                ) : null}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>
                    Annulla
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={deleting}
                    onClick={(event) => {
                      event.preventDefault()
                      void onDeleteAccount()
                    }}
                  >
                    {deleting ? (
                      <>
                        <Spinner data-icon="inline-start" />
                        Eliminazione…
                      </>
                    ) : (
                      "Elimina account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SettingRow>
        </SettingSection>
      </div>
    </PageChrome>
  )
}

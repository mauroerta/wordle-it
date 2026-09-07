import { PageChrome } from "../../chrome/page-chrome"
import { useNotificationSettings } from "../../notification/hooks/use-notification-settings"
import { createPlayer } from "../../player/player"
import {
  ParleSwitch,
  SettingRow,
  SettingSection,
} from "../../parle/components/setting-controls"

export function AccountPage({ accountEmail }: { accountEmail: string }) {
  const notifications = useNotificationSettings({ signedIn: true })

  function onSignOut() {
    createPlayer({ storage: window.localStorage }).onSignOut()
    window.location.href = "/api/auth/sign-out"
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
      </div>
    </PageChrome>
  )
}

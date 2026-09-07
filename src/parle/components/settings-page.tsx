import { Link } from "@tanstack/react-router"
import { REPO_URL, X_URL } from "./credits-page"
import { ParleSwitch, SettingRow, SettingSection } from "./setting-controls"

export function SettingsPage({
  hardMode,
  hardModeLocked,
  nightmode,
  colorblind,
  dayOffset,
  accountEmail,
  accountEnabled,
  canInstallApp,
  onHardMode,
  onNightmode,
  onColorblind,
  onInstallApp,
}: {
  hardMode: boolean
  hardModeLocked: boolean
  nightmode: boolean
  colorblind: boolean
  dayOffset: number
  accountEmail: string | null
  accountEnabled: boolean
  canInstallApp: boolean
  onHardMode: (checked: boolean) => void
  onNightmode: (checked: boolean) => void
  onColorblind: (checked: boolean) => void
  onInstallApp: () => void
}) {
  return (
    <div className="parle-settings">
      <SettingSection>
        <SettingRow
          title="Il gioco si fa duro"
          description="Ogni lettera nota deve essere usata nei tentativi successivi"
        >
          <ParleSwitch
            checked={hardMode}
            disabled={hardModeLocked}
            label="Il gioco si fa duro"
            onCheckedChange={onHardMode}
          />
        </SettingRow>
        <SettingRow title="Tema nero">
          <ParleSwitch
            checked={nightmode}
            label="Tema nero"
            onCheckedChange={onNightmode}
          />
        </SettingRow>
        <SettingRow title="Colori ad alto contrasto">
          <ParleSwitch
            checked={colorblind}
            label="Colori ad alto contrasto"
            onCheckedChange={onColorblind}
          />
        </SettingRow>
        {canInstallApp ? (
          <SettingRow
            title="Installa l'app"
            description="Aggiungi Parle alla schermata Home"
          >
            <button
              type="button"
              className="parle-account-action"
              onClick={onInstallApp}
            >
              Apri
            </button>
          </SettingRow>
        ) : null}
      </SettingSection>
      {accountEnabled ? (
        <SettingSection>
          <SettingRow title="Account" description={accountEmail ?? undefined}>
            {accountEmail ? (
              <Link to="/account" className="parle-account-action">
                Apri
              </Link>
            ) : (
              <a href="/api/auth/sign-in" className="parle-account-action">
                Accedi
              </a>
            )}
          </SettingRow>
          <SettingRow
            title="Gruppi"
            description={
              accountEmail
                ? undefined
                : "Accedi per creare o unirti a un gruppo"
            }
          >
            {accountEmail ? (
              <Link to="/groups" className="parle-account-action">
                Apri
              </Link>
            ) : (
              <a
                href="/api/auth/sign-in?returnPathname=%2Fgroups"
                className="parle-account-action"
              >
                Accedi
              </a>
            )}
          </SettingRow>
        </SettingSection>
      ) : null}
      <SettingSection>
        <div className="parle-setting">
          <div className="parle-setting-title">Feedback</div>
          <div>
            <a href={`${REPO_URL}/issues/new`} target="_blank" rel="noreferrer">
              GitHub
            </a>
            {" | "}
            <a href={X_URL} target="_blank" rel="noreferrer">
              X
            </a>
          </div>
        </div>
        <SettingRow title="Crediti">
          <Link to="/credits" className="parle-account-action">
            Apri
          </Link>
        </SettingRow>
      </SettingSection>
      <div className="parle-footnote">
        <div>#{dayOffset}</div>
        <div>parle v220317</div>
      </div>
    </div>
  )
}

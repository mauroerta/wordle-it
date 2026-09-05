import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { REPO_URL, X_URL } from "./credits-page"

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
  onSignOut,
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
  onSignOut: () => void
  onInstallApp: () => void
}) {
  return (
    <div className="parle-settings">
      <section>
        <SettingRow
          title="Il gioco si fa duro"
          description="Ogni lettera nota deve essere usata nei tentativi successivi"
        >
          <Switch
            checked={hardMode}
            disabled={hardModeLocked}
            onChange={onHardMode}
          />
        </SettingRow>
        <SettingRow title="Tema nero">
          <Switch checked={nightmode} onChange={onNightmode} />
        </SettingRow>
        <SettingRow title="Colori ad alto contrasto">
          <Switch checked={colorblind} onChange={onColorblind} />
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
      </section>
      {accountEnabled ? (
        <section>
          <SettingRow title="Account" description={accountEmail ?? undefined}>
            {accountEmail ? (
              <button
                type="button"
                className="parle-account-action"
                onClick={onSignOut}
              >
                Esci
              </button>
            ) : (
              <a className="parle-account-action" href="/api/auth/sign-in">
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
              <Link className="parle-account-action" to="/groups">
                Apri
              </Link>
            ) : (
              <a
                className="parle-account-action"
                href="/api/auth/sign-in?returnPathname=%2Fgroups"
              >
                Accedi
              </a>
            )}
          </SettingRow>
        </section>
      ) : null}
      <section>
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
          <Link className="parle-account-action" to="/credits">
            Apri
          </Link>
        </SettingRow>
      </section>
      <div className="parle-footnote">
        <div>#{dayOffset}</div>
        <div>parle v220317</div>
      </div>
    </div>
  )
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="parle-setting">
      <div>
        <div className="parle-setting-title">{title}</div>
        {description ? (
          <div className="parle-setting-description">{description}</div>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function Switch({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      className="parle-switch"
      data-checked={checked ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      onClick={() => onChange(!checked)}
    >
      <span className="parle-switch-knob" />
    </button>
  )
}

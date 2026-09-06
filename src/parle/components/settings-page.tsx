import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field"
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
        <FieldGroup className="gap-0">
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
        </FieldGroup>
      </section>
      {accountEnabled ? (
        <section>
          <FieldGroup className="gap-0">
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
          </FieldGroup>
        </section>
      ) : null}
      <section>
        <FieldGroup className="gap-0">
          <div className="parle-setting">
            <div className="parle-setting-title">Feedback</div>
            <div>
              <a
                href={`${REPO_URL}/issues/new`}
                target="_blank"
                rel="noreferrer"
              >
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
        </FieldGroup>
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
    <Field orientation="horizontal" className="parle-setting">
      <FieldContent>
        <FieldTitle className="parle-setting-title">{title}</FieldTitle>
        {description ? (
          <FieldDescription className="parle-setting-description">
            {description}
          </FieldDescription>
        ) : null}
      </FieldContent>
      {children}
    </Field>
  )
}

function ParleSwitch({
  checked,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className="parle-switch"
      data-checked={checked ? "" : undefined}
      onClick={() => {
        if (!disabled) {
          onCheckedChange(!checked)
        }
      }}
    >
      <span className="parle-switch-knob" />
    </button>
  )
}

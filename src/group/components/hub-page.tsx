import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { tokenFromInviteInput } from "../invite"
import { createGroup, joinGroup } from "../mutations/groups"
import type { GroupHubRow } from "../store"
import { PageChrome } from "../../chrome/page-chrome"

export function GroupHubPage({ rows }: { rows: GroupHubRow[] }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [invite, setInvite] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      const { slug } = await createGroup({ data: { name } })
      await router.navigate({ to: "/groups/$slug", params: { slug } })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Errore")
    }
  }

  async function onJoin(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      const { slug } = await joinGroup({
        data: { token: tokenFromInviteInput(invite) },
      })
      await router.navigate({ to: "/groups/$slug", params: { slug } })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Errore")
    }
  }

  return (
    <PageChrome heading="Gruppi" back={{ to: "/", label: "Gioco" }}>
      {error ? (
        <Alert className="parle-groups-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {rows.length === 0 ? (
        <Empty className="parle-groups-empty">
          <EmptyHeader>
            <EmptyDescription>
              Nessun gruppo. Creane uno o unisciti con un invito.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="parle-groups-list">
          {rows.map((row) => (
            <li key={row.slug}>
              <Link
                to="/groups/$slug"
                params={{ slug: row.slug }}
                className="parle-groups-row"
              >
                <span className="parle-groups-row-name">
                  {row.name}
                  {row.isOwner ? (
                    <span className="parle-groups-meta"> · Proprietario</span>
                  ) : null}
                  <span className="parle-groups-meta">
                    {" "}
                    · {row.memberCount}{" "}
                    {row.memberCount === 1 ? "membro" : "membri"}
                  </span>
                </span>
                <span className="parle-groups-row-place">
                  Vinte di fila · {row.streakPlace}°/{row.streakMemberCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <form
        className="parle-groups-form"
        onSubmit={(event) => void onCreate(event)}
      >
        <FieldGroup className="gap-2">
          <Field>
            <FieldLabel className="parle-setting-title" htmlFor="group-name">
              Crea un gruppo
            </FieldLabel>
            <Input
              id="group-name"
              className="parle-text-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome"
              maxLength={48}
            />
          </Field>
          <button className="parle-groups-button" type="submit">
            Crea
          </button>
        </FieldGroup>
      </form>
      <form
        className="parle-groups-form"
        onSubmit={(event) => void onJoin(event)}
      >
        <FieldGroup className="gap-2">
          <Field>
            <FieldLabel className="parle-setting-title" htmlFor="group-invite">
              Unisciti con un invito
            </FieldLabel>
            <Input
              id="group-invite"
              className="parle-text-input"
              value={invite}
              onChange={(event) => setInvite(event.target.value)}
              placeholder="Incolla il link"
            />
          </Field>
          <button className="parle-groups-button" type="submit">
            Unisciti
          </button>
        </FieldGroup>
      </form>
    </PageChrome>
  )
}

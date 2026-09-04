import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useRouter } from "@tanstack/react-router"
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
      {error ? <p className="parle-groups-error">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="parle-groups-empty">
          Nessun gruppo. Creane uno o unisciti con un invito.
        </p>
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
        <div className="parle-setting-title">Crea un gruppo</div>
        <input
          className="parle-text-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome"
          maxLength={48}
        />
        <button className="parle-groups-button" type="submit">
          Crea
        </button>
      </form>
      <form
        className="parle-groups-form"
        onSubmit={(event) => void onJoin(event)}
      >
        <div className="parle-setting-title">Unisciti con un invito</div>
        <input
          className="parle-text-input"
          value={invite}
          onChange={(event) => setInvite(event.target.value)}
          placeholder="Incolla il link"
        />
        <button className="parle-groups-button" type="submit">
          Unisciti
        </button>
      </form>
    </PageChrome>
  )
}

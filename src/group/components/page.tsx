import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "@tanstack/react-router"
import { gameDayIndex } from "../../game-day/game-day"
import { shareOrCopy } from "../../share/share-or-copy"
import { invitePath } from "../invite"
import {
  deleteGroup,
  kickMember,
  leaveGroup,
  pardonMember,
  renameGroup,
  rotateGroupInvite,
} from "../mutations/groups"
import { formatPodiumValue, podiumLabel } from "../ranking/podium"
import type { PodiumMetric } from "../ranking/podium"
import { shareTodayText, sharePodiumText } from "../ranking/share"
import type { GroupPage } from "../store"
import { PageChrome } from "../../chrome/page-chrome"
import { ShareIcon } from "./icons"

export function GroupDetailPage({
  page,
  inviteOrigin,
}: {
  page: GroupPage
  inviteOrigin: string
}) {
  const router = useRouter()
  const [inviteToken, setInviteToken] = useState(page.inviteToken)
  const [name, setName] = useState(page.name)
  const [toast, setToast] = useState<string | null>(null)
  const inviteUrl = `${inviteOrigin}${invitePath(inviteToken)}`
  const dayOffset = gameDayIndex(new Date())

  function notice(text: string) {
    setToast(text)
    window.setTimeout(() => setToast(null), 2000)
  }

  // Server errors carry Italian copy; show it instead of a blank failure.
  async function attempt(action: () => Promise<void>) {
    try {
      await action()
    } catch (error) {
      notice(error instanceof Error ? error.message : "Errore")
    }
  }

  async function share({ text, copied }: { text: string; copied: string }) {
    try {
      if ((await shareOrCopy(text)) === "copied") {
        notice(copied)
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return
      }
      notice("Errore nella condivisione")
    }
  }

  function onShareToday() {
    return share({
      text: shareTodayText({
        groupName: page.name,
        dayOffset,
        rows: page.today,
      }),
      copied: "Risultati copiati",
    })
  }

  function onSharePodium(metric: PodiumMetric) {
    const block = page.podiums.find((podium) => podium.metric === metric)
    if (!block) {
      return
    }
    return share({
      text: sharePodiumText({ groupName: page.name, metric, rows: block.rows }),
      copied: "Risultati copiati",
    })
  }

  function onShareInvite() {
    return share({ text: inviteUrl, copied: "Link copiato" })
  }

  function onRotate() {
    if (
      !window.confirm("Il link attuale smetterà di funzionare. Continuare?")
    ) {
      return
    }
    return attempt(async () => {
      const next = await rotateGroupInvite({ data: { slug: page.slug } })
      setInviteToken(next.inviteToken)
      notice("Nuovo link")
    })
  }

  function onRename(event: FormEvent) {
    event.preventDefault()
    return attempt(async () => {
      await renameGroup({ data: { slug: page.slug, name } })
      await router.invalidate()
    })
  }

  function onLeave() {
    if (!window.confirm("Uscire da questo gruppo?")) {
      return
    }
    return attempt(async () => {
      await leaveGroup({ data: { slug: page.slug } })
      await router.navigate({ to: "/groups" })
    })
  }

  function onDelete() {
    if (!window.confirm("Eliminare questo gruppo?")) {
      return
    }
    return attempt(async () => {
      await deleteGroup({ data: { slug: page.slug } })
      await router.navigate({ to: "/groups" })
    })
  }

  function onPardon(accountId: string) {
    return attempt(async () => {
      await pardonMember({ data: { slug: page.slug, accountId } })
      await router.invalidate()
    })
  }

  function onKick(accountId: string, memberName: string) {
    if (!window.confirm(`Escludere ${memberName} dal gruppo?`)) {
      return
    }
    return attempt(async () => {
      await kickMember({ data: { slug: page.slug, accountId } })
      await router.invalidate()
    })
  }

  return (
    <PageChrome heading={page.name} back={{ to: "/groups", label: "Gruppi" }}>
      {toast ? <p className="parle-groups-toast">{toast}</p> : null}
      <section className="parle-groups-section">
        <div className="parle-groups-section-head">
          <h1>Oggi</h1>
          <button
            className="parle-groups-share"
            type="button"
            aria-label="Condividi"
            title="Condividi"
            onClick={() => void onShareToday()}
          >
            <ShareIcon />
          </button>
        </div>
        <ol className="parle-rank-list">
          {page.today.map((row) => (
            <li
              key={row.accountId}
              className="parle-rank-row"
              data-self={
                row.accountId === page.viewerAccountId ? "true" : undefined
              }
            >
              <span className="parle-rank-place">{row.place}°</span>
              <span className="parle-rank-name">{row.name}</span>
              <span className="parle-rank-value">{row.attemptsLabel}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="parle-podiums">
        {page.podiums.map((block) => (
          <section className="parle-groups-section" key={block.metric}>
            <div className="parle-groups-section-head">
              <h1>{podiumLabel(block.metric)}</h1>
              <button
                className="parle-groups-share"
                type="button"
                aria-label="Condividi"
                title="Condividi"
                onClick={() => void onSharePodium(block.metric)}
              >
                <ShareIcon />
              </button>
            </div>
            <ol className="parle-rank-list">
              {block.rows.map((row) => (
                <li
                  key={row.accountId}
                  className="parle-rank-row"
                  data-self={
                    row.accountId === page.viewerAccountId ? "true" : undefined
                  }
                >
                  <span className="parle-rank-place">{row.place}°</span>
                  <span className="parle-rank-name">{row.name}</span>
                  <span className="parle-rank-value">
                    {formatPodiumValue({
                      metric: block.metric,
                      value: row.value,
                    })}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <section className="parle-groups-section">
        <h1>Membri</h1>
        <ul className="parle-rank-list">
          {page.members.map((member) => (
            <li key={member.accountId} className="parle-rank-row">
              <span className="parle-rank-name">
                {member.name}
                {member.role === "owner" ? (
                  <span className="parle-groups-meta"> · Proprietario</span>
                ) : null}
              </span>
              {page.isOwner && member.accountId !== page.viewerAccountId ? (
                <button
                  className="parle-account-action"
                  type="button"
                  onClick={() => void onKick(member.accountId, member.name)}
                >
                  Escludi
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      {page.isOwner && page.blocked.length > 0 ? (
        <section className="parle-groups-section">
          <h1>Esclusi</h1>
          <ul className="parle-rank-list">
            {page.blocked.map((member) => (
              <li key={member.accountId} className="parle-rank-row">
                <span className="parle-rank-name">{member.name}</span>
                <button
                  className="parle-account-action"
                  type="button"
                  onClick={() => void onPardon(member.accountId)}
                >
                  Riabilita
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="parle-groups-section">
        <h1>Invito</h1>
        <p className="parle-groups-invite">{inviteUrl}</p>
        <div className="parle-groups-actions">
          <button
            className="parle-groups-button"
            type="button"
            onClick={() => void onShareInvite()}
          >
            Condividi
          </button>
          {page.isOwner ? (
            <button
              className="parle-account-action"
              type="button"
              onClick={() => void onRotate()}
            >
              Nuovo link
            </button>
          ) : null}
        </div>
      </section>
      {page.isOwner ? (
        <form
          className="parle-groups-form"
          onSubmit={(event) => void onRename(event)}
        >
          <div className="parle-setting-title">Rinomina</div>
          <input
            className="parle-text-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={48}
          />
          <button className="parle-groups-button" type="submit">
            Salva
          </button>
        </form>
      ) : null}
      <div className="parle-groups-actions parle-groups-footer">
        <button
          className="parle-account-action"
          type="button"
          onClick={() => void onLeave()}
        >
          Esci dal gruppo
        </button>
        {page.isOwner ? (
          <button
            className="parle-account-action"
            type="button"
            onClick={() => void onDelete()}
          >
            Elimina gruppo
          </button>
        ) : null}
      </div>
    </PageChrome>
  )
}

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "@tanstack/react-router"
import { InfoIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover"
import { gameDayIndex } from "../../game-day/game-day"
import { shareOrCopy } from "../../share/share-or-copy"
import { invitePath } from "../invite"
import {
  deleteGroup,
  freezeGroupInvite,
  kickMember,
  leaveGroup,
  pardonMember,
  renameGroup,
  rotateGroupInvite,
} from "../mutations/groups"
import { formatPodiumValue, podiumLabel } from "../ranking/podium"
import type { PodiumMetric } from "../ranking/podium"
import { shareTodayText, sharePodiumText } from "../ranking/share"
import { todayMedal } from "../ranking/today"
import type { GroupPage } from "../store"
import { PageChrome } from "../../chrome/page-chrome"
import { ConfirmDialog } from "./confirm-dialog"
import { ShareIcon } from "./icons"

type Confirm =
  | { kind: "rotate" }
  | { kind: "leave" }
  | { kind: "delete" }
  | { kind: "kick"; accountId: string; memberName: string }

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
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const origin =
    inviteOrigin ||
    (typeof window === "undefined" ? "" : window.location.origin)
  const inviteUrl = `${origin}${invitePath(inviteToken)}`
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

  function rotateInvite() {
    return attempt(async () => {
      const next = await rotateGroupInvite({ data: { slug: page.slug } })
      setInviteToken(next.inviteToken)
      notice("Nuovo link")
    })
  }

  function onFreeze(frozen: boolean) {
    return attempt(async () => {
      await freezeGroupInvite({ data: { slug: page.slug, frozen } })
      await router.invalidate()
    })
  }

  function onRename(event: FormEvent) {
    event.preventDefault()
    return attempt(async () => {
      await renameGroup({ data: { slug: page.slug, name } })
      await router.invalidate()
    })
  }

  function leave() {
    return attempt(async () => {
      await leaveGroup({ data: { slug: page.slug } })
      await router.navigate({ to: "/groups" })
    })
  }

  function removeGroup() {
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

  function kick(accountId: string) {
    return attempt(async () => {
      await kickMember({ data: { slug: page.slug, accountId } })
      await router.invalidate()
    })
  }

  function onConfirmed() {
    const current = confirm
    setConfirm(null)
    if (!current) {
      return
    }
    if (current.kind === "rotate") {
      void rotateInvite()
      return
    }
    if (current.kind === "leave") {
      void leave()
      return
    }
    if (current.kind === "delete") {
      void removeGroup()
      return
    }
    void kick(current.accountId)
  }

  return (
    <PageChrome heading={page.name} back={{ to: "/groups", label: "Gruppi" }}>
      {toast ? (
        <Alert className="parle-groups-toast">
          <AlertDescription>{toast}</AlertDescription>
        </Alert>
      ) : null}
      <section className="parle-groups-section">
        <div className="parle-groups-section-head">
          <div className="parle-groups-section-title">
            <h1>Oggi</h1>
            <Popover>
              <PopoverTrigger
                type="button"
                className="parle-groups-info"
                aria-label="Come funziona la classifica di oggi"
                openOnHover
                delay={0}
              >
                <InfoIcon aria-hidden />
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="start"
                className="w-auto max-w-xs p-3"
              >
                <PopoverDescription>
                  Solo i primi tre. Vince chi risolve con meno tentativi; a
                  parità, chi finisce prima.
                </PopoverDescription>
              </PopoverContent>
            </Popover>
          </div>
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
              <span className="parle-rank-place" aria-label={`${row.place}°`}>
                {todayMedal(row.place) ?? `${row.place}°`}
              </span>
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
                  onClick={() =>
                    setConfirm({
                      kind: "kick",
                      accountId: member.accountId,
                      memberName: member.name,
                    })
                  }
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
        {page.inviteFrozen ? (
          <p className="parle-groups-invite">
            Invito bloccato: nessuno può unirsi finché il proprietario non lo
            sblocca.
          </p>
        ) : (
          <p className="parle-groups-invite">{inviteUrl}</p>
        )}
        <div className="parle-groups-actions">
          {page.inviteFrozen ? null : (
            <button
              className="parle-groups-button"
              type="button"
              onClick={() => void onShareInvite()}
            >
              Condividi
            </button>
          )}
          {page.isOwner ? (
            <>
              <button
                className="parle-account-action"
                type="button"
                onClick={() => void onFreeze(!page.inviteFrozen)}
              >
                {page.inviteFrozen ? "Sblocca" : "Blocca"}
              </button>
              {page.inviteFrozen ? null : (
                <button
                  className="parle-account-action"
                  type="button"
                  onClick={() => setConfirm({ kind: "rotate" })}
                >
                  Nuovo link
                </button>
              )}
            </>
          ) : null}
        </div>
      </section>
      {page.isOwner ? (
        <form
          className="parle-groups-form"
          onSubmit={(event) => void onRename(event)}
        >
          <FieldGroup className="gap-2">
            <Field>
              <FieldLabel
                className="parle-setting-title"
                htmlFor="group-rename"
              >
                Rinomina
              </FieldLabel>
              <Input
                id="group-rename"
                className="parle-text-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={48}
              />
            </Field>
            <button className="parle-groups-button" type="submit">
              Salva
            </button>
          </FieldGroup>
        </form>
      ) : null}
      <div className="parle-groups-actions parle-groups-footer">
        <button
          className="parle-account-action"
          type="button"
          onClick={() => setConfirm({ kind: "leave" })}
        >
          Esci dal gruppo
        </button>
        {page.isOwner ? (
          <button
            className="parle-account-action"
            type="button"
            onClick={() => setConfirm({ kind: "delete" })}
          >
            Elimina gruppo
          </button>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirm !== null}
        title={confirmTitle(confirm)}
        confirmLabel={confirmLabel(confirm)}
        destructive={confirm?.kind === "delete" || confirm?.kind === "kick"}
        onConfirm={onConfirmed}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null)
          }
        }}
      />
    </PageChrome>
  )
}

function confirmTitle(confirm: Confirm | null): string {
  if (!confirm) {
    return ""
  }
  if (confirm.kind === "rotate") {
    return "Il link attuale smetterà di funzionare. Continuare?"
  }
  if (confirm.kind === "leave") {
    return "Uscire da questo gruppo?"
  }
  if (confirm.kind === "delete") {
    return "Eliminare questo gruppo?"
  }
  return `Escludere ${confirm.memberName} dal gruppo?`
}

function confirmLabel(confirm: Confirm | null): string {
  if (confirm?.kind === "rotate") {
    return "Continua"
  }
  if (confirm?.kind === "leave") {
    return "Esci"
  }
  if (confirm?.kind === "delete") {
    return "Elimina"
  }
  return "Escludi"
}

import { useEffect, useMemo, useRef, useState } from "react"
import { calendarDateInRome, gameDayIndex } from "../game-day/game-day"
import type { GroupTeaser } from "../group/store"
import { letterEvaluations } from "../guess/evaluate-guess"
import {
  createEmptyPlay,
  rejectionForGuess,
  setHardMode,
  submitGuess,
} from "../play/play"
import { createPlayer, createServerAccount } from "../player/player"
import { puzzleForGameDayIndex } from "../puzzle/word-list"
import { shareText } from "../share/share"
import { statisticsFromPlays } from "../statistics/statistics"
import { createDeviceTheme } from "../theme/device-theme"
import { InstallPrompt } from "../pwa/components/install-prompt"
import { usePwaInstall } from "../pwa/hooks/use-pwa-install"
import { Board } from "./components/board"
import { GameIcon } from "./components/game-icon"
import { HelpContent } from "./components/help-content"
import { Keyboard } from "./components/keyboard"
import { ModalOverlay, PageOverlay } from "./components/overlays"
import { SettingsPage } from "./components/settings-page"
import { StatisticsModal } from "./components/statistics-modal"

const WIN_TOASTS = [
  "Genio!!!",
  "Magnifico",
  "Notevole",
  "Ottimo",
  "Non male",
  "Daje!",
]
const LETTERS = "abcdefghijklmnopqrstuvwxyz"

type Toast = {
  id: number
  text: string
  duration: number
  system?: boolean
}

export function ParleGame({
  accountEmail,
  accountEnabled,
}: {
  accountEmail: string | null
  accountEnabled: boolean
}) {
  const player = useMemo(
    () =>
      createPlayer({
        storage: window.localStorage,
        account: accountEmail ? createServerAccount() : undefined,
      }),
    [accountEmail]
  )
  const themeStore = useMemo(
    () =>
      createDeviceTheme({
        storage: window.localStorage,
        prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
      }),
    []
  )

  const now = new Date()
  const gameDay = calendarDateInRome(now)
  const dayOffset = gameDayIndex(now)
  const puzzle = puzzleForGameDayIndex(dayOffset)
  const restored = player.playForGameDay(gameDay)

  const [play, setPlay] = useState(
    () =>
      restored ??
      createEmptyPlay({
        gameDay,
        puzzle,
        hardMode: lastHardMode(player.load()),
      })
  )
  const [draft, setDraft] = useState("")
  const [theme, setTheme] = useState(() => themeStore.load())
  const [page, setPage] = useState<"help" | "settings" | null>(null)
  const [showStats, setShowStats] = useState(
    () => play.status !== "in_progress"
  )
  const [showHelpModal, setShowHelpModal] = useState(
    () => !player.hasEverPlayed()
  )
  const [canInput, setCanInput] = useState(() => play.status === "in_progress")
  const [invalid, setInvalid] = useState(false)
  const [revealRow, setRevealRow] = useState<number | null>(null)
  const [bounceRow, setBounceRow] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [teasers, setTeasers] = useState<GroupTeaser[]>([])
  const toastSeq = useRef(0)
  const playRef = useRef(play)
  const draftRef = useRef(draft)
  const canInputRef = useRef(canInput)
  const revealDoneRef = useRef(false)
  const onKeyRef = useRef<(key: string) => void>(() => {})
  playRef.current = play
  canInputRef.current = canInput

  const pwaInstall = usePwaInstall({
    blocked: showHelpModal || showStats || page !== null,
  })

  useEffect(() => {
    document.body.classList.toggle("nightmode", theme.nightmode)
    document.body.classList.toggle("dark", theme.nightmode)
    document.body.classList.toggle("colorblind", theme.colorblind)
    themeStore.save(theme)
  }, [theme, themeStore])

  useEffect(() => {
    if (!accountEmail || play.status === "in_progress") {
      setTeasers([])
      return
    }
    let cancelled = false
    void import("../group/queries/groups").then(({ myGroupTeasers }) =>
      myGroupTeasers()
        .then((rows) => {
          if (!cancelled) {
            setTeasers(rows)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setTeasers([])
          }
        })
    )
    return () => {
      cancelled = true
    }
  }, [accountEmail, play.status, play.gameDay])

  useEffect(() => {
    if (!player.hasEverPlayed()) {
      const id = window.setTimeout(() => setShowHelpModal(true), 100)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [player])

  function addToast(toast: Omit<Toast, "id">) {
    const id = toastSeq.current + 1
    toastSeq.current = id
    setToasts((current) => [{ ...toast, id }, ...current])
    if (toast.duration === Number.POSITIVE_INFINITY) {
      return
    }
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, toast.duration + 300)
  }

  function persist(next: typeof play) {
    void player.savePlay(next)
  }

  function reject(message: string) {
    setInvalid(true)
    window.setTimeout(() => setInvalid(false), 600)
    addToast({ text: message, duration: 1000 })
  }

  function onKey(key: string) {
    const current = playRef.current
    if (current.status !== "in_progress" || !canInputRef.current) {
      return
    }
    if (key === "Backspace") {
      const next = draftRef.current.slice(0, -1)
      draftRef.current = next
      setDraft(next)
      return
    }
    if (key === "Enter") {
      const guess = draftRef.current
      if (guess.length !== 5) {
        reject("Non abbastanza lettere")
        return
      }
      const rejection = rejectionForGuess({ play: current, guess })
      if (rejection) {
        reject(rejection)
        return
      }
      const next = submitGuess({ play: current, guess })
      setPlay(next)
      persist(next)
      draftRef.current = ""
      setDraft("")
      canInputRef.current = false
      setCanInput(false)
      revealDoneRef.current = false
      setRevealRow(next.guesses.length - 1)
      return
    }
    const letter = key.toLowerCase()
    if (!LETTERS.includes(letter) || draftRef.current.length >= 5) {
      return
    }
    const next = draftRef.current + letter
    draftRef.current = next
    setDraft(next)
  }
  onKeyRef.current = onKey

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey) {
        return
      }
      const key = event.key
      if (
        LETTERS.includes(key.toLowerCase()) ||
        key === "Backspace" ||
        key === "Enter"
      ) {
        if (key === "Enter") {
          event.preventDefault()
        }
        onKeyRef.current(key)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (revealRow === null) {
      return
    }
    const lastTileDelayMs = 300 * 4
    const flipMs = 250 + 250
    const id = window.setTimeout(
      () => onRevealDone(),
      lastTileDelayMs + flipMs + 100
    )
    return () => window.clearTimeout(id)
  }, [revealRow])

  function onRevealDone() {
    if (revealDoneRef.current) {
      return
    }
    revealDoneRef.current = true
    const current = playRef.current
    setRevealRow(null)
    if (current.status === "won") {
      setBounceRow(current.guesses.length - 1)
      addToast({
        text: WIN_TOASTS[current.guesses.length - 1] ?? "Daje!",
        duration: 2000,
      })
      window.setTimeout(() => setShowStats(true), 2500)
      return
    }
    if (current.status === "lost") {
      addToast({
        text: current.puzzle.toUpperCase(),
        duration: Number.POSITIVE_INFINITY,
      })
      window.setTimeout(() => setShowStats(true), 2500)
      return
    }
    canInputRef.current = true
    setCanInput(true)
  }

  function onHardMode(checked: boolean) {
    if (
      checked &&
      !play.hardMode &&
      play.guesses.length > 0 &&
      play.status === "in_progress"
    ) {
      addToast({
        text: "Si può attivare 'il gioco si fa duro' solo all'inizio di una partita",
        duration: 1500,
        system: true,
      })
      return
    }
    const next = setHardMode({ play, hardMode: checked })
    setPlay(next)
    if (next.guesses.length > 0 || checked) {
      persist(next)
    }
  }

  function onSignOut() {
    player.onSignOut()
    window.location.href = "/api/auth/sign-out"
  }

  async function onShare() {
    const text = shareText({
      evaluations: play.evaluations,
      dayOffset,
      guessesUsed: play.guesses.length,
      hardMode: play.hardMode,
      won: play.status === "won",
      nightmode: theme.nightmode,
      colorblind: theme.colorblind,
    })
    const payload = { text }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload)
        return
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }
      }
    }
    try {
      copyShareText(text)
      addToast({ text: "Risultati copiati", duration: 2000, system: true })
    } catch {
      addToast({
        text: "Errore nella condivisione",
        duration: 2000,
        system: true,
      })
    }
  }

  const stats = statisticsFromPlays({ plays: player.load(), today: gameDay })
  const revealedCount = revealRow === null ? play.guesses.length : revealRow
  const marks = letterEvaluations({
    guesses: play.guesses.slice(0, revealedCount),
    evaluations: play.evaluations.slice(0, revealedCount),
  })
  const hardModeLocked =
    play.status === "in_progress" && play.guesses.length > 0 && !play.hardMode

  return (
    <div className="parle">
      <header className="parle-header">
        <div className="parle-menu">
          <button
            className="parle-icon-button"
            type="button"
            onClick={() => setPage("help")}
          >
            <GameIcon name="help" />
          </button>
        </div>
        <div className="parle-title">PAR🇮🇹LE</div>
        <div className="parle-menu">
          <button
            className="parle-icon-button"
            type="button"
            onClick={() => setPage("settings")}
          >
            <GameIcon name="settings" />
          </button>
        </div>
      </header>
      <Board
        guesses={play.guesses}
        draft={draft}
        evaluations={play.evaluations}
        invalid={invalid}
        bounceRow={bounceRow}
        revealRow={revealRow}
        onRevealDone={onRevealDone}
      />
      <Keyboard letterMarks={marks} onKey={onKey} />
      {showHelpModal ? (
        <ModalOverlay onClose={() => setShowHelpModal(false)}>
          <HelpContent />
        </ModalOverlay>
      ) : null}
      {showStats ? (
        <ModalOverlay onClose={() => setShowStats(false)}>
          <StatisticsModal
            stats={stats}
            highlightGuess={
              play.status === "won" ? play.guesses.length : undefined
            }
            teasers={teasers}
            onShare={() => {
              void onShare()
            }}
          />
        </ModalOverlay>
      ) : null}
      {page === "help" ? (
        <PageOverlay title="Come giocare" onClose={() => setPage(null)}>
          <HelpContent />
        </PageOverlay>
      ) : null}
      {page === "settings" ? (
        <PageOverlay title="Impostazioni" onClose={() => setPage(null)}>
          <SettingsPage
            hardMode={play.hardMode}
            hardModeLocked={hardModeLocked}
            nightmode={theme.nightmode}
            colorblind={theme.colorblind}
            dayOffset={dayOffset}
            accountEmail={accountEmail}
            accountEnabled={accountEnabled}
            canInstallApp={pwaInstall.canPrompt}
            onHardMode={onHardMode}
            onNightmode={(nightmode) => setTheme({ ...theme, nightmode })}
            onColorblind={(colorblind) => setTheme({ ...theme, colorblind })}
            onSignOut={onSignOut}
            onInstallApp={pwaInstall.openPrompt}
          />
        </PageOverlay>
      ) : null}
      <InstallPrompt install={pwaInstall} />
      <div className="parle-toaster">
        {toasts
          .filter((toast) => !toast.system)
          .map((toast) => (
            <ToastView key={toast.id} toast={toast} />
          ))}
      </div>
      <div className="parle-toaster parle-toaster-system">
        {toasts
          .filter((toast) => toast.system)
          .map((toast) => (
            <ToastView key={toast.id} toast={toast} />
          ))}
      </div>
    </div>
  )
}

function ToastView({ toast }: { toast: Toast }) {
  const [fade, setFade] = useState(false)
  useEffect(() => {
    if (toast.duration === Number.POSITIVE_INFINITY) {
      return
    }
    const id = window.setTimeout(() => setFade(true), toast.duration)
    return () => window.clearTimeout(id)
  }, [toast.duration])
  return (
    <div
      className={["parle-toast", fade ? "parle-toast-fade" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {toast.text}
    </div>
  )
}

function lastHardMode(plays: { hardMode: boolean }[]): boolean {
  const last = plays.at(-1)
  return last?.hardMode ?? false
}

function copyShareText(text: string) {
  const area = document.createElement("textarea")
  area.textContent = text
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand("copy")
  document.body.removeChild(area)
  if (!ok) {
    throw new Error("copy failed")
  }
}

import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  formatCountdown,
  msUntilNextRomeMidnight,
} from "../../game-day/game-day"
import type { GroupTeaser } from "../../group/store"
import type { Statistics } from "../../statistics/statistics"
import { GameIcon } from "./game-icon"

export function StatisticsModal({
  stats,
  highlightGuess,
  teasers,
  puzzle,
  gloss,
  onShare,
}: {
  stats: Statistics
  highlightGuess: number | undefined
  teasers: GroupTeaser[]
  puzzle: string
  gloss: string | undefined
  onShare: () => void
}) {
  const maxBar = Math.max(
    ...([1, 2, 3, 4, 5, 6] as const).map((n) => stats.guesses[n])
  )

  return (
    <div className="parle-stats">
      <h1>Statistiche</h1>
      <div className="parle-stat-row">
        <Stat value={stats.gamesPlayed} label="Partite" />
        <Stat value={stats.winPercentage} label="% Vittorie" />
        <Stat value={stats.currentStreak} label="Vinte di fila" />
        <Stat value={stats.maxStreak} label="Record di vittorie in fila" />
      </div>
      <h1>Distribuzione dei tentativi</h1>
      <div className="parle-distribution">
        {([1, 2, 3, 4, 5, 6] as const).map((n) => {
          const count = stats.guesses[n]
          const width = Math.max(
            7,
            Math.round((count / Math.max(maxBar, 1)) * 100)
          )
          return (
            <div className="parle-graph-row" key={n}>
              <div>{n}</div>
              <div className="parle-graph">
                <div
                  className={[
                    "parle-graph-bar",
                    count > 0 ? "parle-graph-bar-right" : "",
                    highlightGuess === n ? "parle-graph-bar-highlight" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ width: `${width}%` }}
                >
                  <div className="parle-graph-count">{count}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="parle-stats-footer">
        <div className="parle-countdown">
          <h1>Prossimo PARLE</h1>
          <div className="parle-stat">
            <div className="parle-stat-value">
              <Countdown />
            </div>
          </div>
        </div>
        <div className="parle-share">
          <button
            className="parle-share-button"
            type="button"
            onClick={onShare}
          >
            Condividi
          </button>
        </div>
      </div>
      {gloss ? <GlossStrip puzzle={puzzle} gloss={gloss} /> : null}
      {teasers.length > 0 ? (
        <div className="parle-group-teasers">
          {teasers.map((teaser) => (
            <Link
              key={teaser.slug}
              className="parle-group-teaser"
              to="/groups/$slug"
              params={{ slug: teaser.slug }}
            >
              <span className="parle-group-teaser-name">{teaser.name}</span>
              <span className="parle-group-teaser-place">
                {teaser.place}° · {teaser.attemptsLabel}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function GlossStrip({ puzzle, gloss }: { puzzle: string; gloss: string }) {
  const [revealed, setRevealed] = useState(false)
  const href = `https://it.wiktionary.org/wiki/${encodeURIComponent(puzzle)}`

  return (
    <div className="parle-gloss">
      <a
        className="parle-gloss-body"
        data-revealed={revealed}
        href={href}
        target="_blank"
        rel="noreferrer"
        tabIndex={revealed ? undefined : -1}
        aria-hidden={!revealed}
      >
        <h1>{puzzle}</h1>
        <p className="parle-gloss-text">{gloss}</p>
      </a>
      {revealed ? (
        <button
          className="parle-icon-button parle-gloss-hide"
          type="button"
          aria-label="Nascondi la parola e il significato"
          onClick={() => setRevealed(false)}
        >
          <GameIcon name="hide" />
        </button>
      ) : (
        <button
          className="parle-gloss-reveal"
          type="button"
          onClick={() => setRevealed(true)}
        >
          Mostra la parola e il significato
        </button>
      )}
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="parle-stat">
      <div className="parle-stat-value">{value}</div>
      <div className="parle-stat-label">{label}</div>
    </div>
  )
}

function Countdown() {
  const [text, setText] = useState(() =>
    formatCountdown(msUntilNextRomeMidnight(new Date()))
  )
  useEffect(() => {
    const id = window.setInterval(() => {
      setText(formatCountdown(msUntilNextRomeMidnight(new Date())))
    }, 200)
    return () => window.clearInterval(id)
  }, [])
  return text
}

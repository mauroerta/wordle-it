import { useEffect, useState } from "react"
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
  onShare,
}: {
  stats: Statistics
  highlightGuess: number | undefined
  teasers: GroupTeaser[]
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
            <GameIcon name="share" />
          </button>
        </div>
      </div>
      {teasers.length > 0 ? (
        <div className="parle-group-teasers">
          {teasers.map((teaser) => (
            <a
              key={teaser.slug}
              className="parle-group-teaser"
              href={`/groups/${teaser.slug}`}
            >
              <span className="parle-group-teaser-name">{teaser.name}</span>
              <span className="parle-group-teaser-place">
                {teaser.place}° · {teaser.attemptsLabel}
              </span>
            </a>
          ))}
        </div>
      ) : null}
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

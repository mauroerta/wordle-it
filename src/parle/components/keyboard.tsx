import { useEffect, useRef, useState } from "react"
import type { TileMark } from "../../guess/evaluate-guess"
import { GameIcon } from "./game-icon"

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["-", "a", "s", "d", "f", "g", "h", "j", "k", "l", "-"],
  ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"],
] as const

export function Keyboard({
  letterMarks,
  onKey,
}: {
  letterMarks: Record<string, TileMark>
  onKey: (key: string) => void
}) {
  return (
    <div
      className="parle-keyboard"
      onMouseDown={(event) => {
        if (
          event.target instanceof HTMLElement &&
          event.target.closest("button")
        ) {
          event.preventDefault()
        }
      }}
    >
      {ROWS.map((row, i) => (
        <div className="parle-keyboard-row" key={i}>
          {row.map((key, j) => {
            if (key === "-") {
              return <div className="parle-key-half" key={`${i}-${j}`} />
            }
            if (key === "Enter") {
              return (
                <button
                  className="parle-key parle-key-wide"
                  key={key}
                  type="button"
                  onClick={() => onKey("Enter")}
                >
                  invio
                </button>
              )
            }
            if (key === "Backspace") {
              return (
                <button
                  className="parle-key parle-key-wide"
                  key={key}
                  type="button"
                  onClick={() => onKey("Backspace")}
                >
                  <GameIcon name="backspace" />
                </button>
              )
            }
            return (
              <LetterKey
                key={key}
                letter={key}
                mark={letterMarks[key]}
                onKey={onKey}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function LetterKey({
  letter,
  mark,
  onKey,
}: {
  letter: string
  mark: TileMark | undefined
  onKey: (key: string) => void
}) {
  const [fade, setFade] = useState(false)
  const previous = useRef(mark)
  useEffect(() => {
    if (mark !== undefined && mark !== previous.current) {
      setFade(true)
    }
    previous.current = mark
  }, [mark])
  return (
    <button
      className={fade ? "parle-key fade" : "parle-key"}
      type="button"
      data-state={mark}
      onClick={() => onKey(letter)}
      onTransitionEnd={() => setFade(false)}
    >
      {letter}
    </button>
  )
}

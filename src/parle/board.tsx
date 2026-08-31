import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import type { TileMark } from "../guess/evaluate-guess"
import { MAX_GUESSES, WORD_LENGTH } from "../play/play"

export function Board({
  guesses,
  draft,
  evaluations,
  invalid,
  bounceRow,
  revealRow,
  onRevealDone,
}: {
  guesses: string[]
  draft: string
  evaluations: TileMark[][]
  invalid: boolean
  bounceRow: number | null
  revealRow: number | null
  onRevealDone: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const board = boardRef.current
    if (!container || !board) {
      return
    }
    function size() {
      if (!container || !board) {
        return
      }
      const width = Math.min(Math.floor(container.clientHeight * (5 / 6)), 350)
      const height = 6 * Math.floor(width / 5)
      board.style.width = `${width}px`
      board.style.height = `${height}px`
    }
    size()
    const observer = new ResizeObserver(size)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const rows = Array.from({ length: MAX_GUESSES }, (_, row) => {
    if (row < guesses.length) {
      return guesses[row] ?? ""
    }
    if (row === guesses.length) {
      return draft
    }
    return ""
  })

  return (
    <div className="parle-board-container" ref={containerRef}>
      <div className="parle-board" ref={boardRef}>
        {rows.map((letters, row) => (
          <BoardRow
            key={row}
            letters={letters}
            marks={evaluations[row]}
            invalid={invalid && row === guesses.length}
            bounce={bounceRow === row}
            revealing={revealRow === row}
            onRevealDone={onRevealDone}
          />
        ))}
      </div>
    </div>
  )
}

function BoardRow({
  letters,
  marks,
  invalid,
  bounce,
  revealing,
  onRevealDone,
}: {
  letters: string
  marks: TileMark[] | undefined
  invalid: boolean
  bounce: boolean
  revealing: boolean
  onRevealDone: () => void
}) {
  return (
    <div
      className="parle-row"
      data-invalid={invalid ? "true" : undefined}
      onAnimationEnd={(event) => {
        if (event.animationName === "parle-shake") {
          event.currentTarget.removeAttribute("data-invalid")
        }
      }}
    >
      {Array.from({ length: WORD_LENGTH }, (_, i) => (
        <Tile
          key={i}
          letter={letters[i]}
          mark={marks?.[i]}
          revealing={revealing}
          delayMs={revealing ? 300 * i : 0}
          bounce={bounce}
          bounceDelayMs={100 * i}
          last={revealing && i === WORD_LENGTH - 1}
          onRevealDone={onRevealDone}
        />
      ))}
    </div>
  )
}

function Tile({
  letter,
  mark,
  revealing,
  delayMs,
  bounce,
  bounceDelayMs,
  last,
  onRevealDone,
}: {
  letter: string | undefined
  mark: TileMark | undefined
  revealing: boolean
  delayMs: number
  bounce: boolean
  bounceDelayMs: number
  last: boolean
  onRevealDone: () => void
}) {
  const [animation, setAnimation] = useState<
    "idle" | "pop" | "flip-in" | "flip-out"
  >("idle")
  const [shown, setShown] = useState<TileMark | undefined>(
    revealing ? undefined : mark
  )
  const prevLetter = useRef(letter)

  useEffect(() => {
    if (letter && letter !== prevLetter.current && !mark) {
      setAnimation("pop")
    }
    prevLetter.current = letter
  }, [letter, mark])

  useEffect(() => {
    if (!revealing || !mark) {
      setShown(mark)
      return
    }
    const id = window.setTimeout(() => setAnimation("flip-in"), delayMs)
    return () => window.clearTimeout(id)
  }, [revealing, mark, delayMs])

  const state = shown ?? (letter ? "tbd" : "empty")

  return (
    <div
      className="parle-tile"
      data-state={state}
      data-animation={animation}
      data-win={bounce ? "true" : undefined}
      style={bounce ? { animationDelay: `${bounceDelayMs}ms` } : undefined}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) {
          return
        }
        if (event.animationName === "parle-pop") {
          setAnimation("idle")
          return
        }
        if (event.animationName === "parle-flip-in") {
          // Keep rotateX(-90deg) until the new color and FlipOut are painted.
          flushSync(() => {
            setShown(mark)
            setAnimation("flip-out")
          })
          return
        }
        if (event.animationName === "parle-flip-out") {
          setAnimation("idle")
          if (last) {
            onRevealDone()
          }
        }
      }}
    >
      {letter}
    </div>
  )
}

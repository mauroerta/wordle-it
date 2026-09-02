import type { TileMark } from "../guess/evaluate-guess"
import { evaluateGuess } from "../guess/evaluate-guess"
import { hardModeError } from "../guess/hard-mode"
import { isAllowedGuess } from "../puzzle/word-list"

export type PlayStatus = "in_progress" | "won" | "lost"

export type Play = {
  gameDay: string
  puzzle: string
  guesses: string[]
  evaluations: TileMark[][]
  status: PlayStatus
  hardMode: boolean
}

export const MAX_GUESSES = 6
export const WORD_LENGTH = 5

export class GuessRejectedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GuessRejectedError"
  }
}

export function createEmptyPlay({
  gameDay,
  puzzle,
  hardMode,
}: {
  gameDay: string
  puzzle: string
  hardMode: boolean
}): Play {
  return {
    gameDay,
    puzzle,
    guesses: [],
    evaluations: [],
    status: "in_progress",
    hardMode,
  }
}

export function rejectionForGuess({
  play,
  guess,
}: {
  play: Play
  guess: string
}): string | undefined {
  if (play.status !== "in_progress") {
    return "La partita è finita"
  }
  if (guess.length !== WORD_LENGTH) {
    return "Non abbastanza lettere"
  }
  if (!isAllowedGuess(guess)) {
    return "Non nella lista di parole"
  }
  if (!play.hardMode) {
    return undefined
  }
  const lastIndex = play.guesses.length - 1
  return hardModeError({
    guess,
    previousGuess: play.guesses[lastIndex],
    previousMarks: play.evaluations[lastIndex],
  })
}

export function submitGuess({
  play,
  guess,
}: {
  play: Play
  guess: string
}): Play {
  const rejection = rejectionForGuess({ play, guess })
  if (rejection) {
    throw new GuessRejectedError(rejection)
  }

  const marks = evaluateGuess({ guess, puzzle: play.puzzle })
  const guesses = [...play.guesses, guess]
  const evaluations = [...play.evaluations, marks]
  const won = marks.every((mark) => mark === "correct")
  const lost = !won && guesses.length >= MAX_GUESSES

  return {
    ...play,
    guesses,
    evaluations,
    status: won ? "won" : lost ? "lost" : "in_progress",
  }
}

export function setHardMode({
  play,
  hardMode,
}: {
  play: Play
  hardMode: boolean
}): Play {
  if (
    hardMode &&
    !play.hardMode &&
    play.guesses.length > 0 &&
    play.status === "in_progress"
  ) {
    throw new GuessRejectedError(
      "Si può attivare 'il gioco si fa duro' solo all'inizio di una partita"
    )
  }
  return { ...play, hardMode }
}

export function isPlay(value: unknown): value is Play {
  if (!value || typeof value !== "object") {
    return false
  }
  const play = value as Partial<Play>
  return (
    typeof play.gameDay === "string" &&
    typeof play.puzzle === "string" &&
    Array.isArray(play.guesses) &&
    Array.isArray(play.evaluations) &&
    (play.status === "in_progress" ||
      play.status === "won" ||
      play.status === "lost") &&
    typeof play.hardMode === "boolean"
  )
}

import type { TileMark } from "./evaluate-guess"

export function hardModeError({
  guess,
  previousGuess,
  previousMarks,
}: {
  guess: string
  previousGuess: string | undefined
  previousMarks: TileMark[] | undefined
}): string | undefined {
  if (!previousGuess || !previousMarks) {
    return undefined
  }

  for (let i = 0; i < previousMarks.length; i++) {
    if (previousMarks[i] === "correct" && guess[i] !== previousGuess[i]) {
      const letter = previousGuess[i].toUpperCase()
      return `La ${letterPosition(i)} lettera deve essere ${letter}`
    }
  }

  const required: Record<string, number> = {}
  for (let i = 0; i < previousMarks.length; i++) {
    const mark = previousMarks[i]
    if (mark !== "correct" && mark !== "present") {
      continue
    }
    const letter = previousGuess[i]
    if (!letter) {
      continue
    }
    required[letter] = (required[letter] ?? 0) + 1
  }

  const counts: Record<string, number> = {}
  for (const letter of guess) {
    counts[letter] = (counts[letter] ?? 0) + 1
  }

  for (const letter of Object.keys(required)) {
    if ((counts[letter] ?? 0) < (required[letter] ?? 0)) {
      return `Deve contenere ${letter.toUpperCase()}`
    }
  }

  return undefined
}

const LETTER_POSITIONS = [
  "prima",
  "seconda",
  "terza",
  "quarta",
  "quinta",
] as const

function letterPosition(index: number): string {
  return LETTER_POSITIONS[index] ?? `${index + 1}ª`
}

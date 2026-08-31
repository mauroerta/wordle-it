import puzzles from "./puzzles.json" with { type: "json" }
import guesses from "./guesses.json" with { type: "json" }

const puzzleWords: string[] = puzzles
const guessWords: string[] = guesses
const allowed = new Set([...puzzleWords, ...guessWords])

export function isAllowedGuess(word: string): boolean {
  return allowed.has(word)
}

export function puzzleForGameDayIndex(index: number): string {
  if (index < 0) {
    throw new Error("Game Day is before First Game Day")
  }
  const puzzle = puzzleWords[index % puzzleWords.length]
  if (!puzzle) {
    throw new Error("Puzzle list is empty")
  }
  return puzzle
}

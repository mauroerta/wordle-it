export type TileMark = "correct" | "present" | "absent"

export function evaluateGuess({
  guess,
  puzzle,
}: {
  guess: string
  puzzle: string
}): TileMark[] {
  const marks: Array<TileMark> = Array.from({ length: puzzle.length }, () =>
    "absent"
  )
  const guessOpen = Array.from({ length: guess.length }, () => true)
  const puzzleOpen = Array.from({ length: puzzle.length }, () => true)

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === puzzle[i] && puzzleOpen[i]) {
      marks[i] = "correct"
      guessOpen[i] = false
      puzzleOpen[i] = false
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (!guessOpen[i]) {
      continue
    }
    const letter = guess[i]
    for (let j = 0; j < puzzle.length; j++) {
      if (puzzleOpen[j] && letter === puzzle[j]) {
        marks[i] = "present"
        puzzleOpen[j] = false
        break
      }
    }
  }

  return marks
}

export function letterEvaluations({
  guesses,
  evaluations,
}: {
  guesses: string[]
  evaluations: TileMark[][]
}): Record<string, TileMark> {
  const rank = { absent: 1, present: 2, correct: 3 }
  const best = new Map<string, TileMark>()
  for (let row = 0; row < evaluations.length; row++) {
    const guess = guesses[row]
    const marks = evaluations[row]
    for (let i = 0; i < marks.length; i++) {
      const letter = guess[i]
      const mark = marks[i]
      const previous = best.get(letter)
      if (previous === undefined || rank[mark] > rank[previous]) {
        best.set(letter, mark)
      }
    }
  }
  return Object.fromEntries(best)
}

import type { TileMark } from "../guess/evaluate-guess"

export function shareText({
  evaluations,
  dayOffset,
  guessesUsed,
  hardMode,
  won,
  nightmode,
  colorblind,
}: {
  evaluations: TileMark[][]
  dayOffset: number
  guessesUsed: number
  hardMode: boolean
  won: boolean
  nightmode: boolean
  colorblind: boolean
}): string {
  const score = won ? String(guessesUsed) : "X"
  let header = `Par🇮🇹le n°${dayOffset} ${score}/6`
  if (hardMode) {
    header += "*"
  }
  const rows = evaluations.map((marks) =>
    marks
      .map((mark) => {
        if (mark === "correct") {
          return colorblind ? "🟧" : "🟩"
        }
        if (mark === "present") {
          return colorblind ? "🟦" : "🟨"
        }
        return nightmode ? "⬛" : "⬜"
      })
      .join("")
  )
  return `${header}\n\n${rows.join("\n")}`
}

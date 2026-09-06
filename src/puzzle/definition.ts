import definitions from "./definitions.json" with { type: "json" }

const glosses: Record<string, string> = definitions

export function glossForPuzzle(puzzle: string): string | undefined {
  return glosses[puzzle]
}

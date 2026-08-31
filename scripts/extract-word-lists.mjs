import { mkdirSync, readFileSync, writeFileSync } from "node:fs"

const src = readFileSync("legacy/wordle-it.js", "utf8")

function extractArray(name) {
  const start = src.indexOf(`${name} = [`)
  if (start < 0) {
    throw new Error(`missing ${name}`)
  }
  const open = src.indexOf("[", start)
  let depth = 0
  for (let i = open; i < src.length; i++) {
    const ch = src[i]
    if (ch === "[") {
      depth += 1
    }
    if (ch === "]") {
      depth -= 1
      if (depth === 0) {
        return JSON.parse(src.slice(open, i + 1).replaceAll("'", '"'))
      }
    }
  }
  throw new Error(`unclosed ${name}`)
}

const puzzles = extractArray("Aa")
const guesses = extractArray("La")
mkdirSync("src/puzzle", { recursive: true })
writeFileSync("src/puzzle/puzzles.json", JSON.stringify(puzzles))
writeFileSync("src/puzzle/guesses.json", JSON.stringify(guesses))
console.log({
  puzzles: puzzles.length,
  guesses: guesses.length,
  first: puzzles[0],
})

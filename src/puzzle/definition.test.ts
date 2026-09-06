import { describe, expect, test } from "vitest"
import { glossForPuzzle } from "./definition"

describe("glossForPuzzle", () => {
  test("returns the Italian gloss for a Puzzle", () => {
    expect(glossForPuzzle("oncia")).toBe(
      "Unità di misura di massa dell'antica Roma, pari ad un dodicesimo di libbra"
    )
  })

  test("follows an inflected form to the lemma", () => {
    expect(glossForPuzzle("furba")).toBe("Che usa la sua intelligenza")
  })

  test("is missing when Wikizionario has no sense", () => {
    expect(glossForPuzzle("gnosi")).toBeUndefined()
  })
})

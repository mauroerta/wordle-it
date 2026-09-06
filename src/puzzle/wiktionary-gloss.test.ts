import { describe, expect, test } from "vitest"
import { cleanWikitext, glossFromWikitext } from "./wiktionary-gloss"

describe("glossFromWikitext", () => {
  test("takes the first Italian sense", () => {
    expect(
      glossFromWikitext(`== {{-it-}} ==
{{-sost-|it}}
# {{Term|storia|it}} [[unità]] di [[misura]] di [[massa]] dell'[[antica]] [[Roma]], [[pari]] ad un [[dodicesimo]] di [[libbra]]
# {{Term|fisica|it}} nei sistemi di misura anglosassoni [[unità]] di peso
`)
    ).toEqual({
      gloss:
        "Unità di misura di massa dell'antica Roma, pari ad un dodicesimo di libbra",
    })
  })

  test("follows a feminine form to the lemma", () => {
    expect(
      glossFromWikitext(`== {{-it-}} ==
{{-agg form-|it}}
#femminile di [[furbo]]
`)
    ).toEqual({ formOf: "furbo" })
  })

  test("follows a conjugated verb to the infinitive", () => {
    expect(
      glossFromWikitext(`=={{-it-}}==
{{-verb form-|it}}
# prima persona singolare del congiuntivo presente di [[correre]]
# seconda persona singolare del congiuntivo presente di [[correre]]
`)
    ).toEqual({ formOf: "correre" })
  })

  test("reads numbered senses", () => {
    expect(
      glossFromWikitext(`== {{-it-}} ==
{{-agg-|it}}
1. che usa la sua [[intelligenza]]
2. {{Spreg}} che [[ruba]]
`)
    ).toEqual({ gloss: "Che usa la sua intelligenza" })
  })

  test("skips a sense that has no definition", () => {
    expect(
      glossFromWikitext(`== {{-it-}} ==
# {{Nodef|it}}
# [[procedere]] velocemente
`)
    ).toEqual({ gloss: "Procedere velocemente" })
  })

  test("ignores other languages", () => {
    expect(
      glossFromWikitext(`== {{-pt-}} ==
# litro
== {{-it-}} ==
# [[unità]] di [[misura]] della [[capacità]]
=={{-es-}}==
# litro
`)
    ).toEqual({ gloss: "Unità di misura della capacità" })
  })

  test("reads a colon sense", () => {
    expect(
      glossFromWikitext(`== {{-it-}} ==
{{-prep-|it}}
: contrazione di [[su]] e [[gli]]
`)
    ).toEqual({ gloss: "Contrazione di su e gli" })
  })

  test("returns nothing without an Italian section", () => {
    expect(glossFromWikitext("== {{-en-}} ==\n# ounce")).toEqual({})
  })
})

describe("cleanWikitext", () => {
  test("drops templates and keeps link labels", () => {
    expect(
      cleanWikitext(
        "{{Term|forestierismo|it}} piccola [[icona]] a colori {{Term|informatica|it}}"
      )
    ).toBe("piccola icona a colori")
  })
})

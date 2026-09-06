import { writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import puzzles from "./puzzles.json" with { type: "json" }
// Regenerates definitions.json. Not imported by the app.
// Node ESM needs the suffix; the app imports wiktionary-gloss without it.
import { glossFromWikitext } from "./wiktionary-gloss.ts"

const UA = "Parle/1.0 (https://github.com/mauroerta/wordle-it; puzzle glosses)"
const BATCH = 50
const here = dirname(fileURLToPath(import.meta.url))

type Page = {
  gloss?: string
  formOf?: string
}

const pages = new Map<string, Page>()

async function main() {
  const words = puzzles
  await fetchWords(words)
  const lemmas = [
    ...new Set(
      [...pages.values()]
        .map((page) => page.formOf)
        .filter((word): word is string => Boolean(word && !pages.has(word)))
    ),
  ]
  await fetchWords(lemmas)

  const glosses: Record<string, string> = {}
  for (const word of words) {
    const gloss = resolvedGloss(word, 0)
    if (gloss) {
      glosses[word] = gloss
    }
  }

  const out = join(here, "definitions.json")
  await writeFile(out, `${JSON.stringify(glosses)}\n`)
  console.log(
    `${Object.keys(glosses).length}/${words.length} glosses -> ${out}`
  )
}

function resolvedGloss(word: string, depth: number): string | undefined {
  if (depth > 3) {
    return undefined
  }
  const page = pages.get(word)
  if (!page) {
    return undefined
  }
  if (page.gloss) {
    return page.gloss
  }
  if (page.formOf) {
    return resolvedGloss(page.formOf, depth + 1)
  }
  return undefined
}

async function fetchWords(words: string[]) {
  for (let i = 0; i < words.length; i += BATCH) {
    const batch = words.slice(i, i + BATCH)
    const url = new URL("https://it.wiktionary.org/w/api.php")
    url.searchParams.set("action", "query")
    url.searchParams.set("prop", "revisions")
    url.searchParams.set("rvprop", "content")
    url.searchParams.set("rvslots", "main")
    url.searchParams.set("format", "json")
    url.searchParams.set("formatversion", "2")
    url.searchParams.set("redirects", "1")
    url.searchParams.set("titles", batch.join("|"))
    const response = await fetch(url, { headers: { "User-Agent": UA } })
    if (!response.ok) {
      throw new Error(`Wiktionary ${response.status} on ${batch[0]}`)
    }
    const data = (await response.json()) as {
      query?: {
        pages?: {
          title: string
          missing?: boolean
          revisions?: { slots?: { main?: { content?: string } } }[]
        }[]
        redirects?: { from: string; to: string }[]
      }
    }
    const redirectTo = new Map(
      (data.query?.redirects ?? []).map((row) => [
        row.from.toLowerCase(),
        row.to.toLowerCase(),
      ])
    )
    const byTitle = new Map<string, Page>()
    for (const page of data.query?.pages ?? []) {
      const wikitext = page.revisions?.[0]?.slots?.main?.content
      byTitle.set(
        page.title.toLowerCase(),
        page.missing || !wikitext ? {} : glossFromWikitext(wikitext)
      )
    }
    for (const word of batch) {
      const title = redirectTo.get(word) ?? word
      pages.set(word, byTitle.get(title) ?? {})
    }
    await wait(200)
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

void main()

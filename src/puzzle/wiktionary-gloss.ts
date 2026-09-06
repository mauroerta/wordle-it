const ITALIAN_SECTION = /^==\s*\{\{-it-\}\}\s*==/m
const NEXT_SECTION = /^==\s*(?!\{\{-it-\}\})/m
const SENSE_LINE = /^(?::(?![*:])|#+(?!\*)|\d+\.)\s*(.*)$/
const FORM_OF =
  /^(?:femminile|maschile|plurale|singolare|(?:prima|seconda|terza) persona\b.*?|participio\b.*?|gerundio\b.*?)\s+di\s+/i
const LEMMA_LINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g
const INNER_TEMPLATE = /\{\{[^{}]*\}\}/g
const WIKI_LINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g
const MAX_GLOSS = 180

export function glossFromWikitext(wikitext: string): {
  formOf?: string
  gloss?: string
} {
  const italian = italianSection(wikitext)
  if (!italian) {
    return {}
  }
  for (const raw of senseLines(italian)) {
    if (/\{\{Nodef\|/i.test(raw)) {
      continue
    }
    const formOf = formOfLemma(raw)
    if (formOf) {
      return { formOf }
    }
    const gloss = asSentence(truncateGloss(cleanWikitext(raw)))
    if (gloss) {
      return { gloss }
    }
  }
  return {}
}

export function cleanWikitext(line: string): string {
  let text = line
  let previous = ""
  while (text !== previous) {
    previous = text
    text = text.replace(INNER_TEMPLATE, "")
  }
  text = text.replace(WIKI_LINK, (_match, target: string, label?: string) => {
    return (label ?? target).trim()
  })
  return text.replace(/[[\]]/g, "").replace(/\s+/g, " ").trim()
}

function italianSection(wikitext: string): string | undefined {
  const start = wikitext.search(ITALIAN_SECTION)
  if (start < 0) {
    return undefined
  }
  const afterStart = wikitext.slice(start)
  const headerEnd = afterStart.indexOf("\n")
  const body = headerEnd < 0 ? "" : afterStart.slice(headerEnd + 1)
  const end = body.search(NEXT_SECTION)
  return end < 0 ? body : body.slice(0, end)
}

function senseLines(italian: string): string[] {
  const lines: string[] = []
  for (const line of italian.split("\n")) {
    const match = SENSE_LINE.exec(line.trim())
    if (match?.[1]) {
      lines.push(match[1])
    }
  }
  return lines
}

function formOfLemma(raw: string): string | undefined {
  const cleaned = cleanWikitext(raw)
  if (!FORM_OF.test(cleaned)) {
    return undefined
  }
  LEMMA_LINK.lastIndex = 0
  let lemma: string | undefined
  for (const match of raw.matchAll(LEMMA_LINK)) {
    const word = match[1]?.trim()
    if (word) {
      lemma = word
    }
  }
  if (lemma) {
    return lemma.toLowerCase()
  }
  const leftover = cleaned.replace(FORM_OF, "").trim()
  return leftover || undefined
}

function truncateGloss(text: string): string {
  if (text.length <= MAX_GLOSS) {
    return text
  }
  const slice = text.slice(0, MAX_GLOSS)
  const punct = Math.max(
    slice.lastIndexOf(";"),
    slice.lastIndexOf("."),
    slice.lastIndexOf(",")
  )
  if (punct > 80) {
    return slice.slice(0, punct).trim()
  }
  const space = slice.lastIndexOf(" ")
  return (space > 80 ? slice.slice(0, space) : slice).trim()
}

function asSentence(text: string): string {
  if (!text) {
    return text
  }
  return text[0].toUpperCase() + text.slice(1)
}

export function slugFromName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
  return slug || "gruppo"
}

export function uniqueSlug({
  base,
  taken,
}: {
  base: string
  taken: Set<string>
}): string {
  if (!taken.has(base)) {
    return base
  }
  let n = 2
  while (taken.has(`${base}-${n}`)) {
    n += 1
  }
  return `${base}-${n}`
}

export function invitePath(token: string): string {
  return `/invite/${token}`
}

export function tokenFromInviteInput(raw: string): string {
  const trimmed = raw.trim()
  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split("/").filter(Boolean)
    if (parts[0] === "invite" && parts[1]) {
      return parts[1]
    }
  } catch {
    // not an absolute URL
  }
  const match = /\/invite\/([^/?#]+)/.exec(trimmed)
  if (match?.[1]) {
    return match[1]
  }
  return trimmed
}

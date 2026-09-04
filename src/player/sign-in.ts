export function signInHref(returnPathname?: string): string {
  if (!returnPathname) {
    return "/api/auth/sign-in"
  }
  return `/api/auth/sign-in?returnPathname=${encodeURIComponent(returnPathname)}`
}

// Only same-origin paths may be used as a post-sign-in destination.
export function safeReturnPathname(raw: string | null): string | undefined {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return undefined
  }
  if (raw.includes("\\") || /[\r\n]/.test(raw)) {
    return undefined
  }
  return raw
}

// Members of a Group see this name. Never the full email address.
export function accountNameFromUser(user: {
  firstName: string | null
  lastName: string | null
  email: string | null
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  if (name) {
    return name
  }
  const handle = user.email?.split("@")[0]?.trim()
  if (handle) {
    return handle
  }
  return "Giocatore"
}

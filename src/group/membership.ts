export type MemberRole = "owner" | "member"

export type GroupMember = {
  accountId: string
  role: MemberRole
  joinedAt: string
}

export function successorOwnerId({
  members,
  leavingId,
}: {
  members: GroupMember[]
  leavingId: string
}): string | undefined {
  const remaining = members.filter((member) => member.accountId !== leavingId)
  if (remaining.length === 0) {
    return undefined
  }
  const leaving = members.find((member) => member.accountId === leavingId)
  if (leaving?.role !== "owner") {
    return remaining.find((member) => member.role === "owner")?.accountId
  }
  return [...remaining].sort((a, b) => {
    if (a.joinedAt !== b.joinedAt) {
      return a.joinedAt < b.joinedAt ? -1 : 1
    }
    return a.accountId.localeCompare(b.accountId)
  })[0]?.accountId
}

export function joinDeniedReason({
  alreadyMember,
  blocked,
}: {
  alreadyMember: boolean
  blocked: boolean
}): "already" | "blocked" | undefined {
  if (alreadyMember) {
    return "already"
  }
  if (blocked) {
    return "blocked"
  }
  return undefined
}

import { and, eq, inArray } from "drizzle-orm"
import type { Db } from "../db/db"
import type { Play } from "../play/play"
import { accounts, plays } from "../player/schema"
import { GroupError } from "./error"
import { joinDeniedReason, successorOwnerId } from "./membership"
import type { MemberRole } from "./membership"
import { podium, rankMetric, PODIUM_METRICS } from "./ranking/podium"
import type { PodiumMetric, PodiumRow } from "./ranking/podium"
import { attemptsLabel, todayRanking } from "./ranking/today"
import type { TodayRow } from "./ranking/today"
import { groupBlocks, groupMembers, groups } from "./schema"
import { slugFromName, uniqueSlug } from "./slug"

export type GroupHubRow = {
  slug: string
  name: string
  memberCount: number
  isOwner: boolean
  streakPlace: number
  streakMemberCount: number
}

export type GroupTeaser = {
  slug: string
  name: string
  place: number
  attemptsLabel: string
}

export type GroupPage = {
  name: string
  slug: string
  inviteToken: string
  isOwner: boolean
  viewerAccountId: string
  today: TodayRow[]
  podiums: { metric: PodiumMetric; rows: PodiumRow[] }[]
  members: { accountId: string; name: string; role: MemberRole }[]
  blocked: { accountId: string; name: string }[]
}

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0]
type Conn = Db | Tx

type LensMember = {
  accountId: string
  name: string
  role: MemberRole
  joinedAt: Date
  plays: Play[]
}

const SLUG_ATTEMPTS = 3
const UNIQUE_VIOLATION = "23505"

export function createGroups({ db }: { db: Db }) {
  async function create({
    name,
    accountId,
  }: {
    name: string
    accountId: string
  }): Promise<{ slug: string }> {
    const trimmed = requireName(name)
    for (let attempt = 1; ; attempt++) {
      const taken = new Set(
        (await db.select({ slug: groups.slug }).from(groups)).map(
          (row) => row.slug
        )
      )
      const slug = uniqueSlug({ base: slugFromName(trimmed), taken })
      const id = crypto.randomUUID()
      try {
        await db.transaction(async (tx) => {
          await tx.insert(groups).values({
            id,
            name: trimmed,
            slug,
            inviteToken: crypto.randomUUID(),
          })
          await tx
            .insert(groupMembers)
            .values({ groupId: id, accountId, role: "owner" })
        })
        return { slug }
      } catch (error) {
        if (attempt >= SLUG_ATTEMPTS || !isUniqueViolation(error)) {
          throw error
        }
      }
    }
  }

  async function join({
    token,
    accountId,
  }: {
    token: string
    accountId: string
  }): Promise<{ slug: string }> {
    return db.transaction(async (tx) => {
      const [group] = await tx
        .select()
        .from(groups)
        .where(eq(groups.inviteToken, token))
        .for("update")
      if (!group) {
        throw new GroupError("Invito non valido")
      }
      const denied = joinDeniedReason({
        alreadyMember: Boolean(
          await membership(tx, { groupId: group.id, accountId })
        ),
        blocked: Boolean(await block(tx, { groupId: group.id, accountId })),
      })
      if (denied === "blocked") {
        throw new GroupError("Non puoi unirti a questo gruppo")
      }
      if (denied === undefined) {
        await tx
          .insert(groupMembers)
          .values({ groupId: group.id, accountId, role: "member" })
          .onConflictDoNothing()
      }
      return { slug: group.slug }
    })
  }

  async function leave({
    slug,
    accountId,
  }: {
    slug: string
    accountId: string
  }): Promise<void> {
    await db.transaction(async (tx) => {
      const group = await lockGroup(tx, slug)
      const members = await tx
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.groupId, group.id))
      if (!members.some((member) => member.accountId === accountId)) {
        throw new GroupError("Pagina non trovata")
      }
      const nextOwner = successorOwnerId({
        members: members.map((member) => ({
          accountId: member.accountId,
          role: member.role,
          joinedAt: member.joinedAt.toISOString(),
        })),
        leavingId: accountId,
      })
      if (!nextOwner) {
        await tx.delete(groups).where(eq(groups.id, group.id))
        return
      }
      if (nextOwner !== accountId) {
        await tx
          .update(groupMembers)
          .set({ role: "owner" })
          .where(memberKey({ groupId: group.id, accountId: nextOwner }))
      }
      await tx
        .delete(groupMembers)
        .where(memberKey({ groupId: group.id, accountId }))
    })
  }

  async function kick({
    slug,
    ownerId,
    accountId,
  }: {
    slug: string
    ownerId: string
    accountId: string
  }): Promise<void> {
    if (ownerId === accountId) {
      throw new GroupError("Non puoi escludere te stesso")
    }
    await db.transaction(async (tx) => {
      const group = await requireOwner(tx, { slug, accountId: ownerId })
      const target = await membership(tx, { groupId: group.id, accountId })
      if (!target) {
        throw new GroupError("Non è un membro")
      }
      await tx
        .delete(groupMembers)
        .where(memberKey({ groupId: group.id, accountId }))
      await tx
        .insert(groupBlocks)
        .values({ groupId: group.id, accountId })
        .onConflictDoNothing()
    })
  }

  async function pardon({
    slug,
    ownerId,
    accountId,
  }: {
    slug: string
    ownerId: string
    accountId: string
  }): Promise<void> {
    const group = await requireOwner(db, { slug, accountId: ownerId })
    await db
      .delete(groupBlocks)
      .where(
        and(
          eq(groupBlocks.groupId, group.id),
          eq(groupBlocks.accountId, accountId)
        )
      )
  }

  async function rotateInvite({
    slug,
    accountId,
  }: {
    slug: string
    accountId: string
  }): Promise<string> {
    const group = await requireOwner(db, { slug, accountId })
    const inviteToken = crypto.randomUUID()
    await db.update(groups).set({ inviteToken }).where(eq(groups.id, group.id))
    return inviteToken
  }

  async function rename({
    slug,
    accountId,
    name,
  }: {
    slug: string
    accountId: string
    name: string
  }): Promise<void> {
    const trimmed = requireName(name)
    const group = await requireOwner(db, { slug, accountId })
    await db
      .update(groups)
      .set({ name: trimmed })
      .where(eq(groups.id, group.id))
  }

  async function remove({
    slug,
    accountId,
  }: {
    slug: string
    accountId: string
  }): Promise<void> {
    const group = await requireOwner(db, { slug, accountId })
    await db.delete(groups).where(eq(groups.id, group.id))
  }

  async function listHub({
    accountId,
    today,
  }: {
    accountId: string
    today: string
  }): Promise<GroupHubRow[]> {
    const mine = await myGroups(accountId)
    const lenses = await lensesOf({ groupIds: mine.map((group) => group.id) })
    return mine
      .map((group) => {
        const members = lenses.get(group.id) ?? []
        const rows = rankMetric({
          members,
          today,
          metric: "currentStreak",
        })
        return {
          slug: group.slug,
          name: group.name,
          memberCount: members.length,
          isOwner: group.role === "owner",
          streakPlace: viewerPlace({ rows, accountId }),
          streakMemberCount: members.length,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name, "it"))
  }

  async function teasers({
    accountId,
    today,
  }: {
    accountId: string
    today: string
  }): Promise<GroupTeaser[]> {
    const mine = await myGroups(accountId)
    const lenses = await lensesOf({
      groupIds: mine.map((group) => group.id),
      gameDay: today,
    })
    return mine.map((group) => {
      const rows = todayRanking({
        members: todayMembers({ members: lenses.get(group.id) ?? [], today }),
      })
      const viewer = rows.find((row) => row.accountId === accountId)
      return {
        slug: group.slug,
        name: group.name,
        place: viewerPlace({ rows, accountId }),
        attemptsLabel:
          viewer?.attemptsLabel ?? attemptsLabel({ play: undefined }),
      }
    })
  }

  async function page({
    slug,
    accountId,
    today,
  }: {
    slug: string
    accountId: string
    today: string
  }): Promise<GroupPage> {
    const group = await requireMembership(db, { slug, accountId })
    const [lenses, blocked] = await Promise.all([
      lensesOf({ groupIds: [group.id] }),
      blockedOf(group.id),
    ])
    const members = lenses.get(group.id) ?? []
    return {
      name: group.name,
      slug: group.slug,
      inviteToken: group.inviteToken,
      isOwner: members.some(
        (member) => member.accountId === accountId && member.role === "owner"
      ),
      viewerAccountId: accountId,
      today: todayRanking({ members: todayMembers({ members, today }) }),
      podiums: PODIUM_METRICS.map((metric) => ({
        metric,
        rows: podium({ members, today, metric }),
      })),
      members: members
        .map((member) => ({
          accountId: member.accountId,
          name: member.name,
          role: member.role,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "it")),
      blocked,
    }
  }

  async function myGroups(accountId: string) {
    return db
      .select({
        id: groups.id,
        name: groups.name,
        slug: groups.slug,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.accountId, accountId))
  }

  // One round-trip for Members, one for their Plays, however many Groups.
  async function lensesOf({
    groupIds,
    gameDay,
  }: {
    groupIds: string[]
    gameDay?: string
  }): Promise<Map<string, LensMember[]>> {
    const lenses = new Map<string, LensMember[]>()
    if (groupIds.length === 0) {
      return lenses
    }
    const memberRows = await db
      .select({
        groupId: groupMembers.groupId,
        accountId: groupMembers.accountId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        name: accounts.name,
      })
      .from(groupMembers)
      .innerJoin(accounts, eq(accounts.id, groupMembers.accountId))
      .where(inArray(groupMembers.groupId, groupIds))
    const accountIds = [...new Set(memberRows.map((row) => row.accountId))]
    const playRows =
      accountIds.length === 0
        ? []
        : await db
            .select()
            .from(plays)
            .where(
              and(
                inArray(plays.accountId, accountIds),
                gameDay === undefined ? undefined : eq(plays.gameDay, gameDay)
              )
            )
    const playsByAccount = new Map<string, Play[]>()
    for (const row of playRows) {
      const list = playsByAccount.get(row.accountId) ?? []
      list.push({
        gameDay: row.gameDay,
        puzzle: row.puzzle,
        guesses: row.guesses,
        evaluations: row.evaluations,
        status: row.status,
        hardMode: row.hardMode,
      })
      playsByAccount.set(row.accountId, list)
    }
    for (const row of memberRows) {
      const list = lenses.get(row.groupId) ?? []
      list.push({
        accountId: row.accountId,
        name: displayName(row.name),
        role: row.role,
        joinedAt: row.joinedAt,
        plays: playsByAccount.get(row.accountId) ?? [],
      })
      lenses.set(row.groupId, list)
    }
    return lenses
  }

  async function blockedOf(groupId: string) {
    const rows = await db
      .select({ accountId: groupBlocks.accountId, name: accounts.name })
      .from(groupBlocks)
      .innerJoin(accounts, eq(accounts.id, groupBlocks.accountId))
      .where(eq(groupBlocks.groupId, groupId))
    return rows
      .map((row) => ({ accountId: row.accountId, name: displayName(row.name) }))
      .sort((a, b) => a.name.localeCompare(b.name, "it"))
  }

  return {
    create,
    join,
    leave,
    kick,
    pardon,
    rotateInvite,
    rename,
    remove,
    listHub,
    teasers,
    page,
  }
}

async function lockGroup(tx: Tx, slug: string) {
  const [group] = await tx
    .select()
    .from(groups)
    .where(eq(groups.slug, slug))
    .for("update")
  if (!group) {
    throw new GroupError("Pagina non trovata")
  }
  return group
}

async function requireMembership(
  conn: Conn,
  { slug, accountId }: { slug: string; accountId: string }
) {
  const [group] = await conn.select().from(groups).where(eq(groups.slug, slug))
  if (!group) {
    throw new GroupError("Pagina non trovata")
  }
  const mine = await membership(conn, { groupId: group.id, accountId })
  if (!mine) {
    throw new GroupError("Pagina non trovata")
  }
  return { ...group, role: mine.role }
}

async function requireOwner(
  conn: Conn,
  { slug, accountId }: { slug: string; accountId: string }
) {
  const group = await requireMembership(conn, { slug, accountId })
  if (group.role !== "owner") {
    throw new GroupError("Solo il proprietario può farlo")
  }
  return group
}

async function membership(
  conn: Conn,
  key: { groupId: string; accountId: string }
) {
  const [row] = await conn.select().from(groupMembers).where(memberKey(key))
  return row
}

async function block(
  conn: Conn,
  { groupId, accountId }: { groupId: string; accountId: string }
) {
  const [row] = await conn
    .select()
    .from(groupBlocks)
    .where(
      and(
        eq(groupBlocks.groupId, groupId),
        eq(groupBlocks.accountId, accountId)
      )
    )
  return row
}

function memberKey({
  groupId,
  accountId,
}: {
  groupId: string
  accountId: string
}) {
  return and(
    eq(groupMembers.groupId, groupId),
    eq(groupMembers.accountId, accountId)
  )
}

function todayMembers({
  members,
  today,
}: {
  members: LensMember[]
  today: string
}) {
  return members.map((member) => ({
    accountId: member.accountId,
    name: member.name,
    play: member.plays.find((play) => play.gameDay === today),
  }))
}

// A viewer missing from the ranking sits last.
function viewerPlace({
  rows,
  accountId,
}: {
  rows: { accountId: string; place: number }[]
  accountId: string
}): number {
  return rows.find((row) => row.accountId === accountId)?.place ?? rows.length
}

function requireName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new GroupError("Dai un nome al gruppo")
  }
  return trimmed
}

function displayName(name: string | null): string {
  return name || "Giocatore"
}

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error
  while (current instanceof Error) {
    if ((current as { code?: unknown }).code === UNIQUE_VIOLATION) {
      return true
    }
    current = current.cause
  }
  return false
}

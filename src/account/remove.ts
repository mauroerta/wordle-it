import { and, eq } from "drizzle-orm"
import type { Db } from "../db/db"
import { groupBlocks, groupMembers, groups } from "../group/schema"
import { successorOwnerId } from "../group/membership"
import {
  accountNotificationPrefs,
  pushSubscriptions,
} from "../notification/schema"
import { accounts, plays } from "../player/schema"

export async function removeAccountData({
  db,
  accountId,
}: {
  db: Db
  accountId: string
}): Promise<void> {
  await db.transaction(async (tx) => {
    const [account] = await tx
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .for("update")
    if (!account) {
      return
    }

    const memberships = await tx
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.accountId, accountId))

    for (const membership of memberships) {
      const [group] = await tx
        .select({ id: groups.id })
        .from(groups)
        .where(eq(groups.id, membership.groupId))
        .for("update")
      if (!group) {
        continue
      }

      const members = await tx
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.groupId, group.id))
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
        continue
      }
      if (nextOwner !== accountId) {
        await tx
          .update(groupMembers)
          .set({ role: "owner" })
          .where(
            and(
              eq(groupMembers.groupId, group.id),
              eq(groupMembers.accountId, nextOwner)
            )
          )
      }
    }

    await tx.delete(groupBlocks).where(eq(groupBlocks.accountId, accountId))
    await tx.delete(groupMembers).where(eq(groupMembers.accountId, accountId))
    await tx
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.accountId, accountId))
    await tx
      .delete(accountNotificationPrefs)
      .where(eq(accountNotificationPrefs.accountId, accountId))
    await tx.delete(plays).where(eq(plays.accountId, accountId))
    await tx.delete(accounts).where(eq(accounts.id, accountId))
  })
}

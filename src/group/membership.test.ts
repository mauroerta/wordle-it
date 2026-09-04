import { describe, expect, test } from "vitest"
import { joinDeniedReason, successorOwnerId } from "./membership"

describe("successorOwnerId", () => {
  test("passes ownership to the longest-standing remaining Member", () => {
    expect(
      successorOwnerId({
        leavingId: "owner",
        members: [
          {
            accountId: "owner",
            role: "owner",
            joinedAt: "2026-01-01T00:00:00Z",
          },
          {
            accountId: "late",
            role: "member",
            joinedAt: "2026-03-01T00:00:00Z",
          },
          {
            accountId: "early",
            role: "member",
            joinedAt: "2026-02-01T00:00:00Z",
          },
        ],
      })
    ).toBe("early")
  })

  test("deletes the Group when the last Member leaves", () => {
    expect(
      successorOwnerId({
        leavingId: "owner",
        members: [
          {
            accountId: "owner",
            role: "owner",
            joinedAt: "2026-01-01T00:00:00Z",
          },
        ],
      })
    ).toBeUndefined()
  })
})

describe("joinDeniedReason", () => {
  test("blocks a kicked Account even when the Invite is unchanged", () => {
    expect(joinDeniedReason({ alreadyMember: false, blocked: true })).toBe(
      "blocked"
    )
  })
})

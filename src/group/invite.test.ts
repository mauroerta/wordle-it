import { describe, expect, test } from "vitest"
import { tokenFromInviteInput } from "./invite"

describe("tokenFromInviteInput", () => {
  test("accepts a full Invite URL or a bare token", () => {
    expect(
      tokenFromInviteInput("https://parle.example/invite/abc123?x=1")
    ).toBe("abc123")
    expect(tokenFromInviteInput("abc123")).toBe("abc123")
  })
})
